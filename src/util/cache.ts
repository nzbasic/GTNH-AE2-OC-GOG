"use server"

import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/service_worker";
import { compress, decompress } from "./compress";
import { fetchCPUs, fetchCraftItemHistory, fetchCraftables, fetchItem, fetchLatestType, fetchSavedCrafts, fetchStats } from "./supabase/fetch";
import { DateTime } from "luxon";

const getHome = unstable_cache(async () => {
    const client = await createAdminClient();

    const all = await Promise.all([
        fetchLatestType(client, "items"),
        fetchStats(client),
        fetchSavedCrafts(client),
        fetchCraftables(client),
    ]);

    return compress(all);
}, ['home'], { revalidate: false, tags: ['stats'] });

const getCpus = unstable_cache(async () => {
    const client = await createAdminClient();
    const cpus = await fetchCPUs(client);
    return compress(cpus);
}, ['cpus'], { revalidate: false, tags: ['stats'] });

const getItems = unstable_cache(async (item_name: string) => {
    const client = await createAdminClient();
    const data = await fetchItem(client, item_name, DateTime.now().minus({ week: 1 }).toISO())

    if (!data) return "";

    return compress(data);
}, ['items'], { revalidate: false, tags: ['stats'] });

const getItemHistory = unstable_cache(async (id: number) => {
    const client = await createAdminClient();
    const items = await fetchCraftItemHistory(client, id.toString());

    if (!items) return "";
    if (Object.entries(items).length == 0) return ""

    return compress(items);
}, ['craft-items'], { revalidate: false, tags: ['active-crafts'] });

// second cache for finished items, doesn't revalidate
const getItemHistoryFinished = unstable_cache(async (id: number) => {
    const client = await createAdminClient();
    const items = await fetchCraftItemHistory(client, id.toString());

    if (!items) return "";
    if (Object.entries(items).length == 0) return ""

    return compress(items);
}, ['craft-items-finished'], { revalidate: false });

// third cache for long running items, longer revalidation
const getItemHistoryLong = unstable_cache(async (id: number) => {
    const client = await createAdminClient();
    const items = await fetchCraftItemHistory(client, id.toString());

    if (!items) return "";
    if (Object.entries(items).length == 0) return ""

    return compress(items);
}, ['craft-items-long'], { revalidate: false, tags: ['long-active-crafts'] });

const getFullStats = unstable_cache(async () => {
    const client = await createAdminClient();
    const stats = await fetchStats(client, undefined, 50000);

    return compress(stats);
}, ['full-stats'], { revalidate: false, tags: ['stats'] });

export async function getCpusCached() {
    return decompress(await getCpus());
}

export async function getHomeCached() {
    return decompress(await getHome());
}

export async function getItemsCached(item_name: string) {
    return decompress(await getItems(item_name));
}

export async function getItemHistoryCached(id: number) {
    return await getItemHistory(id);
}

export async function getItemHistoryFinishedCached(id: number) {
    return await getItemHistoryFinished(id);
}

export async function getItemHistoryLongCached(id: number) {
    return await getItemHistoryLong(id);
}

export async function getFullStatsCached() {
    return decompress(await getFullStats());
}
