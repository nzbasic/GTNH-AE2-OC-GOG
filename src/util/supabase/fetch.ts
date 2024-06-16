import { SupabaseClient } from "@supabase/supabase-js";
import { CraftRow, FlatJoinedItemRow, ItemHistoryPoint, ParsedCPURow, ReducedItemHistoryPoint, Stats } from "@/types/supabase";
import { DateTime } from "luxon";
import { mapJoinedItem, parseCPURow } from "./map";

export async function fetchTypeFromInsert(client: SupabaseClient, insert_id: number, type: string, select: string = "*") {
    const res = await client.from(type).select(select as '*').eq("insert_id", insert_id);
    const data: any[] | null = res.data;
    const error = res.error;
    if (!data) return;
    if (error) console.error(error);

    if (type === "items") {
        const sorted = data.toSorted((a, b) => b.quantity - a.quantity);

        return {
            fluids: sorted
                .filter(item => item.item_name.startsWith("drop of ")),
            items: sorted.filter(item => !item.item_name.startsWith("drop of ")),
        }
    }
    if (type === "stats") return data[0];
    if (type === "cpus") {
        return data.map(parseCPURow);
    }
}

export async function fetchLatestInsert(client: SupabaseClient, type: string) {
    const realType = type === "cpus" ? "stats" : type;

    const { data, error } = await client.from("inserts").select("*").eq("type", realType).order("created_at", { ascending: false }).limit(1).single();
    if (!data) return;

    const insert_id = data.id;
    return insert_id;
}

export async function fetchLatestType(client: SupabaseClient, type: string, select?: string) {
    const insert_id = await fetchLatestInsert(client, type);
    if (!insert_id) return;

    return fetchTypeFromInsert(client, insert_id, type, select);
}

export async function fetchCPUs(client: SupabaseClient) {
    const { data, error } = await client.from("cpus").select("*");

    if (!data) return [];
    if (error) console.error(error);

    const cpus: ParsedCPURow[] = [];

    const craftsRes = await client.from("crafts").select("*").is('ended_at', null);
    const crafts = craftsRes.data ?? [];

    for (const row of data) {
        const parsedCpu = parseCPURow(row);

        const craft = crafts.find(craft => craft.cpu_name === row.name);

        if (craft) {
            parsedCpu.started_at = craft.created_at;
            parsedCpu.craft_id = craft.id;
        }

        cpus.push(parsedCpu);
    }

    return cpus;
}

export async function fetchStats(client: SupabaseClient, after = DateTime.now().minus({ hours: 1 }).toISO()) {
    const { data, error } = await client.from("stats").select("*, inserts!inner(*)").gt("inserts.created_at", after).order("insert_id", { ascending: false })
    if (!data) return;

    const mapped = (data ?? []).map(mapJoinedItem) as unknown as Stats[];

    const sorted = mapped.toSorted((a, b) => DateTime.fromISO(a.created_at).toMillis() - DateTime.fromISO(b.created_at).toMillis());

    const withDiff = sorted.map((stat, i) => ({
        ...stat,
        euDiff: stat.euIn - stat.euOut
    }));

    return withDiff;
}

export async function fetchItem(client: SupabaseClient, item: string, after = DateTime.now().minus({ hours: 1 }).toISO()) {
    const { data, error } = await client.from("items").select("*, inserts!inner(*)").eq("item_name", item).gt("inserts.created_at", after).order("insert_id", { ascending: false })
    if (!data) return;

    const mapped = (data ?? []).map(mapJoinedItem);

    const sorted = mapped.toSorted((a, b) => DateTime.fromISO(a.created_at).toMillis() - DateTime.fromISO(b.created_at).toMillis());

    return sorted as FlatJoinedItemRow[];
}

export async function fetchCPU(client: SupabaseClient, name: string) {
    const { data, error } = await client.from("cpus").select("*").eq("name", name).limit(1).single();
    if (error) console.error(error);
    if (!data) return;

    return parseCPURow(data);
}

export async function fetchCraft(client: SupabaseClient, id: string) {
    const craftRes = await client.from("crafts").select("*").eq("id", id).limit(1).single();
    if (!craftRes.data) return;

    const craft: CraftRow = craftRes.data;

    const cpu = await fetchCPU(client, craft.cpu_name)
    if (!cpu) return;

    return {
        craft,
        cpu,
    }
}

export async function fetchSavedCrafts(client: SupabaseClient) {
    const { data, error } = await client.from("crafts").select("*").eq('save', true).order("created_at", { ascending: false })
    if (!data) return [];

    return (data ?? []) as CraftRow[];
}

export async function fetchCraftables(client: SupabaseClient) {
    const { data, error } = await client.from("craftables").select("item_name")
    if (!data) return [];

    return data.map(r => r.item_name) as string[];
}

export async function fetchCraftItemHistory(client: SupabaseClient, id: string) {
    const { data, error } = await client.from("item_crafting_status").select("*").eq("craft_id", id);
    if (!data) return;

    const sorted = data.toSorted((a, b) => DateTime.fromISO(a.created_at).toMillis() - DateTime.fromISO(b.created_at).toMillis());

    const reducedItemHistory = sorted.reduce((acc, row) => {
        if (!acc[row.item_name]) acc[row.item_name] = [];
        acc[row.item_name].push({ created_at: row.created_at, active_count: row.active_count, pending_count: row.pending_count, stored_count: row.stored_count });
        return acc;
    }, {} as ReducedItemHistoryPoint);

    return reducedItemHistory;
}

export async function fetchCPUItemHistory(client: SupabaseClient, name: string) {
    const craft = await client.from("crafts").select("*").eq("cpu_name", name).is('ended_at', null).limit(1).single();
    if (!craft.data) return;
    const id = craft.data.id;

    const { data, error } = await client.from("item_crafting_status").select("*").eq("craft_id", id);
    if (!data) return;

    const sorted = data.toSorted((a, b) => DateTime.fromISO(a.created_at).toMillis() - DateTime.fromISO(b.created_at).toMillis());

    const reducedItemHistory = sorted.reduce((acc, row) => {
        if (!acc[row.item_name]) acc[row.item_name] = [];
        acc[row.item_name].push({ created_at: row.created_at, active_count: row.active_count, pending_count: row.pending_count, stored_count: row.stored_count });
        return acc;
    }, {} as Record<string, ReducedItemHistoryPoint[]>);

    return reducedItemHistory;
}

export async function fetchItems(client: SupabaseClient, items: string[], after = DateTime.now().minus({ hours: 1 }).toISO()) {
    const { data, error } = await client.from("items").select("*, inserts!inner(*)").in("item_name", items).gt("inserts.created_at", after).order("insert_id", { ascending: false })
    if (!data) return;

    const reduced: Record<string, FlatJoinedItemRow[]> = data.reduce((acc, item) => {
        if (!acc[item.item_name]) acc[item.item_name] = [];
        acc[item.item_name].push(mapJoinedItem(item));
        return acc;
    }, {} as Record<string, FlatJoinedItemRow[]>);

    for (const key in reduced) {
        const mapped = reduced[key]
        const sorted = mapped.toSorted((a, b) => DateTime.fromISO(a.created_at).toMillis() - DateTime.fromISO(b.created_at).toMillis());

        reduced[key] = sorted;
    }

    return reduced;
}
