import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

// POST /api/lsc
// Called by OC to track lsc power
export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body = await req.json();

        const power = {
            eu: parseInt(body?.eu),
            euIn: parseInt(body?.euIn),
            euOut: parseInt(body?.euOut),
        }

        if (!Number.isNaN(power.eu)) {
            const client = await createAdminClient();
            await client.from('lsc').insert(power);
        }

        return NextResponse.json('ok');
    } catch(e: any) {
        return NextResponse.json(e?.message, { status: 500 });
    }
}
