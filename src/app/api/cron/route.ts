import { clean } from "@/util/supabase/clean";
import { NextRequest, NextResponse } from "next/server";

// POST /api/cron - Called by vercel cron
export async function POST(req: NextRequest, res: NextResponse) {
    await clean();
    return NextResponse.json('ok');
}
