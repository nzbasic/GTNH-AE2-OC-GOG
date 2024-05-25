"use client"

import { defaultFavs } from "@/util/default";
import { useLocalStorage } from "usehooks-ts"
import LineChartHero from "./chart";
import { useEffect, useState } from "react";
import { createClient } from "@/util/supabase/client";
import { fetchItem, mapJoinedItem, subscribeToItem } from "@/util/supabase/fetch";
import { formatName } from "@/util/ae2";
import Link from "next/link";
import { FlatJoinedItemRow, ItemRow, JoinedItemRow } from "@/types/supabase";
import { toAEUnit } from "@/util/unit";
import { DateTime } from "luxon";
import cn from 'classnames';

export default function Favourites() {
    const [favourites] = useLocalStorage('favourites', defaultFavs)

    return (
        <div className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 gap-y-4">
                {favourites.map(fav => (
                    <Favourite key={fav} name={fav} />
                ))}
            </div>
        </div>
    )
}

function Favourite({ name }: { name: string }) {
    const [data, setData] = useState([] as FlatJoinedItemRow[]);

    useEffect(() => {
        const client = createClient();

        fetchItem(client, name).then(res => setData(res ?? []));

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

    const first = data[0];
    const last = data[data.length - 1];

    const rawIncrease = ((last?.quantity - first?.quantity) / first?.quantity) * 100
    const increasePercentage = Number(rawIncrease.toFixed(2));

    return (
        <div className="flex flex-col gap-1">
            <Link className="flex gap-2 text-sm" href={`/items/${name}`}>
                <p className="font-medium">{formatName(name)}</p>
                {last && (
                    <p>{toAEUnit(data[data.length - 1]?.quantity)}</p>
                )}

                {first && last && (
                    <p className={cn({ 'text-red-500': increasePercentage < 0, 'text-green-500': increasePercentage > 0 })}>{increasePercentage.toFixed(2)}%</p>
                )}
            </Link>

            <LineChartHero data={data} name={name} size="card" />
        </div>
    );
}
