import { CPUItem, CPURow, JoinedItemRow, ParsedCPURow } from "@/types/supabase";
import { DateTime } from "luxon";

export function mapJoinedItem(item: JoinedItemRow) {
    return {
        ...item,
        ...item.inserts,
        date: DateTime.fromISO(item.inserts.created_at).toFormat("dd/MM HH:mm"),
        [item.item_name]: item.quantity,
    }
}

export function mapStringToItems(string: string): CPUItem[] {
    if (!string) return [];
    if (string == '') return [];

    // form = "item_name~quantity;"
    const items = string.split(";")?.map(item => {
        const [item_name, quantity] = item.split("~");
        return { item_name, quantity: parseInt(quantity) };
    }) ?? [];

    return items.filter(i => i.item_name);
}

export function parseCPURow(cpu: CPURow): ParsedCPURow {
    return {
        ...cpu,
        active_items: typeof cpu.active_items === "string" ? mapStringToItems(cpu.active_items) : cpu.active_items,
        stored_items: typeof cpu.stored_items === "string" ? mapStringToItems(cpu.stored_items) : cpu.stored_items,
        final_output: typeof cpu.final_output === "string" ? mapStringToItems(cpu.final_output)[0] : cpu.final_output,
        pending_items: typeof cpu.pending_items === "string" ? mapStringToItems(cpu.pending_items) : cpu.pending_items,
    }
}
