import Card from "./card";
import cn from 'classnames';
import { toAEUnit } from "@/util/unit";
import { ParsedCPURow } from "@/types/supabase";
import React from "react";
import { formatName } from "@/util/ae2";
import { DateTime } from "luxon";

type Props = {
    cpu: ParsedCPURow;
    refreshing: boolean;
}

export default function CPU({ cpu, refreshing }: Props) {
    const [status, duration] = React.useMemo(() => {
        if (refreshing) return ['idle'];

        let status = 'idle';
        if (cpu.busy && cpu.active_items.length > 0) {
            status = 'active';
        } else if (cpu.busy && cpu.active_items.length === 0) {
            status = 'stalled';
        }

        let duration;
        if (cpu.started_at) {
            duration = DateTime.now().diff(DateTime.fromISO(cpu.started_at), ['hours', 'minutes', 'seconds']).toHuman({ unitDisplay: 'short', maximumFractionDigits: 0 })
        }

        return [status, duration]
    }, [cpu, refreshing])

    return (
        <div className="bg-card">
            <Card
                className={cn('flex flex-col w-full items-start gap-1 p-2',
                    { 'hover:brightness-95 dark:hover:brightness-110': cpu.busy },
                    { 'bg-green-500/5 dark:bg-green-900 border-green-300 dark:border-green-500': status === 'active' },
                    { 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-500': status === 'stalled' }
                )}
                key={cpu.id}
            >
                <p>CPU {cpu.name === '' ? 'Unnamed' : cpu.name}</p>

                {refreshing ? (
                    <p>Refreshing...</p>
                ) : (
                    cpu.final_output ? (
                        <p className="italic truncate w-full">{formatName(cpu.final_output.item_name)} x{cpu.final_output.quantity}</p>
                    ) : (
                        <p className="italic">{toAEUnit(cpu.storage)}</p>
                    )
                )}

                <p suppressHydrationWarning>{duration ?? 'Idle'}</p>
            </Card>
        </div>
    )
}
