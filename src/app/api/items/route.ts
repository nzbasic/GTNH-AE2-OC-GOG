import { OCItems } from "@/types/oc";
import { clean } from "@/util/supabase/clean";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";
import { WebhookClient } from 'discord.js';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body: OCItems = await req.json();

        // comes as a string
        // name~quantity~craftable;
        // const items = body.split(';').map(item => {
        //     const [item_name, quantity, craftable] = item.split('~');

        //     if (!item_name || !quantity) {
        //         return false
        //     }

        //     return {
        //         item_name,
        //         quantity
        //     }
        // }).filter(Boolean);
        //

        const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1244199814279729284/iU5e_AlfqAk0VO71RXdc7HG6ITnewUa6uV6ua2bgMDJcwCPGT3hZOvEVqTzqszlJV18F' })
        webhook.send("test " + body['drop of Cetane-Boosted Diesel']);

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

        await clean();

        return NextResponse.json('ok');
    } catch(e: any) {
        return NextResponse.json(e?.message, { status: 500 });
    }
}
