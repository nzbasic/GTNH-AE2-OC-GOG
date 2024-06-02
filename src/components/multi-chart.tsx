import { toAEUnit } from "@/util/unit";
import { LineChart } from "@tremor/react";
import cn from 'classnames';
import { useMemo } from "react";

type Props<T> = {
    data: T[];
    names: string[];
    colors?: string[];
    size: 'full' | 'card';
    valueFormatter?: (value: number) => string;
    lineOnly?: true;
}

export default function MultiLineChart<T>({ data, names, colors = ["indigo"], size, valueFormatter = toAEUnit, lineOnly }: Props<T>) {
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

    return (
        <LineChart
            className={cn('bg-card shadow-sm', {
                'h-28 border rounded-sm': size === 'card',
                'h-96 border rounded p-2 py-4': size === 'full',
                'border-0 p-0 shadow-none !h-auto bg-transparent': lineOnly
            })}
            data={data}
            index="date"
            categories={names}
            colors={colors}
            valueFormatter={valueFormatter}
            showYAxis={!lineOnly && size === 'full'}
            showXAxis={!lineOnly && size === 'full'}
            showGridLines={!lineOnly}
            showLegend={false}
            minValue={minWithMargin}
            maxValue={maxWithMargin}
        />
    );
}
