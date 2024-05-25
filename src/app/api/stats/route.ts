
import { OCItems, OCStats } from "@/types/oc";
import { clean } from "@/util/supabase/clean";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body: OCStats = await req.json();

        const cpus = body.cpus;
        const avg_power_injection = body.avgPowerInjection;
        const stored_power = body.storedPower;
        const avg_power_use = body.avgPowerUsage;

        const client = await createAdminClient();

        const insert = await client.from("inserts").insert({ type: "stats" }).select("id");
        if (!insert.data) {
            return NextResponse.json('Failed to create insert', { status: 500 });
        }

        const insert_id = insert.data[0].id;

        await client.from("stats").insert({ avg_power_injection, stored_power, avg_power_use, insert_id });
        await client.from("cpus").insert(cpus.map(cpu => ({
            name: cpu.name,
            busy: cpu.busy,
            final_output: cpu.finalOutput,
            pending_items: cpu.pendingItems,
            active_items: cpu.activeItems,
            stored_items: cpu.storedItems,
            storage: cpu.storage,
            insert_id,
        })));

        try {
            await clean()
        } catch(e) {
            console.error(e);
        }

        return NextResponse.json('ok');
    } catch(e: any) {
        return NextResponse.json(e?.message, { status: 500 });
    }
}
