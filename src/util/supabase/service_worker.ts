import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { createFetch } from "./next";

export async function createAdminClient() {
    "use server"

    noStore();

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            global: { fetch: createFetch({ cache: 'no-store' }) },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        }
    );
};
