import React from "react";
import dynamic from 'next/dynamic'
import CraftingStatus from "@/components/crafting-status";
import Stats from "@/components/stats";
import SavedCraftsTable from "@/components/saved-crafts";
import { getCpusCached, getHomeCached } from "@/util/cache";

const DynamicFavourites = dynamic(() => import('@/components/favourites'), {
    ssr: false,
})

const DynamicDualItemsTable = dynamic(() => import('@/components/dual-items-table'), {
    ssr: false,
})

const DynamicOrderItem = dynamic(() => import('@/components/order-item'), {
    ssr: false,
})

export const revalidate = false
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
