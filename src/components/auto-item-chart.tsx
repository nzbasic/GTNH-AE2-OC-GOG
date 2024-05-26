"use client"

import { FlatJoinedItemRow } from "@/types/supabase"
import { createClient } from "@/util/supabase/client";
import { subscribeToItem } from "@/util/supabase/fetch";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import LineChartHero from "./chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Props = {
    initialData: FlatJoinedItemRow[];
    name: string;
    size: 'full' | 'card';
}

export default function AutoItemChart({ initialData, name, size }: Props) {
    const [data, setData] = useState(initialData);
    const [period, setPeriod] = useState("all");

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
                date: DateTime.fromISO(data.created_at).toFormat("dd/MM HH:mm"),
                [item.item_name]: item.quantity,
            }

            setData(prev => [...prev, mapped]);
        });

        return () => {
            listener.unsubscribe();
        }
    }, []);

    const memoData = React.useMemo(() => {
        if (period === "all") return data;
        if (period === "week") return data.filter((d) => DateTime.fromISO(d.created_at) > DateTime.now().minus({ days: 7 }));
        if (period === "day") return data.filter((d) => DateTime.fromISO(d.created_at) > DateTime.now().minus({ days: 1 }));
        if (period === "hour") return data.filter((d) => DateTime.fromISO(d.created_at) > DateTime.now().minus({ hours: 1 }));
        return data;
    }, [data, period]);

    return (
        <div className="flex flex-col gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="day">Past Day</SelectItem>
                    <SelectItem value="hour">Past Hour</SelectItem>
                </SelectContent>
            </Select>

            <LineChartHero data={memoData} name={name} size={size} />
        </div>
    )
}
