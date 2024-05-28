"use client";

import { ParsedCPURow } from "@/types/supabase";
import { createClient } from "@/util/supabase/client"
import { fetchLatestType, fetchTypeFromInsert, subscribeToInserts } from "@/util/supabase/fetch";
import React, { useEffect, useState } from "react";
import CPU from "./cpu";
import Link from "next/link";

function sortCpus(cpus: ParsedCPURow[]) {
    const sorted = cpus.toSorted((a, b) => {
        const n1 = Number(a.name);
        const n2 = Number(b.name);

        if (n1 && n2) {
            return n1 - n2;
        }

        return a.name.localeCompare(b.name);
    })

    return sorted;
}

export default function CraftingStatus() {
    const [cpus, setCpus] = useState([] as ParsedCPURow[]);

    async function updateCpus() {
        const client = createClient();
        const res = await fetchLatestType(client, "cpus")

        if (cpus && !res.length) {
            return;
        }

        setCpus(sortCpus(res))
    }

    useEffect(() => {
        updateCpus()

        // fetchLatestType(client, "cpus").then(res => setCpus(sortCpus(res)));

        // const listener = subscribeToInserts(client, (id, type) => {
        //     if (type === "stats") {
        //         updateCpus(id);
        //     }
        // })

        // return () => {
        //     listener.unsubscribe();
        // }
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {!cpus.length && <div>Loading...</div>}
            {cpus.map(cpu => (
                <React.Fragment key={cpu.id}>
                    {cpu.busy ? (
                        <Link href={`/cpus/${cpu.name}`}>
                            <CPU cpu={cpu} />
                        </Link>
                    ) : (
                        <CPU cpu={cpu} />
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}
