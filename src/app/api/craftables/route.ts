import { OCCraftables } from "@/types/oc";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

// POST /api/craftables
// Called by OC to show craftable items
export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body: OCCraftables = await req.json();
        const items = Object.values(body)

        const client = await createAdminClient();
        const { data, error } = await client.from('craftables').select("*");
        const craftables = data ?? [];

        const toInsert = items.filter(item => !craftables.find(craftable => craftable.item_name === item));
        const toDelete = craftables.filter(craftable => !items.find(item => item === craftable.item_name));

        await client.from('craftables').delete().in('item_name', toDelete);
        await client.from('craftables').insert(toInsert.map(item => ({ item_name: item })));

        return NextResponse.json('ok');
    } catch(e: any) {
        return NextResponse.json(e?.message, { status: 500 });
    }
}
