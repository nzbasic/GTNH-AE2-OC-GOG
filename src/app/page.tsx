import { createClient } from "@/util/supabase/server";
import React from "react";
import { fetchCPUs, fetchLatestType, fetchStats } from "@/util/supabase/fetch";
import { cookies } from "next/headers";
import dynamic from 'next/dynamic'
import CraftingStatus from "@/components/crafting-status";
import { clean } from "@/util/supabase/clean";
import { getMCName, login } from "@/util/supabase/auth";
import Stats from "@/components/stats";

const DynamicFavourites = dynamic(() => import('@/components/favourites'), {
    ssr: false,
})

const DynamicDualItemsTable = dynamic(() => import('@/components/dual-items-table'), {
    ssr: false,
})

export const revalidate = 10;

export default async function Home({ searchParams: { code } }: { searchParams: { code?: string } }) {
    const cookieStore = cookies();
    const client = createClient(cookieStore);

    if (code) {
        await getMCName(code)
    }

    const all = await Promise.all([
        fetchLatestType(client, "items"),
        fetchCPUs(client),
        fetchStats(client)
    ])

    const network = all[0];
    const cpus = all[1];
    const stats = all[2];

    const items = network?.items ?? [];
    const fluids = network?.fluids ?? [];

    if (!items || !items.length || !stats) {
        return (
            <div>
                There was a problem loading the items. Please try again later.
            </div>
        )
    }

    return (
        <>
            {/* <form>
                <Button formAction={login}>Login</Button>
            </form> */}

            <Stats initialData={stats} />

            <CraftingStatus initialData={cpus} />

            <DynamicFavourites  />

            <DynamicDualItemsTable initials={{ items, fluids }} />
        </>
    );
}
