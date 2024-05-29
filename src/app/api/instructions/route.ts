import { NextRequest, NextResponse } from "next/server";

// GET /api/instructions
// Get all instructions
export async function GET(req: NextRequest) {
    return new Response('Hello world!');
}

// POST /api/instructions
// Create a new instruction
export async function POST(req: NextRequest, res: NextResponse) {
    return new Response('Hello world!');
}
