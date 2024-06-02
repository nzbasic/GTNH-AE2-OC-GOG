import { createClient } from "@/util/supabase/server";
import React from "react";
import { fetchCPUs, fetchLatestType } from "@/util/supabase/fetch";
import { cookies } from "next/headers";
import dynamic from 'next/dynamic'
import CraftingStatus from "@/components/crafting-status";
import { redirect } from "next/navigation";

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

    }

    const network = await fetchLatestType(client, "items");

    const items = network?.items ?? [];
    const fluids = network?.fluids ?? [];

    if (!items || !items.length) {
        redirect("/");
    }

    const cpus = await fetchCPUs(client)

    return (
        <>
            <CraftingStatus initialData={cpus} />

            <DynamicFavourites  />

            <DynamicDualItemsTable initials={{ items, fluids }} />
        </>
    );
}
