import { Card } from "./ui/card";
import cn from 'classnames';
import { toAEUnit } from "@/util/unit";
import { ParsedCPURow } from "@/types/supabase";
import React from "react";
import { formatName } from "@/util/ae2";

type Props = {
    cpu: ParsedCPURow;
    refreshing: boolean;
}

export default function CPU({ cpu, refreshing }: Props) {
    const [status] = React.useMemo(() => {
        if (refreshing) return ['idle'];

        let status = 'idle';
        if (cpu.busy && cpu.active_items.length > 0) {
            status = 'active';
        } else if (cpu.busy && cpu.active_items.length === 0) {
            status = 'stalled';
        }

        return [status]
    }, [cpu, refreshing])

    return (
        <div className="bg-card">
            <Card
                className={cn('flex flex-col items-start w-full gap-1 rounded-sm shadow-sm p-2 text-xs',
                    { 'hover:brightness-95 dark:hover:brightness-110': cpu.busy },
                    { 'bg-green-500/5 dark:bg-green-900 border-green-300 dark:border-green-500': status === 'active' },
                    { 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-500': status === 'stalled' }
                )}
                key={cpu.id}
            >
                <p >CPU {cpu.name === '' ? 'Unnamed' : cpu.name} {!cpu.busy && '(idle)'}</p>

                {refreshing ? (
                    <p>Refreshing...</p>
                ) : (
                    cpu.final_output ? (
                        <p className="italic">{formatName(cpu.final_output.item_name)} x{cpu.final_output.quantity}</p>
                    ) : (
                        <p className="italic">{toAEUnit(cpu.storage)}</p>
                    )
                )}
            </Card>
        </div>
    )
}
