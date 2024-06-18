
import { createBrowserClient } from "@supabase/ssr";
import { createFetch } from "./next";
import { unstable_noStore as noStore } from "next/cache";

export const createClient = () => {
    noStore();
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: { fetch: createFetch({ next: { revalidate: 0 }, cache: "no-store" }) } },
    );
}
