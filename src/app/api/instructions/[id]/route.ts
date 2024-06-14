import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/util/supabase/service_worker";

// GET /api/instructions/{id}
// Get an instruction
export async function GET(req: NextRequest) {
    return new Response('Hello world!');
}

// PUT /api/instructions/{id}
// Update an instruction
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    const client = await createAdminClient();

    const body = await req.json();

    await client.from('instructions').update(body).eq('id', context.params.id);

    return new Response('ok');
}
