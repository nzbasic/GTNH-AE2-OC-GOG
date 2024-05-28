"use client";

import { ParsedCPURow } from "@/types/supabase";
import React, { useState } from "react";
import CPU from "./cpu";
import Link from "next/link";
import { fetchLatestType } from "@/util/supabase/fetch";
import { createClient } from "@/util/supabase/client";
import cn from 'classnames';
import Refresh from "./refresh";

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

export default function CraftingStatus({ initialData }: { initialData: ParsedCPURow[] }) {
    const [cpus, setCpus] = useState(sortCpus(initialData));
    const [refreshing, setRefreshing] = useState(false);

    async function updateCpus() {
        setRefreshing(true);
        const client = createClient();
        const res = await fetchLatestType(client, "cpus")

        if (cpus && !res.length) {
            return;
        }

        setCpus(sortCpus(res))
        setRefreshing(false);
    }

    // useEffect(() => {
    //     updateCpus()

    //     // fetchLatestType(client, "cpus").then(res => setCpus(sortCpus(res)));

    //     // const listener = subscribeToInserts(client, (id, type) => {
    //     //     if (type === "stats") {
    //     //         updateCpus(id);
    //     //     }
    //     // })

    //     // return () => {
    //     //     listener.unsubscribe();
    //     // }
    // }, []);

    return (
        <div className="flex flex-col gap-4">
            <h2 className="border-b text-md font-medium pb-1 flex gap-2 items-center">
                Crafting Status
                <Refresh onClick={updateCpus} refreshing={refreshing} />
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {!cpus.length && <div>Loading...</div>}
                {cpus.map(cpu => (
                    <React.Fragment key={cpu.id}>
                        {cpu.busy ? (
                            <Link href={`/cpus/${cpu.name}`}>
                                <CPU cpu={cpu} refreshing={refreshing} />
                            </Link>
                        ) : (
                            <CPU cpu={cpu} refreshing={refreshing} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}
