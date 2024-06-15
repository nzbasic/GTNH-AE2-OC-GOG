
import { OCItems, OCStats } from "@/types/oc";
import { CPUItem, CPURow, ParsedCPURow } from "@/types/supabase";
import { clean } from "@/util/supabase/clean";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

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

        if (!networkData || !lscData || !tpsData) return NextResponse.json('Missing data', { status: 400 });

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
            await client.from("cpus").update(cpu).match({ id });
        }));

        await Promise.all(toDelete.map(async cpu => {
            const id = cpu.id;
            await client.from("cpus").delete().match({ id });
        }));

        return NextResponse.json('ok');
    } catch(e: any) {
        return NextResponse.json(e?.message, { status: 500 });
    }
}
