import { Stats } from "@/types/supabase";
import Card, { CardVariant } from "./card";
import { toPowerUnit } from "@/util/unit";
import MultiLineChart from "./multi-chart";
import cn from 'classnames';

type Props = {
    data: Stats[];
    title: string;
    name: string;
    avg: number;
    peak: number;
    low: number;
    status: CardVariant;
    formatter?: (value: number) => string;
    className?: string;
}

export default function StatCard({ data, title, name, status, avg, peak, low, formatter = toPowerUnit, className }: Props) {
    return (
        <Card variant={status} className={cn(className, 'grid grid-cols-[120px_1fr] gap-x-4')}>
            <div className="flex gap-2">
                <div className="flex flex-col">
                    <p className="font-medium mb-2">{title}</p>

                    <div className="grid grid-cols-[50px_70px]">
                        <p>Current</p>
                        <p className="text-right font-mono">{formatter(Number(data[data.length - 1][name as keyof Stats]))}</p>

                        <p>Average</p>
                        <p className="text-right font-mono">{formatter(avg)}</p>

                        <p>High</p>
                        <p className="text-right font-mono">{formatter(peak)}</p>

                        <p>Low</p>
                        <p className="text-right font-mono">{formatter(low)}</p>
                    </div>
                </div>
            </div>

            <MultiLineChart
                lineOnly
                data={data}
                names={[name]}
                size="card"
                valueFormatter={formatter}
                colors={[cn({
                    'indigo': status === 'neutral',
                    'green-500': status === 'good',
                    'red-500': status === 'danger',
                    'orange-500': status === 'warning',
                })]}
            />
        </Card>
    )
}
