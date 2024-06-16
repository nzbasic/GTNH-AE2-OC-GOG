"use client"

import { CraftRow } from "@/types/supabase"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "./ui/data-table"
import { toAEUnit } from "@/util/unit"
import { Button } from "./ui/button"
import Link from "next/link"
import { formatName } from "@/util/ae2"
import { DateTime } from "luxon"

const columns: ColumnDef<CraftRow>[] = [
    {
        accessorKey: "item_name",
        header: () => <div className="text-xs">Item</div>,
        cell: ({ row }) => (
            <div className="text-xs">{formatName(row.original.item_name)}</div>
        ),
    },
    {
        accessorKey: "quantity",
        header: () => <div className="text-right text-xs">Quantity</div>,
        id: "quantity",
        cell: ({ row }) => {
            return <div className="text-right text-xs">{row.original.quantity}</div>
        }
    },
    {
        accessorKey: 'duration',
        header: () => <div className="text-right text-xs">Duration</div>,
        cell: ({ row }) => {
            const duration = DateTime
                .fromISO(row.original.ended_at ?? DateTime.now().toISO())
                .diff(DateTime.fromISO(row.original.created_at), ['hours', 'minutes', 'seconds'])
                .toHuman({ maximumFractionDigits: 0, unitDisplay: 'narrow' });
            return <div className="text-right text-xs">{duration}</div>
        }
    },
    {
        id: "actions",
        header: () => <div className="text-xs text-right">Actions</div>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <Link className="ml-auto" href={`/crafts/${row.original.id}`}>
                    <Button size="xs" variant="ghost" className="text-xs">View</Button>
                </Link>
            </div>
        )
    }
]

type Props = {
    crafts: CraftRow[]
    refreshing: boolean;
}

export default function SavedCraftsTable({ crafts, refreshing }: Props) {
    return (
        <DataTable name="crafts" columns={columns} data={crafts} refreshing={refreshing} />
    );
}
