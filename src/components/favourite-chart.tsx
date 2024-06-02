import { FlatJoinedItemRow } from "@/types/supabase";
import { formatName } from "@/util/ae2";
import { createClient } from "@/util/supabase/client";
import { fetchItem } from "@/util/supabase/fetch";
import { toAEUnit } from "@/util/unit";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Refresh from "./refresh";
import { RiDeleteBinLine, RiDraggable } from "@remixicon/react";
import { SortableKnob } from "react-easy-sort";
import MultiLineChart from "./multi-chart";

type Props = {
    name: string;
    remove: () => void;
}

export const Favourite = React.forwardRef<HTMLDivElement, Props>(function Favourite({ name, remove }: Props, ref) {
    const [data, setData] = useState([] as FlatJoinedItemRow[]);
    const [refreshing, setRefreshing] = useState(false);

    async function refresh() {
        setRefreshing(true);

        const client = createClient();
        const res = await fetchItem(client, name);

        setData(res ?? []);
        setRefreshing(false);
    }

    useEffect(() => {
        refresh()

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
                    <Refresh refreshing={refreshing} onClick={refresh} />

                    <RiDeleteBinLine className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => remove()} />

                    <SortableKnob>
                        <div className="rounded-sm cursor-pointer">
                            <RiDraggable className="h-4 w-4" />
                        </div>
                    </SortableKnob>
                </div>
            </div>

            <MultiLineChart data={data} names={[name]} size="card" />
        </div>
    );
})
