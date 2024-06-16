import { ReducedItemHistoryPoint } from "@/types/supabase"
import { DateTime } from "luxon";
import { ScheduleWithParentSize } from "./schedule";
import React from "react";

type Props = {
    data: Record<string, ReducedItemHistoryPoint[]>
}

export default function CraftItemHistory({ data }: Props) {
    // Transform the data
    const transformedData = React.useMemo(() => {
        const initialTransform = Object.keys(data).flatMap(item => {
            const itemData = data[item];
            return itemData.map((point, index) => {
                const start = DateTime.fromISO(point.created_at).toMillis();
                const end = index < itemData.length - 1 ? DateTime.fromISO(itemData[index + 1].created_at).toMillis() : start + 1000;
                return {
                    item,
                    start,
                    end,
                    active_count: point.active_count,
                    pending_count: point.pending_count
                };
            });
        })

        const sorted = initialTransform.toSorted((a, b) => a.start - b.start);

        const groupedByItem = sorted.reduce((acc, point) => {
            if (!acc[point.item]) {
                acc[point.item] = [];
            }

            const last = acc[point.item][acc[point.item].length - 1];
            if (last && last.end === point.start) {
                // active takes precedence over pending
                // if there is it goes from 0 to >0 active, then start a new block

                // conditions:
                // last pending > 0, current pending = 0 = push
                // last pending > 0, current pending > 0 = extend
                // last pending = 0 current pending > 0 = push

                if (last.active_count > 0 && point.active_count == 0) {
                    acc[point.item].push(point);
                } else if (last.active_count > 0 && point.active_count > 0) {
                    last.end = point.end;
                } else if (last.active_count == 0 && point.active_count > 0) {
                    acc[point.item].push(point);
                } else if (last.pending_count > 0 && point.pending_count == 0) {
                    acc[point.item].push(point);
                } else if (last.pending_count > 0 && point.pending_count > 0) {
                    last.end = point.end;
                } else if (last.pending_count == 0 && point.pending_count > 0) {
                    acc[point.item].push(point);
                }
            } else {
                acc[point.item].push(point);
            }

            return acc;
        }, {} as Record<string, typeof initialTransform>);

        const reduced: Record<string, number> = {}
        for (const item_id in data) {
            const history_points = data[item_id]
            let total_time = 0;

            // add 10s to whenever the value is > 0
            for (const point of history_points) {
                if (point.active_count > 0 || point.pending_count > 0) {
                    total_time += 10;
                }
            }
            reduced[item_id] = total_time;
        }

        const top10 = Object.entries(reduced).sort((a, b) => b[1] - a[1]).slice(0, 15)

        const top10FromTransformFlat = top10.flatMap(([item_id, _]) => {
            return groupedByItem[item_id];
        });

        // sort all pending first
        top10FromTransformFlat.sort((a, b) => {
            if (a.active_count > 0 && b.active_count == 0) {
                return 1;
            } else if (a.active_count == 0 && b.active_count > 0) {
                return -1;
            } else {
                return a.start - b.start;
            }
        });

        return top10FromTransformFlat;
    }, [data]);

    return (
        <div className="w-full h-[500px]">
            <ScheduleWithParentSize data={transformedData} />
        </div>
    )
}
