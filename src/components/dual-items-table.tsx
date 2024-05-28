"use client"

import { ItemRow } from "@/types/supabase"
import ItemsTable from "./items"
import { useState } from "react"
import { fetchLatestType } from "@/util/supabase/fetch"
import { createClient } from "@/util/supabase/client"
import Refresh from "./refresh"

type Props = {
    initials: {
        fluids: ItemRow[],
        items: ItemRow[]
    }
}

export default function DualItemsTable({ initials: { fluids, items } }: Props) {
    const [data, setData] = useState({ fluids, items })
    const [refreshing, setRefreshing] = useState(false)

    async function refresh() {
        setRefreshing(true)
        const client = createClient();
        const network = await fetchLatestType(client, "items");

        const items = network.items;
        const fluids = network.fluids;

        setData({ fluids, items })
        setRefreshing(false)
    }

    return (
        <div className="flex flex-col gap-4">
            <h2 className="border-b text-md font-medium pb-1 flex gap-2 items-center">
                Items
                <Refresh onClick={refresh} refreshing={refreshing} />
            </h2>

            <div className="grid lg:grid-cols-2 gap-4">
                <ItemsTable items={fluids} name="fluids" refreshing={refreshing} />

                <ItemsTable items={items} name="items" refreshing={refreshing} />
            </div>
        </div>
    )
}
