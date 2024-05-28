"use client"

import { defaultFavs } from "@/util/default";
import { useLocalStorage } from "usehooks-ts"
import LineChartHero from "./chart";
import React, { useEffect, useState } from "react";
import { createClient } from "@/util/supabase/client";
import { fetchItem, subscribeToItem } from "@/util/supabase/fetch";
import { formatName } from "@/util/ae2";
import Link from "next/link";
import { FlatJoinedItemRow } from "@/types/supabase";
import { toAEUnit } from "@/util/unit";
import { DateTime } from "luxon";
import { arrayMoveImmutable } from 'array-move';
import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import { RiDraggable, RiDeleteBinLine } from '@remixicon/react';

export default function Favourites() {
    const [favourites, setFavourites] = useLocalStorage('favourites', defaultFavs)

    function onSortEnd(oldIndex: number, newIndex: number) {
        setFavourites((array) => arrayMoveImmutable(array, oldIndex, newIndex));
    };

    function removeFavourite(name: string) {
        setFavourites((array) => array.filter(fav => fav !== name));
    }

    return (
        <div className="flex flex-col gap-4">
            <SortableList
                onSortEnd={onSortEnd}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 gap-y-4"
                draggedItemClassName="dragged"
            >
                {favourites.map(fav => (
                    <SortableItem key={fav}>
                        <Favourite key={fav} name={fav} remove={() => removeFavourite(fav)} />
                    </SortableItem>
                ))}
            </SortableList>
        </div>
    )
}

type Props = {
    name: string;
    remove: () => void;
}

const Favourite = React.forwardRef<HTMLDivElement, Props>(function Favourite({ name, remove }: Props, ref) {
    const [data, setData] = useState([] as FlatJoinedItemRow[]);

    useEffect(() => {
        const client = createClient();

        fetchItem(client, name).then(res => setData(res ?? []));

        // const listener = subscribeToItem(client, name, async (item) => {
        //     const { data, error } = await client.from("inserts").select("*").eq("id", item.insert_id).single();
        //     if (error) {
        //         console.error(error);
        //         return;
        //     }

        //     const mapped = {
        //         ...item,
        //         ...data,
        //         date: DateTime.fromISO(data.created_at).toLocal().toFormat("HH:mm:ss"),
        //         [item.item_name]: item.quantity,
        //     }

        //     setData(prev => [...prev, mapped]);
        // });

        // return () => {
        //     listener.unsubscribe();
        // }
    }, []);

    const first = data[0];
    const last = data[data.length - 1];

    const rawIncrease = ((last?.quantity - first?.quantity) / first?.quantity) * 100
    const increasePercentage = Number(rawIncrease.toFixed(2));

    return (
        <div ref={ref} className="flex flex-col gap-1">
            <div className="flex justify-between">
                <Link className="flex gap-2 text-sm select-none" href={`/items/${name}`}>
                    <p className="font-medium">{formatName(name)}</p>
                    {last && (
                        <p>{toAEUnit(data[data.length - 1]?.quantity)}</p>
                    )}
                </Link>

                <div className="flex items-center gap-2">
                    <RiDeleteBinLine className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => remove()} />

                    <SortableKnob>
                        <div className="rounded-sm cursor-pointer">
                            <RiDraggable className="h-4 w-4" />
                        </div>
                    </SortableKnob>
                </div>
            </div>

            <LineChartHero data={data} name={name} size="card" />
        </div>
    );
})
