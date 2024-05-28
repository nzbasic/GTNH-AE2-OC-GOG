
import { createBrowserClient } from "@supabase/ssr";
import { createFetch } from "./next";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: createFetch({ next: {  revalidate: 10 } })}}
  );
