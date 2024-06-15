import React from "react";
import { fetchCPUs, fetchLatestType, fetchStats } from "@/util/supabase/fetch";
import dynamic from 'next/dynamic'
import CraftingStatus from "@/components/crafting-status";
import Stats from "@/components/stats";
import { createAdminClient } from "@/util/supabase/service_worker";

const DynamicFavourites = dynamic(() => import('@/components/favourites'), {
    ssr: false,
})

const DynamicDualItemsTable = dynamic(() => import('@/components/dual-items-table'), {
    ssr: false,
})

export const revalidate = 60;

export default async function Home() {
    const client = await createAdminClient();

    const all = await Promise.all([
        fetchLatestType(client, "items"),
        fetchCPUs(client),
        fetchStats(client)
    ]);

    const network = all[0];
    const cpus = all[1];
    const stats = all[2];

    const items = network?.items ?? [];
    const fluids = network?.fluids ?? [];

    // clean();

    if (!items || !items.length || !stats) {
        if (!items) console.error('items is missing')
        if (!stats) console.error('stats is missing')
        console.error('there was a problem')
        return (
            <div>
                There was a problem loading the items. Please try again later.
            </div>
        )
    }

    return (
        <>
            {/* <Auth /> */}

            <Stats initialData={stats} />

            <CraftingStatus initialData={cpus} />

            <DynamicFavourites  />

            <DynamicDualItemsTable initials={{ items, fluids }} />
        </>
    );
}
