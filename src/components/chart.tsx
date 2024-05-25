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

    const minWithMargin = min - (max - min) * 5;
    const maxWithMargin = max + (max - min) * 5;

    return (
        <LineChart
            className={cn({
                'h-28 border rounded-sm': size === 'card',
                'h-96 border rounded': size === 'full',
            })}
            data={data}
            index="date"
            categories={[name]}
            colors={['indigo']}
            valueFormatter={toAEUnit}
            showYAxis={false}
            showXAxis={false}
            showGridLines={true}
            showLegend={false}
            minValue={minWithMargin}
            maxValue={maxWithMargin}
        />
    );
}
