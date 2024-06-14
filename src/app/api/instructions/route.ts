import { Instruction } from "@/types/supabase";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

// GET /api/instructions
// Get all instructions
export async function GET(req: NextRequest) {
    const client = await createAdminClient();
    const instructions = await client.from('instructions').select('*').eq('status', 'awaiting-assignment');

    const data: Instruction[] = instructions.data ?? []
    const mapped = data.map(request => ({
        item: request.data.item,
        quantity: request.data.quantity,
    }));

    // convert to object with index as keys
    // const object = mapped.reduce((acc, cur, i) => ({ ...acc, [i]: cur }), {});

    return new Response(JSON.stringify(mapped), { headers: { 'content-type': 'application/json' } });
}

// POST /api/instructions
// Create a new instruction
export async function POST(req: NextRequest, res: NextResponse) {
    return new Response('Hello world!');
}
