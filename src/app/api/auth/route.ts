import { OCItems } from "@/types/oc";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body: OCItems = await req.json();

        const names = Object.values(body);

        const client = await createAdminClient();
        await client.from("auth").delete().neq("id", 0)
        await client.from('auth').insert(names.map(username => ({ username })));

        return NextResponse.json('ok');
    } catch(e: any) {
        return NextResponse.json(e?.message, { status: 500 });
    }
}
