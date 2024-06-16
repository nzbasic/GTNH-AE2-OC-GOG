import { createClient } from "@/util/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // The `/auth/callback` route is required for the server-side auth flow implemented
    // by the SSR package. It exchanges an auth code for the user's session.
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (code) {
        const client = createClient();
        const { data, error } = await client.auth.exchangeCodeForSession(code);

        if (!error) {
            const user = await client.auth.getUser(data.session.access_token);
            const uid = user.data.user?.id

            const mcAuth = await client.from('mc_auth').select('*').eq('uid', uid).single();
            const username = mcAuth.data?.username

            // @ts-ignore
            if (!username) {
                return NextResponse.redirect(`${origin}/auth/minecraft`)
            }
        }
    }

    // URL to redirect to after sign up process completes
    return NextResponse.redirect(`${origin}`);
}
