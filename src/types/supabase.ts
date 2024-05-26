import { Item } from "./oc";

export type ItemRow = {
    id: number;
    insert_id: number;
    item_name: string;
    quantity: number;
}

export type InsertRow = {
    id: number;
    type: string;
    created_at: string;
}

export type CPURow = {
    id: number;
    name: string;
    busy: boolean;
    storage: number;
    active_items: string;
    stored_items: string;
    pending_items: string;
    final_output: string;
    insert_id: number;
}

export type StatsRow = {
    id: number;
    avg_power_injection: number;
    stored_power: number;
    avg_power_use: number;
    insert_id: number;
}

export type JoinedItemRow = ItemRow & {
    inserts: InsertRow;
}

export type FlatJoinedItemRow = ItemRow & InsertRow;

export type CPUItem = {
    item_name: string;
    quantity: number;
}

export type ParsedCPURow = {
    id: number;
    name: string;
    busy: boolean;
    storage: number;
    insert_id: number;
    active_items: CPUItem[];
    stored_items: CPUItem[];
    pending_items: CPUItem[];
    final_output: CPUItem;
}
