import { SupabaseClient } from "@supabase/supabase-js";
import { CPUItem, CPURow, FlatJoinedItemRow, ItemRow, JoinedItemRow, ParsedCPURow } from "@/types/supabase";
import { DateTime } from "luxon";

function mapStringToItems(string: string): CPUItem[] {
    if (!string) return [];
    if (string == '') return [];

    // form = "item_name~quantity;"
    const items = string.split(";")?.map(item => {
        const [item_name, quantity] = item.split("~");
        return { item_name, quantity: parseInt(quantity) };
    }) ?? [];

    return items.filter(i => i.item_name);
}

function parseCPURow(cpu: CPURow): ParsedCPURow {
    return {
        ...cpu,
        active_items: typeof cpu.active_items === "string" ? mapStringToItems(cpu.active_items) : cpu.active_items,
        stored_items: typeof cpu.stored_items === "string" ? mapStringToItems(cpu.stored_items) : cpu.stored_items,
        final_output: typeof cpu.final_output === "string" ? mapStringToItems(cpu.final_output)[0] : cpu.final_output,
        pending_items: typeof cpu.pending_items === "string" ? mapStringToItems(cpu.pending_items) : cpu.pending_items,
    }
}

export async function fetchTypeFromInsert(client: SupabaseClient, insert_id: number, type: string) {
    const { data, error } = await client.from(type).select("*").eq("insert_id", insert_id);
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

export async function fetchLatestType(client: SupabaseClient, type: string) {
    const insert_id = await fetchLatestInsert(client, type);
    if (!insert_id) return;

    return fetchTypeFromInsert(client, insert_id, type);
}

export function subscribeToInserts(client: SupabaseClient, fn: (insert_id: number, type: string) => void) {
    return client
        .channel("inserts")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "inserts" },
            (row) => fn(row.new.id, row.new.type)
        )
        .subscribe();
}

export const mapJoinedItem = (item: JoinedItemRow) => {
    return {
        ...item,
        ...item.inserts,
        date: DateTime.fromISO(item.inserts.created_at).toFormat("dd/MM HH:mm"),
        [item.item_name]: item.quantity,
    }
}

export async function fetchItem(client: SupabaseClient, item: string, after = DateTime.now().minus({ hours: 1 }).toISO()) {
    const { data, error } = await client.from("items").select("*, inserts!inner(*)").eq("item_name", item).gt("inserts.created_at", after).order("insert_id", { ascending: false })
    if (!data) return;

    const mapped = (data ?? []).map(mapJoinedItem);

    const sorted = mapped.toSorted((a, b) => DateTime.fromISO(a.created_at).toMillis() - DateTime.fromISO(b.created_at).toMillis());

    return sorted as FlatJoinedItemRow[];
}

export async function fetchCPU(client: SupabaseClient, name: string) {
    const { data, error } = await client.from("cpus").select("*, inserts!inner(*)").eq("name", name).order("insert_id", { ascending: false }).limit(1).single();
    if (!data) return;

    return parseCPURow(data);
}

export function subscribeToItem(client: SupabaseClient, item: string, fn: (item: ItemRow) => void) {
    return client
        .channel(item)
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "items", filter: 'item_name=eq.' + item },
            (row: { new: ItemRow }) => fn(row.new)
        )
        .subscribe();
}

export function subscribeToCPU(client: SupabaseClient, name: string, fn: (cpu: ParsedCPURow) => void) {
    return client
        .channel("cpus")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "cpus", filter: 'name=eq.' + name },
            (row: { new: CPURow }) => fn(parseCPURow(row.new))
        )
        .subscribe();
}
