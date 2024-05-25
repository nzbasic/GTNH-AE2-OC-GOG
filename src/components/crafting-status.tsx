"use client";

import { ParsedCPURow } from "@/types/supabase";
import { createClient } from "@/util/supabase/client"
import { fetchLatestType, fetchTypeFromInsert, subscribeToInserts } from "@/util/supabase/fetch";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import cn from 'classnames';
import { toAEUnit } from "@/util/unit";

export default function CraftingStatus() {
    const [cpus, setCpus] = useState([] as ParsedCPURow[]);

    async function updateCpus(insert_id: number) {
        const client = createClient();
        const res = await fetchLatestType(client, "cpus")

        if (cpus && !res.length) {
            return;
        }

        setCpus(res)
    }

    useEffect(() => {
        const client = createClient();

        fetchLatestType(client, "cpus").then(res => setCpus(res));

        const listener = subscribeToInserts(client, (id, type) => {
            if (type === "stats") {
                updateCpus(id);
            }
        })

        return () => {
            listener.unsubscribe();
        }
    }, []);

    console.log(cpus);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {!cpus.length && <div>Loading...</div>}
            {cpus.map(cpu => (
                <Card className={cn('flex flex-col gap-1 rounded-sm shadow-sm p-2 text-xs', { 'bg-green-100 border-green-300': cpu.busy })} key={cpu.id}>
                    <p className="italic">{cpu.name === '' ? 'Unnamed' : cpu.name} {!cpu.busy && '(idle)'}</p>
                    {cpu.final_output ? (
                        <p>{cpu.final_output.item_name} x{cpu.final_output.quantity}</p>
                    ) : (
                        <p>{toAEUnit(cpu.storage)}</p>
                    )}
                </Card>
            ))}
        </div>
    )
}
