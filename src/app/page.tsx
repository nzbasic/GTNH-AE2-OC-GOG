import { createClient } from "@/util/supabase/server";
import React from "react";
import { fetchLatestType } from "@/util/supabase/fetch";
import { cookies } from "next/headers";

import dynamic from 'next/dynamic'
import CraftingStatus from "@/components/crafting-status";

const DynamicFavourites = dynamic(() => import('@/components/favourites'), {
    ssr: false,
})

const DynamicItemsTable = dynamic(() => import('@/components/items'), {
    ssr: false,
})

export default async function Home() {
    const cookieStore = cookies();
    const client = createClient(cookieStore);

    const network = await fetchLatestType(client, "items");

    const items = network.items;
    const fluids = network.fluids;

    return (
        <>
            <div className="flex flex-col gap-4">
                <h2 className="border-b text-md font-medium pb-1">Crafting Status</h2>

                <CraftingStatus />
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="border-b text-md font-medium pb-1">Favourite Items (1hr)</h2>
                <DynamicFavourites />
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="border-b text-md font-medium pb-1">Items</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <DynamicItemsTable items={fluids} name="fluids" />

                    <DynamicItemsTable items={items} name="items" />
                </div>
            </div>
        </>
    );
}
