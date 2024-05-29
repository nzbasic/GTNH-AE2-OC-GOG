import { NextRequest, NextResponse } from "next/server";

// GET /api/instructions/{id}
// Get an instruction
export async function GET(req: NextRequest) {
    return new Response('Hello world!');
}

// PUT /api/instructions/{id}
// Update an instruction
export async function POST(req: NextRequest, res: NextResponse) {
    return new Response('Hello world!');
}
