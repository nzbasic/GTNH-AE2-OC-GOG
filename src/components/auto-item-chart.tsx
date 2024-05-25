"use client"

import { FlatJoinedItemRow } from "@/types/supabase"
import { createClient } from "@/util/supabase/client";
import { subscribeToItem } from "@/util/supabase/fetch";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import LineChartHero from "./chart";

type Props = {
    initialData: FlatJoinedItemRow[];
    name: string;
    size: 'full' | 'card';
}

export default function AutoItemChart({ initialData, name, size }: Props) {
    const [data, setData] = useState(initialData);

    useEffect(() => {
        const client = createClient();

        const listener = subscribeToItem(client, name, async (item) => {
            const { data, error } = await client.from("inserts").select("*").eq("id", item.insert_id).single();
            if (error) {
                console.error(error);
                return;
            }

            const mapped = {
                ...item,
                ...data,
                date: DateTime.fromISO(data.created_at).toLocal().toFormat("HH:mm:ss"),
                [item.item_name]: item.quantity,
            }

            setData(prev => [...prev, mapped]);
        });

        return () => {
            listener.unsubscribe();
        }
    }, []);

    return (
        <div>
            <LineChartHero data={data} name={name} size={size} />
        </div>
    )
}
