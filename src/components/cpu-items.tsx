"use client"

import { ParsedCPURow } from "@/types/supabase"
import { createClient } from "@/util/supabase/client";
import { fetchCPU } from "@/util/supabase/fetch";
import { useEffect, useState } from "react";
import cn from 'classnames';
import { toAEUnit } from "@/util/unit";
import { formatName } from "@/util/ae2";
import Refresh from "./refresh";
import { subscribeToCPU } from "@/util/supabase/subscribe";

type Props = {
    name: string;
    initialData: ParsedCPURow;
}

export default function CPUItems({ name, initialData }: Props) {
    const [output, setOutput] = useState(initialData.final_output)
    const [items, setItems] = useState(handleSetData(initialData));
    const [refreshing, setRefreshing] = useState(false);

    function handleSetData(data: ParsedCPURow) {
        const fullItemNames = [...(new Set([
            ...data.active_items.map(i => i.item_name),
            ...data.pending_items.map(i => i.item_name),
            ...data.stored_items.map(i => i.item_name)
        ]))].filter(Boolean);

        // merge active and stored items
        const items = fullItemNames.map((item_name) => {
            const activeItem = data.active_items.find((i) => i.item_name === item_name);
            const storedItem = data.stored_items.find((i) => i.item_name === item_name);
            const pendingItem = data.pending_items.find((i) => i.item_name === item_name);
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
    }

    async function handleRefresh() {
        setRefreshing(true);
        const client = createClient();
        const res = await fetchCPU(client, name);
        if (!res) return;
        setItems(handleSetData(res));
        setOutput(res.final_output);
        setRefreshing(false);
    }

    useEffect(() => {
        const client = createClient();

        const listener = subscribeToCPU(client, name, async (cpu) => {
            setItems(handleSetData(cpu));
            setOutput(cpu.final_output)
        });

        return () => {
            listener.unsubscribe();
        }
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <p>Crafting: {output.quantity}x {output.item_name}</p>

            <Refresh onClick={handleRefresh} refreshing={refreshing} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {items.map((item, index) => (
                    <div
                        className={cn('flex flex-col text-xs border p-2 rounded-sm bg-card', {
                            'bg-green-100 dark:bg-green-900 border-green-500': item.status === 'active',
                            'bg-orange-100 dark:bg-orange-900 border-orange-500': item.status === 'pending',
                            '': item.status === 'stored',
                        })}
                        key={item.item_name}
                    >
                        <p>{formatName(item.item_name)}</p>
                        {item.status === 'active' && (
                            <p>Crafting {toAEUnit(item.activeQuantity)}, Pending {toAEUnit(item.pendingQuantity)}, Stored: {toAEUnit(item.storedQuantity)}</p>
                        )}
                        {item.status === 'pending' && (
                            <p>Pending {toAEUnit(item.pendingQuantity)}, Stored {toAEUnit(item.storedQuantity)}</p>
                        )}
                        {item.status === 'stored' && (
                            <p>Stored {toAEUnit(item.storedQuantity)}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
