import { createClient } from "@/util/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // The `/auth/callback` route is required for the server-side auth flow implemented
    // by the SSR package. It exchanges an auth code for the user's session.
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    console.log('callback called', code, requestUrl.searchParams)

    if (code) {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        console.log(error);
        console.log(data);
    }

    // URL to redirect to after sign up process completes
    return NextResponse.redirect(`${origin}`);
}
