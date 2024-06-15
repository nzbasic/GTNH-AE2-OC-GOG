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
    initialData: FlatJoinedItemRow[];
}

export const Favourite = React.forwardRef<HTMLDivElement, Props>(function Favourite({ name, remove, initialData }: Props, ref) {
    const [data, setData] = useState(initialData);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => setData(initialData), [initialData]);

    async function refresh() {
        setRefreshing(true);

        const client = createClient();
        const res = await fetchItem(client, name);

        setData(res ?? []);
        setRefreshing(false);
    }

    const first = data[0];
    const last = data[data.length - 1];

    const rawIncrease = ((last?.quantity - first?.quantity) / first?.quantity) * 100
    const increasePercentage = Number(rawIncrease.toFixed(2));

    return (
        <div ref={ref} className="flex flex-col gap-1">
            <div className="flex justify-between gap-x-2">
                <Link className="flex gap-2 text-sm select-none min-w-0" href={`/items/${name}`}>
                    <span className="truncate font-medium">
                        {formatName(name)}
                    </span>
                    {last && (
                        <span>{toAEUnit(data[data.length - 1]?.quantity)}</span>
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
