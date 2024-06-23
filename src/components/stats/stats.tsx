"use client"

import type { Stats } from "@/types/supabase";
import { createClient } from "@/util/supabase/client";
import { fetchStats } from "@/util/supabase/fetch";
import React, { useMemo, useState } from "react";
import Refresh from "../refresh";
import { toPowerUnit } from "@/util/unit";
import MultiLineChart from "../chart/multi-chart";
import { CardVariant } from "../card";
import StatCard from "../stats/stat-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DateTime } from "luxon";
import Threshold, { ThresholdWithParentSize } from '../chart/threshold'

type Props = {
    initialData: Stats[]
}

export default function Stats({ initialData }: Props) {
    // const [period, setPeriod] = useState('60')
    const [data, setData] = useState<Stats[]>(initialData)
    const [refreshing, setRefreshing] = useState(false)

    async function refresh() {
        setRefreshing(true)
        const client = createClient();
        const stats = await fetchStats(client);
        if (stats) setData(stats)
        setRefreshing(false)
    }

    // const filtered = useMemo(() => {
    //     return data.filter((d) => DateTime.fromISO(d.created_at).toMillis() > DateTime.now().minus({ minutes: Number(period) }).toMillis())
    // }, [data, period])

    const { avg, peak, low, status } = useMemo(() => {
        const avg = { in: 0, out: 0, diff: 0, total: 0, mspt: 0, tps: 0 }
        const peak = { in: 0, out: 0, diff: 0, total: 0, mspt: 0, tps: 0 }
        const low = { in: Infinity, out: Infinity, diff: Infinity, total: Infinity, mspt: Infinity, tps: Infinity }
        const current = data[data.length - 1]

        const status: Record<string, CardVariant> = { in: 'neutral', out: 'neutral', diff: 'neutral', total: 'neutral', mspt: 'neutral', tps: 'neutral' }

        if (!current) return { avg, peak, low, status }

        current.tps = Number(current.tps.toFixed(1));

        data.forEach((d) => {
            avg.in += d.euIn;
            avg.out += d.euOut;
            avg.diff += d.euDiff;
            avg.total += Number(d.eu);
            avg.mspt += d.mspt;
            avg.tps += d.tps;

            peak.in = Math.max(peak.in, d.euIn);
            peak.out = Math.max(peak.out, d.euOut);
            peak.diff = Math.max(peak.diff, d.euDiff);
            peak.total = Math.max(peak.total, Number(d.eu));
            peak.mspt = Math.max(peak.mspt, d.mspt);
            peak.tps = Math.max(peak.tps, d.tps);

            low.in = Math.min(low.in, d.euIn);
            low.out = Math.min(low.out, d.euOut);
            low.diff = Math.min(low.diff, d.euDiff);
            low.total = Math.min(low.total, Number(d.eu));
            low.mspt = Math.min(low.mspt, d.mspt);
            low.tps = Math.min(low.tps, d.tps);
        })

        const length = data.length || 1;
        avg.in /= length;
        avg.out /= length;
        avg.diff /= length;
        avg.total /= length;
        avg.mspt /= length;
        avg.tps /= length;
        avg.tps = Number(avg.tps.toFixed(1));

        if (current.tps < 20 || avg.tps < 20) status.tps = 'warning';
        if (current.tps < 19 || avg.tps < 19) status.tps = 'danger';
        if (current.euDiff < 0) status.diff = 'danger';
        if (current.mspt > 50 || avg.mspt > 50) status.mspt = 'danger';
        if (avg.mspt > 40) status.mspt = 'warning';

        return { avg, peak, low, status }
    }, [data]);

    return (
        <div className="flex flex-col gap-4">
            <div className="border-b pb-1 flex gap-2 items-center">
                <h2 className="text-md font-medium">Stats</h2>

                <Refresh onClick={refresh} refreshing={refreshing} />

                {/* <Button className="ml-auto" size="xs">View full</Button> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* <Select value={period} onValueChange={(v) => setPeriod(v)}>
                    <SelectTrigger className="w-[180px] col-span-full">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="60">1 Hour</SelectItem>
                        <SelectItem value="30">30 Minutes</SelectItem>
                        <SelectItem value="15">15 Minutes</SelectItem>
                        <SelectItem value="5">5 Minutes</SelectItem>
                    </SelectContent>
                </Select> */}
                {/* <StatCard
                    className="order-2 lg:order-1"
                    data={filtered}
                    title="EU/t In"
                    name="euIn"
                    avg={avg.in}
                    low={low.in}
                    peak={peak.in}
                    status={status.in}
                /> */}

                <StatCard
                    className="order-1 lg:order-2"
                    data={data}
                    title="EU Total"
                    name="eu"
                    avg={avg.total}
                    low={low.total}
                    peak={peak.total}
                    status={status.total}
                />

                {/* <StatCard
                    className="order-3 lg:order-3"
                    data={filtered}
                    title="EU/t Out"
                    name="euOut"
                    avg={avg.out}
                    low={low.out}
                    peak={peak.out}
                    status={status.out}
                /> */}

                <StatCard
                    className="order-5 lg:order-4"
                    data={data}
                    title="MSPT"
                    name="mspt"
                    avg={avg.mspt}
                    low={low.mspt}
                    peak={peak.mspt}
                    status={status.mspt}
                    formatter={(n) => n.toFixed(2) + "ms"}
                />

                <StatCard
                    className="order-4 lg:order-5"
                    data={data}
                    title="EU/t Difference"
                    name="euDiff"
                    avg={avg.diff}
                    low={low.diff}
                    peak={peak.diff}
                    status={status.diff}
                />

                <StatCard
                    className="order-6 lg:order-6"
                    data={data}
                    title="TPS"
                    name="tps"
                    avg={avg.tps}
                    low={low.tps}
                    peak={peak.tps}
                    status={status.tps}
                    formatter={(n) => n.toFixed(1)}
                />
            </div>

            <div className="flex flex-col">
                <h2 className="text-sm font-medium pb-1 flex gap-2 items-center">EU/t In/Out</h2>
                <div className="lg:hidden w-full h-28 rounded-sm border shadow-sm bg-card">
                    <MultiLineChart
                        data={data}
                        names={["euIn", "euOut", "euDiff"]}
                        colors={["green", "red", "indigo"]}
                        size="card"
                        valueFormatter={(n) => toPowerUnit(n) + "/t"}
                        lineOnly={true}
                    />
                </div>
                <div className="hidden lg:block w-full h-72 bg-card rounded-sm shadow-sm border">
                    <ThresholdWithParentSize data={data} />
                </div>
            </div>
        </div>
    )
}
