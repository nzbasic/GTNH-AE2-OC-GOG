"use client"

import { ReducedItemHistoryPoint } from "@/types/supabase"
import React from "react"
import { TreemapWithParentSize } from "./treemap"

type Props = {
    data: Record<string, ReducedItemHistoryPoint[]>
}

export default function CraftItemTotal({ data }: Props) {
    const [reduced] = React.useMemo(() => {
        // we have data in the form of { [item_id]: [history_points] }
        // each history point is { created_at, active_count, pending_count }
        // we want to reduce this to { [item_id]: { active_time, pending_time } }
        // each created_at is about 10 seconds apart, so add 10 seconds to the time for each point
        const reduced: Record<string, { active_time: number, pending_time: number }> = {}
        for (const item_id in data) {
            const history_points = data[item_id]
            let active_time = 0
            let pending_time = 0

            // add 10s to whenever the value is > 0
            for (const point of history_points) {
                if (point.active_count > 0) {
                    active_time += 10
                }
                if (point.pending_count > 0) {
                    pending_time += 10
                }
            }
            reduced[item_id] = { active_time, pending_time }
        }

        return [reduced] as const
    }, [data]);

    return (
        <div className="w-full h-96">
            <TreemapWithParentSize data={reduced} />
        </div>
    );
}
