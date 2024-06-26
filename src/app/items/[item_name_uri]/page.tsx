import AutoItemChart from "@/components/chart/auto-item-chart"
import { FlatJoinedItemRow } from "@/types/supabase"
import { formatName } from "@/util/ae2"
import { DateTime } from "luxon"
import { toAEUnit } from "@/util/unit"
import cn from 'classnames';
import { getItemsCached } from "@/util/cache"

type Props = {
    params: {
        item_name_uri: string
    }
}

export const revalidate = 60;
export const maxDuration = 60;

export default async function Item({ params: { item_name_uri } }: Props) {
    const item_name = decodeURIComponent(item_name_uri)

    const data = await getItemsCached(item_name);

    if (!data) return (
        <div>
            <p>Item not found</p>
        </div>
    )

    const now = data[data.length - 1]
    const reversed = data.toReversed()

    // find the first data point that is older than 1 hour, 1 week
    const hour = reversed.find((d: any) => DateTime.fromISO(d.created_at) < DateTime.now().minus({ hour: 1 }))
    const week = reversed.find((d: any) => DateTime.fromISO(d.created_at) < DateTime.now().minus({ week: 1 }))

    function findDiff(a?: FlatJoinedItemRow, b?: FlatJoinedItemRow) {
        if (!a || !b) return undefined

        let symbol = '';
        if (a.quantity > b.quantity) symbol = '+'
        else if (a.quantity < b.quantity) symbol = '-'

        return (
            <span className={cn({ 'text-red-500': symbol === '-', 'text-green-500': symbol === '+' })}>
                {symbol}{toAEUnit(Math.abs(a.quantity - b.quantity))}
            </span>
        )
    }

    function toTimeString(iso?: string) {
        if (!iso) return "N/A"
        return DateTime.fromISO(iso).toFormat("dd/MM HH:mm")
    }

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">{formatName(item_name)}</h2>

            <div className="grid lg:grid-cols-[auto_auto_auto_1fr] gap-x-6 gap-y-2">
                <div>
                    <p className="text-sm">Current ({toTimeString(now.created_at)})</p>
                    <p>{toAEUnit(now?.quantity)}</p>
                </div>
                <div>
                    <p className="text-sm">Last hour ({toTimeString(hour?.created_at)})</p>
                    <p>{toAEUnit(hour?.quantity)} {findDiff(now, hour)}</p>
                </div>
                <div>
                    <p className="text-sm">Last week ({toTimeString(week?.created_at)})</p>
                    <p>{toAEUnit(week?.quantity)} {findDiff(now, week)}</p>
                </div>
            </div>

            <AutoItemChart initialData={data} name={item_name} size="full" />
        </div>
    )
}
