import { OCItems } from "@/types/oc";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

// POST /api/craftables
// Called by OC to show craftable items
export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body: OCItems = await req.json();

        const keys = [...(new Set(Object.keys(body)))];

        const items = keys.map(key => {
            return {
                item_name: key,
                quantity: body[key]
            }
        });

        const client = await createAdminClient();
        await client.from('craftables').delete().neq('id', 0);
        await client.from('craftables').insert(items);

        return NextResponse.json('ok');
    } catch(e: any) {
        return NextResponse.json(e?.message, { status: 500 });
    }
}
