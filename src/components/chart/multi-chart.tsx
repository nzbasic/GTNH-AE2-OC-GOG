import { toAEUnit } from "@/util/unit";
import { LineChart } from "@tremor/react";
import cn from 'classnames';
import { useMemo } from "react";
import { ChartWithParentSize } from "./xychart";

type Props<T> = {
    data: T[];
    names: string[];
    colors?: string[];
    size: 'full' | 'card';
    valueFormatter?: (value: number) => string;
    lineOnly?: true;
    scaleType?: string;
}

export default function MultiLineChart<T extends object>({ data, names, colors = ["indigo"], size, valueFormatter = toAEUnit, lineOnly, scaleType }: Props<T>) {
    const [min, max] = useMemo(() => {
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;
        data.forEach((d: any) => {
            names.forEach((name: string) => {
                const value = d[name];
                if (value < min) {
                    min = value;
                }
                if (value > max) {
                    max = value;
                }
            });
        });
        return [min, max];
    }, [data, names]);

    const minWithMargin = min - ((min * 10) / 100);
    const maxWithMargin = max + ((max * 10) / 100);

    if (size === 'full') return (
        <div className="h-72 lg:h-96 w-full">
            <ChartWithParentSize data={data} x={(d: any) => new Date(d['created_at']).getTime()} y={(d: any) => d[names[0]]} scaleType={scaleType} />
        </div>
    )

    return (
        <LineChart
            className={cn('bg-card shadow-sm', {
                'h-28 border rounded-sm': size === 'card',
                // 'h-96 border rounded p-2 py-4': size === 'full',
                'border-0 p-0 shadow-none w-full h-full bg-transparent': lineOnly
            })}
            data={data}
            index="date"
            categories={names}
            colors={colors}
            valueFormatter={valueFormatter}
            showYAxis={!lineOnly}
            showXAxis={!lineOnly}
            showGridLines={!lineOnly}
            showLegend={false}
            minValue={minWithMargin}
            maxValue={maxWithMargin}
        />
    );
}
