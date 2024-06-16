"use client"

import { CraftRow } from "@/types/supabase"
import { createClient } from "@/util/supabase/client";
import { fetchSavedCrafts } from "@/util/supabase/fetch";
import { useState } from "react";
import SavedCraftsTable from "./saved-crafts-table";
import Refresh from "./refresh";

type Props = {
    initialData: CraftRow[];
}

export default function SavedCrafts({ initialData }: Props) {
    const [data, setData] = useState<CraftRow[]>(initialData)
    const [refreshing, setRefreshing] = useState(false)

    const refreshData = async () => {
        setRefreshing(true)
        const client =  createClient()
        const res = await fetchSavedCrafts(client)
        if (!res) return
        setData(res)
        setRefreshing(false)
    }

    return (
        <div className="flex flex-col gap-4">
            <h2 className="border-b text-md font-medium pb-1 flex gap-2 items-center">
                Saved Crafts
                <Refresh onClick={refreshData} refreshing={refreshing} />
            </h2>
            <SavedCraftsTable crafts={data} refreshing={refreshing} />
        </div>
    )
}
