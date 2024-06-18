import { cn } from "@/lib/utils";
import { formatName } from "@/util/ae2";
import { toAEUnit } from "@/util/unit";

type Props = {
    items: {
        item_name: string;
        activeQuantity: number;
        pendingQuantity: number;
        storedQuantity: number;
        status: string;
    }[];
}

export default function CpuCurrentItems({ items }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {items.map((item, index) => (
                <div
                    className={cn('flex flex-col text-xs border p-2 rounded-sm bg-card min-w-0', {
                        'bg-green-100 dark:bg-green-900 border-green-500': item.status === 'active',
                        'bg-orange-100 dark:bg-orange-900 border-orange-500': item.status === 'pending',
                        '': item.status === 'stored',
                    })}
                    key={item.item_name}
                >
                    <p className="truncate">{formatName(item.item_name)}</p>
                    {item.status === 'active' && (
                        <p>Crafting {toAEUnit(item.activeQuantity)}, Pending {toAEUnit(item.pendingQuantity)}, Stored: {toAEUnit(item.storedQuantity)}</p>
                    )}
                    {item.status === 'pending' && (
                        <p>Pending {toAEUnit(item.pendingQuantity)}, Stored {toAEUnit(item.storedQuantity)}</p>
                    )}
                    {item.status === 'stored' && (
                        <p>Stored {toAEUnit(item.storedQuantity)}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
