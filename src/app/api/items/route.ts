import { OCItems } from "@/types/oc";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// POST /api/items
// Called by OC to track items
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
        const insert = await client.from('inserts').insert({ type: "items" }).select("id");
        if (!insert.data) {
            return NextResponse.json('Failed to create insert', { status: 500 });
        }

        const insert_id = insert.data[0].id;

        await client.from('items').insert(items.map(item => ({ ...item, insert_id })));

        return NextResponse.json('ok');
    } catch(e: any) {
        return NextResponse.json(e?.message, { status: 500 });
    }
}
