
import { OCStats } from "@/types/oc";
import { CPUItem } from "@/types/supabase";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

function mapStringToItems(string: string): CPUItem[] {
    if (!string) return [];
    if (string == '') return [];

    // form = "item_name~quantity;"
    const items = string.split(";")?.map(item => {
        const [item_name, quantity] = item.split("~");
        return { item_name, quantity: parseInt(quantity) };
    }) ?? [];

    return items.filter(i => i.item_name);
}

// POST /api/stats
// Called by OC to track stats and CPUs
export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body: OCStats = await req.json();

        const networkData = body.network;
        const lscData = body.lsc;
        const tpsData = body.tps;

        if (!networkData || !lscData || !tpsData) return NextResponse.json('Missing data', { status: 400 })

        const cpus = networkData.cpus;
        // const avg_power_injection = networkData.avgPowerInjection;
        // const stored_power = networkData.storedPower;
        // const avg_power_use = networkData.avgPowerUsage;

        const tps = tpsData.tps;
        const mspt = tpsData.mspt;

        const eu = lscData.eu;
        const euIn = lscData.euIn;
        const euOut = lscData.euOut;

        const client = await createAdminClient();

        const insert = await client.from("inserts").insert({ type: "stats" }).select("id");
        if (!insert.data) {
            console.log('Failed to create insert');
            return NextResponse.json('Failed to create insert', { status: 500 });
        }

        const insert_id = insert.data[0].id;

        await client.from("stats").insert({
            insert_id,
            tps,
            mspt,
            eu,
            euIn,
            euOut,
        });

        const cpuRes = await client.from("cpus").select("*");
        const cpuData = cpuRes.data ?? [];

        const mappedCPUs = cpus.map(cpu => ({
            name: cpu.name,
            busy: cpu.busy,
            final_output: typeof cpu.finalOutput === "string" ? mapStringToItems(cpu.finalOutput)[0] : cpu.finalOutput,
            pending_items: typeof cpu.pendingItems === "string" ? mapStringToItems(cpu.pendingItems) : cpu.pendingItems,
            active_items: typeof cpu.activeItems === "string" ? mapStringToItems(cpu.activeItems) : cpu.activeItems,
            stored_items: typeof cpu.storedItems === "string" ? mapStringToItems(cpu.storedItems) : cpu.storedItems,
            storage: cpu.storage,
        }));

        const toInsert = mappedCPUs.filter(cpu => !cpuData.find(c => c.name === cpu.name));
        const toUpdate = mappedCPUs.filter(cpu => cpuData.find(c => c.name === cpu.name));
        const toDelete = cpuData.filter(cpu => !mappedCPUs.find(c => c.name === cpu.name));

        await client.from("cpus").insert(toInsert);
        await Promise.all(toUpdate.map(async cpu => {
            const existing = cpuData.find(c => c.name === cpu.name);
            if (!existing) return;
            const id = existing.id;
            await client.from("cpus").update({
                ...cpu,
                final_output: cpu.final_output ?? null,
            }).match({ id });
        }));

        await Promise.all(toDelete.map(async cpu => {
            const id = cpu.id;
            await client.from("cpus").delete().match({ id });
        }));

        // cpus which are active
        const filtered = mappedCPUs.filter(cpu => cpu.final_output);

        // first, set any "crafts" that are no longer active to ended_at'
        const currentCraftsRes = await client.from("crafts").select("*").is('ended_at', null);
        const currentCrafts = currentCraftsRes.data ?? [];

        for (const craft of currentCrafts) {
            const cpu = filtered.find(c => c.final_output.item_name === craft.item_name && c.name === craft.cpu_name);
            if (!cpu) {
                const { error } = await client.from("crafts").update({ ended_at: new Date().toISOString() }).match({ id: craft.id });
                if (error) console.log(error);
            }
        }

        // remove all duplicates with the same item_name + cpu_name
        const noDuplicates = filtered.reduce((acc, cpu) => {
            const finalOutput = cpu.final_output;
            const item_name = finalOutput.item_name;
            const quantity = finalOutput.quantity;

            const existing = acc.find(c => {
                return c.final_output.item_name === item_name && c.name === cpu.name
            });
            if (!existing) {
                acc.push(cpu);
            }
            return acc;
        }, [] as typeof mappedCPUs);

        for (const cpu of noDuplicates) {
            // find or create an associated craft row
            const craftRes = await client
                .from("crafts")
                .select("*")
                .is('ended_at', null)
                .eq('item_name', cpu.final_output.item_name)
                .eq('cpu_name', cpu.name);

            if (craftRes.error) console.log(craftRes.error);

            const craftData = craftRes.data ?? [];
            const craft = craftData[0];
            let id: number | undefined = craft?.id

            if (!craft) {
                const res = await client.from("crafts").insert({
                    item_name: cpu.final_output.item_name,
                    quantity: cpu.final_output.quantity,
                    cpu_name: cpu.name,
                }).select("*");

                if (res.error) console.log(res.error);

                id = res.data?.[0]?.id;
            }

            if (id) {
                // merge active_items, stored_items, and pending_items into a single array with item_name, active_quantity, stored_quantity, and pending_quantity
                const itemMap = new Map<string, { active_count: number, stored_count: number, pending_count: number }>();

                cpu.active_items.forEach(item => {
                    if (!item?.item_name) return;
                    const item_name = item.item_name.toString();
                    const existing = itemMap.get(item_name);
                    if (existing) {
                        existing.active_count += item.quantity;
                    } else {
                        itemMap.set(item_name, { active_count: item.quantity, stored_count: 0, pending_count: 0 });
                    }
                });

                cpu.stored_items.forEach(item => {
                    if (!item?.item_name) return;
                    const item_name = item.item_name.toString();
                    const existing = itemMap.get(item_name);
                    if (existing) {
                        existing.stored_count += item.quantity;
                    } else {
                        itemMap.set(item_name, { active_count: 0, stored_count: item.quantity, pending_count: 0 });
                    }
                });

                cpu.pending_items.forEach(item => {
                    if (!item?.item_name) return;
                    const item_name = item.item_name.toString();
                    const existing = itemMap.get(item_name);
                    if (existing) {
                        existing.pending_count += item.quantity;
                    } else {
                        itemMap.set(item_name, { active_count: 0, stored_count: 0, pending_count: item.quantity });
                    }
                });

                // from name => stats to item_name, ...stats
                const itemArray = Array.from(itemMap).map(([item_name, stats]) => ({ item_name, craft_id: id, ...stats }));

                const filteredItems = itemArray.filter(item => item.pending_count > 0 || item.active_count > 0);
                const zeroItems = itemArray.filter(item => item.pending_count === 0 && item.active_count === 0);

                const { error } = await client.from("item_crafting_status").insert(filteredItems);

                // upsert zeros with condition so that we don't store multiple zeros
                await client.from("item_crafting_status").upsert(zeroItems, { onConflict: 'item_name, pending_count, active_count, craft_id' });

                if (error) console.log(error);
            }
        }

        const instructionRes = await client.from("instructions").select("*").eq('status', 'crafting');
        const instructionData = instructionRes.data ?? [];

        // if there is an active instruction row with no matching final output, update it to completed
        for (const instruction of instructionData) {
            const data = instruction.data;
            const item_name = data.item_name;
            const quantity = data.quantity;

            const existing = noDuplicates.find(cpu => cpu.final_output.item_name === item_name);
            if (!existing) {
                const { error } = await client.from("instructions").update({ status: 'done' }).match({ id: instruction.id });
                if (error) console.log(error);
            }
        }

        return NextResponse.json('ok');
    } catch(e: any) {
        console.log(e);
        return NextResponse.json(e?.message, { status: 500 });
    }
}
