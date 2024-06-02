import { CPURow, ItemRow, ParsedCPURow } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { fetchTypeFromInsert } from "./fetch";
import { parseCPURow } from "./map";

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


export function subscribeToItems(client: SupabaseClient, fn: (items: ItemRow[]) => void) {
    const wrapped = (insert_id: string) => {
        fetchTypeFromInsert(client, parseInt(insert_id), "items").then(fn);
    };

    const channel = client
        .channel("items_inserts")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "inserts", filter: 'type=eq.items' },
            (row) => wrapped(row.new.id)
        )
        .subscribe();

    return channel;
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
