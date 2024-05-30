import { OCItems, OCMachines } from "@/types/oc";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

// POST /api/machines
// Called by OC to track machines
export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body: OCMachines = await req.json();

        if (!body.machines) return NextResponse.json('ok')
        const addressNameMap = body.names;

        const map = new Map<string, {
            x: number;
            y: number;
            z: number;
            name: string;
            history: {
                time: number;
                active: boolean;
                hasWork: boolean;
            }[];
        }>();

        for (const addresses of body.machines) {
            Object.entries(addresses).forEach(([address, data]) => {
                const existing = map.get(address);
                if (existing) {
                    existing.history.push({
                        time: data.time,
                        active: data.active,
                        hasWork: data.hasWork
                    });
                } else {
                    map.set(address, {
                        x: data.x,
                        y: data.y,
                        z: data.z,
                        name: addressNameMap[address],
                        history: [{
                            time: data.time,
                            active: data.active,
                            hasWork: data.hasWork
                        }]
                    });
                }
            });
        }

        const output = [...map.entries()].map(([address, data]) => {
            return {
                address,
                ...data,
            }
        });

        const client = await createAdminClient();
        await client.from('machines').delete().neq('id', 0);
        await client.from('machines').insert(output);

        return NextResponse.json('ok');
    } catch(e: any) {
        return NextResponse.json(e?.message, { status: 500 });
    }
}
