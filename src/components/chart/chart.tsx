import { toAEUnit } from "@/util/unit";
import { LineChart } from "@tremor/react";
import cn from 'classnames';

type Props<T> = {
    data: T[];
    name: string;
    size: 'full' | 'card';
}

export default function LineChartHero<T>({ data, name, size }: Props<T>) {
    const min = Math.min(...data.map((d: any) => d[name]));
    const max = Math.max(...data.map((d: any) => d[name]));

    const minWithMargin = min - ((min * 10) / 100);
    const maxWithMargin = max + ((max * 10) / 100);

    return (
        <LineChart
            className={cn('bg-card shadow-sm', {
                'h-28 border rounded-sm': size === 'card',
                'h-96 border rounded p-2 py-4': size === 'full',
            })}
            data={data}
            index="date"
            categories={[name]}
            colors={['indigo']}
            valueFormatter={toAEUnit}
            showYAxis={size === 'full'}
            showXAxis={size === 'full'}
            showGridLines={true}
            showLegend={false}
            minValue={minWithMargin}
            maxValue={maxWithMargin}
        />
    );
}
