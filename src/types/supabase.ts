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
    started_at?: string;
}

export type Instruction = {
    id: number;
    created_at: string;
    updated_at: string;
    sent_by: string;
    status: string; // awaiting-assignment, assigned, in-progress, completed
    type: string; // 'meteor'
    data: Record<string, any>
}

export type MeteorItem = {
    item_name: string;
    weight: number;
}

export type Meteor = {
    id: number;
    created_at: string;
    name: string;
    radius: number;
    cost: number;
    contents: MeteorItem[];
}

export type Stats = {
    id: number;
    created_at: string;
    eu: string;
    euIn: number;
    euOut: number;
    euDiff: number;
    mspt: number;
    tps: number;
}
