import React from "react";
import dynamic from 'next/dynamic'
import CraftingStatus from "@/components/stats/crafting-status";
import Stats from "@/components/stats/stats";
import SavedCraftsTable from "@/components/stats/saved-crafts";
import { getCpusCached, getHomeCached } from "@/util/cache";

const DynamicFavourites = dynamic(() => import('@/components/stats/favourites'), {
    ssr: false,
})

const DynamicDualItemsTable = dynamic(() => import('@/components/stats/dual-items-table'), {
    ssr: false,
})

const DynamicOrderItem = dynamic(() => import('@/components/order-item'), {
    ssr: false,
})

export const revalidate = 60;
export const maxDuration = 60

export default async function Home() {
    const all = await getHomeCached();

    const network = all[0];
    const stats = all[1];
    const savedCrafts = all[2];
    const craftables = all[3];

    const cpus = await getCpusCached();

    const items = network?.items ?? [];
    const fluids = network?.fluids ?? [];

    if (!items || !stats) {
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
