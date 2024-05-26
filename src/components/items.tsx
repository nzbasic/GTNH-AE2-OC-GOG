"use client"

import { Item } from "@/types/oc"
import { ItemRow } from "@/types/supabase"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "./ui/data-table"
import { toAEUnit } from "@/util/unit"
import { useLocalStorage } from "usehooks-ts"
import { MouseEventHandler } from "react"
import { Button } from "./ui/button"
import Link from "next/link"
import { defaultFavs } from "@/util/default"
import { formatName } from "@/util/ae2"

const columns: ColumnDef<ItemRow>[] = [
    {
        id: "fav",
        accessorFn: (row) => {

        },
        header: () => <div className="text-xs">Fav</div>,
        cell: ({ row }) => {
            const [favourites, setFavourites] = useLocalStorage("favourites", defaultFavs)

            const isFavourite = favourites && favourites.includes(row.getValue("item_name"))

            const toggleFavourite: MouseEventHandler<SVGSVGElement> = (e) => {
                e.stopPropagation();

                if (isFavourite) {
                    setFavourites(favourites.filter((f) => f !== row.getValue("item_name")))
                } else {
                    setFavourites(prev => [...(prev ?? []), row.getValue("item_name")])
                }
            }

            const fill = isFavourite ? "#FDD835" : 'lightgray';

            return (
                <svg onClick={toggleFavourite} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 128 128"><path fill={fill} d="m68.05 7.23l13.46 30.7a7.047 7.047 0 0 0 5.82 4.19l32.79 2.94c3.71.54 5.19 5.09 2.5 7.71l-24.7 20.75c-2 1.68-2.91 4.32-2.36 6.87l7.18 33.61c.63 3.69-3.24 6.51-6.56 4.76L67.56 102a7.033 7.033 0 0 0-7.12 0l-28.62 16.75c-3.31 1.74-7.19-1.07-6.56-4.76l7.18-33.61c.54-2.55-.36-5.19-2.36-6.87L5.37 52.78c-2.68-2.61-1.2-7.17 2.5-7.71l32.79-2.94a7.047 7.047 0 0 0 5.82-4.19l13.46-30.7c1.67-3.36 6.45-3.36 8.11-.01"/><path fill={fill} d="m67.07 39.77l-2.28-22.62c-.09-1.26-.35-3.42 1.67-3.42c1.6 0 2.47 3.33 2.47 3.33l6.84 18.16c2.58 6.91 1.52 9.28-.97 10.68c-2.86 1.6-7.08.35-7.73-6.13"/><path fill={fill} d="M95.28 71.51L114.9 56.2c.97-.81 2.72-2.1 1.32-3.57c-1.11-1.16-4.11.51-4.11.51l-17.17 6.71c-5.12 1.77-8.52 4.39-8.82 7.69c-.39 4.4 3.56 7.79 9.16 3.97"/></svg>
            )
        },
    },
    {
        accessorKey: "item_name",
        header: () => <div className="text-xs">Item</div>,
        cell: ({ row }) => (
            <div className="text-xs">{formatName(row.getValue("item_name"))}</div>
        ),
    },
    {
        accessorKey: "quantity",
        header: () => <div className="text-right text-xs">Quantity</div>,
        id: "human-quantity",
        cell: ({ row }) => {
            const formatted = toAEUnit(row.getValue("quantity"));
            return <div className="text-right text-xs">{formatted}</div>
        }
    },
    {
        accessorKey: "quantity",
        header: () => <div className="text-right text-xs hidden md:block">Raw</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("quantity"))
            const formatted = new Intl.NumberFormat("en-US", {}).format(amount)

            return <div className="text-right text-xs font-medium hidden md:block">{formatted}</div>
        },
    },
    {
        id: "actions",
        header: () => <div className="text-xs text-right">Actions</div>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <Link className="ml-auto" href={`/items/${row.getValue("item_name")}`}>
                    <Button size="xs" variant="ghost" className="text-xs">View</Button>
                </Link>
            </div>
        )
    }
]

type Props = {
    items: ItemRow[]
    name: string;
}

export default function ItemsTable({ items, name }: Props) {
    return (
        <DataTable columns={columns} data={items} name={name} />
    );
}
