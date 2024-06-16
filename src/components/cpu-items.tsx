"use client"

import { CraftRow, ParsedCPURow, ReducedItemHistoryPoint } from "@/types/supabase"
import { createClient } from "@/util/supabase/client";
import { fetchCPU, fetchCPUItemHistory, fetchCraftItemHistory } from "@/util/supabase/fetch";
import React, { useEffect, useState } from "react";
import Refresh from "./refresh";
import { subscribeToCPU } from "@/util/supabase/subscribe";
import CpuCurrentItems from "./cpu-current-items";
import CraftItemTotal from "./craft-item-total";
import CraftItemHistory from "./craft-item-history";
import { DateTime } from "luxon";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { toast } from "sonner"
import { mcAuth } from "@/util/supabase/auth";
import { toggleSaveCraft } from "@/util/supabase/update";

type Props = {
    initialData: ParsedCPURow;
    initialItemHistory: Record<string, ReducedItemHistoryPoint[]>;
    craft: CraftRow;
}

export default function CPUItems({ initialData, initialItemHistory, craft }: Props) {
    const [cpu, setCpu] = useState(initialData)

    const [itemHistory, setItemHistory] = useState(initialItemHistory);

    const [refreshingCurrent, setRefreshingCurrent] = useState(false);
    const [refreshingHistory, setRefreshingHistory] = useState(false);

    const items = React.useMemo(() => {
        const fullItemNames = [...(new Set([
            ...cpu.active_items.map(i => i.item_name),
            ...cpu.pending_items.map(i => i.item_name),
            ...cpu.stored_items.map(i => i.item_name)
        ]))].filter(Boolean);

        // merge active and stored items
        const items = fullItemNames.map((item_name) => {
            const activeItem = cpu.active_items.find((i) => i.item_name === item_name);
            const storedItem = cpu.stored_items.find((i) => i.item_name === item_name);
            const pendingItem = cpu.pending_items.find((i) => i.item_name === item_name);
            return {
                item_name,
                activeQuantity: activeItem ? activeItem.quantity : 0,
                storedQuantity: storedItem ? storedItem.quantity : 0,
                pendingQuantity: pendingItem ? pendingItem.quantity : 0,
                status: activeItem ? 'active' : pendingItem ? 'pending' : 'stored',
            };
        });

        const filtered = items.filter((item) => item.activeQuantity > 0 || item.pendingQuantity > 0 || item.storedQuantity > 0);

        // sort by active, then stored, then pending
        const statusPriority = {
            active: 0,
            pending: 1,
            stored: 2,
        }

        function getPriority(status: string) {
            return statusPriority[status as unknown as keyof typeof statusPriority];
        }

        const sorted = filtered.toSorted((a, b) => {
            const aPriority = getPriority(a.status);
            const bPriority = getPriority(b.status);
            if (aPriority !== bPriority) {
                // Compare by status priority
                return aPriority - bPriority;
            } else {
                // If statuses are the same, compare by name alphabetically
                return a.item_name.localeCompare(b.item_name);
            }
        });

        return sorted;
    }, [cpu]);

    async function handleRefreshCurrent() {
        setRefreshingCurrent(true);
        const client = createClient();
        const res = await fetchCPU(client, cpu.name);
        if (!res) return;
        setCpu(res);
        setRefreshingCurrent(false);
    }

    async function handleRefreshHistory() {
        setRefreshingHistory(true);
        const client = createClient();
        const res = await fetchCraftItemHistory(client, craft.id.toString());
        if (!res) return;
        setItemHistory(res);
        setRefreshingHistory(false);
    }

    useEffect(() => {
        const client = createClient();

        const listener = subscribeToCPU(client, cpu.name, async (cpu) => {
            setCpu(cpu);
        });

        return () => {
            listener.unsubscribe();
        }
    }, [cpu]);

    const duration = DateTime.fromISO(craft.ended_at ?? DateTime.now().toISO()).diff(DateTime.fromISO(craft.created_at), ['hours', 'minutes', 'seconds']).toHuman({ maximumFractionDigits: 0 });

    const [save, setSave] = useState(craft.save);
    async function toggleSave(change: boolean) {
        const prev = save;
        setSave(change)

        const { isLoggedIn, onWhitelist } = await mcAuth();

        if (!isLoggedIn) {
            toast.error("You must be logged in to save results")
            setSave(prev)
            return;
        }

        if (!onWhitelist) {
            toast.error("You must be on the whitelist to save results")
            setSave(prev)
            return;
        }

        const error = await toggleSaveCraft(craft.id, change)

        if (!error) {
            toast.success(`Result ${change ? 'saved' : 'unsaved'}`)
            setSave(change);
        } else {
            toast.error("Failed to save result")
            setSave(prev);
        }
    }

    return (
        <>
            <p>Crafting: {craft.quantity}x {craft.item_name}</p>
            <p>Duration: {duration}</p>
            <div className="flex items-center space-x-2">
                <Label htmlFor="save" className="font-normal text-base">Save Result</Label>
                <Switch checked={save} onCheckedChange={toggleSave} id="save" />
            </div>

            <div className="flex flex-col gap-4 mt-4">
                {itemHistory && (
                    <div className="flex flex-col gap-2">
                        <h2 className="flex items-center gap-2 font-medium">
                            Total Active / Pending Time
                            <Refresh onClick={handleRefreshHistory} refreshing={refreshingHistory} />
                        </h2>
                        <CraftItemTotal data={itemHistory} />

                        <CraftItemHistory data={itemHistory} />
                    </div>
                )}

                {cpu.busy && craft.item_name == cpu.final_output.item_name ? (
                    <div className="flex flex-col gap-2">
                        <h2 className="border-b text-md font-medium pb-1 flex gap-2 items-center">
                            Crafting Status
                            <Refresh onClick={handleRefreshCurrent} refreshing={refreshingCurrent} />
                        </h2>
                        <CpuCurrentItems items={items} />
                    </div>
                ) : (
                    <p className="text-red-500 mt-4">CPU is not crafting this item</p>
                )}
            </div>
        </>
    )
}
