import React from "react";
import { fetchCPUs, fetchCraftables, fetchLatestType, fetchSavedCrafts, fetchStats } from "@/util/supabase/fetch";
import dynamic from 'next/dynamic'
import CraftingStatus from "@/components/crafting-status";
import Stats from "@/components/stats";
import { createAdminClient } from "@/util/supabase/service_worker";
import SavedCraftsTable from "@/components/saved-crafts";

const DynamicFavourites = dynamic(() => import('@/components/favourites'), {
    ssr: false,
})

const DynamicDualItemsTable = dynamic(() => import('@/components/dual-items-table'), {
    ssr: false,
})

const DynamicOrderItem = dynamic(() => import('@/components/order-item'), {
    ssr: false,
})

export const revalidate = 60;

export default async function Home() {
    const client = await createAdminClient();

    const all = await Promise.all([
        fetchLatestType(client, "items"),
        fetchCPUs(client),
        fetchStats(client),
        fetchSavedCrafts(client),
        fetchCraftables(client),
    ]);

    const network = all[0];
    const cpus = all[1];
    const stats = all[2];
    const savedCrafts = all[3];
    const craftables = all[4];

    const items = network?.items ?? [];
    const fluids = network?.fluids ?? [];

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
            <Stats initialData={stats} />

            <DynamicOrderItem initialData={craftables} />

            <CraftingStatus initialData={cpus} />

            <SavedCraftsTable initialData={savedCrafts} />

            <DynamicFavourites  />

            <DynamicDualItemsTable initials={{ items, fluids }} />
        </>
    );
}
