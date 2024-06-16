"use client";

import React, { useState } from "react";

import {
  SearchSelect,
  SearchSelectItem,
} from '@tremor/react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { orderItem } from "@/util/supabase/update";
import { toast } from "sonner";

type Props = {
    craftables: string[];
};

export default function OrderItemForm({ craftables }: Props) {
    const [searchValue, setSearchValue] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedCraftable, setSelectedCraftable] = useState<string>();

    const filtered = React.useMemo(() => {
        return craftables.filter((craftable) =>
            craftable.toLowerCase().includes(searchValue.toLowerCase()),
        ).slice(0, 50);
    }, [searchValue]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selectedCraftable) {
            return;
        }

        const error = await orderItem(selectedCraftable, quantity);
        if (error) {
            toast.error("Failed to order item");
        } else {
            toast.success("Item ordered, wait up to 20 seconds for it to appear below (after a refresh)");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-start gap-2 max-w-sm">
            <SearchSelect
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                value={selectedCraftable}
                onValueChange={setSelectedCraftable}
            >
                {filtered.map(c => (
                    <SearchSelectItem key={c} value={c}>{c}</SearchSelectItem>
                ))}
            </SearchSelect>
            <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
            <Button className="h-full" variant="outline" type="submit">Submit</Button>
        </form>
    );
}
