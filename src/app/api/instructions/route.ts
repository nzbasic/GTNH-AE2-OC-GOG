import { createClient } from "@/util/supabase/server";
import { createAdminClient } from "@/util/supabase/service_worker";
import { NextRequest, NextResponse } from "next/server";

// GET /api/instructions
// Get all instructions
export async function GET(req: NextRequest) {
    const client = await createAdminClient();
    const instructions = await client.from('instructions').select('*').eq('status', 'awaiting-assignment');
    return new Response(JSON.stringify(instructions), { headers: { 'content-type': 'application/json' } });
}

// POST /api/instructions
// Create a new instruction
export async function POST(req: NextRequest, res: NextResponse) {
    return new Response('Hello world!');
}
