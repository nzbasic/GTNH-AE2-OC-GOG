"use client"

import { defaultFavs } from "@/util/default";
import { useLocalStorage } from "usehooks-ts"
import React from "react";
import { arrayMoveImmutable } from 'array-move';
import SortableList, { SortableItem } from "react-easy-sort";
import { Favourite } from "./favourite-chart";
import { createClient } from "@/util/supabase/client";
import { fetchItems } from "@/util/supabase/fetch";
import { FlatJoinedItemRow } from "@/types/supabase";

export default function Favourites() {
    const [initialData, setInitialData] = React.useState<Record<string, FlatJoinedItemRow[]>>()
    const [favourites, setFavourites] = useLocalStorage('favourites', defaultFavs)

    function onSortEnd(oldIndex: number, newIndex: number) {
        setFavourites((array) => arrayMoveImmutable(array, oldIndex, newIndex));
    };

    function removeFavourite(name: string) {
        setFavourites((array) => array.filter(fav => fav !== name));
    }

    const fetchFavourites = React.useCallback(async function fetchFavourites() {
        const client = createClient();
        const items = await fetchItems(client, favourites)

        setInitialData(items);
    }, []);

    React.useEffect(() => {
        fetchFavourites();
    }, [fetchFavourites]);

    return (
        <div className="flex flex-col gap-4">
            <h2 className="border-b text-md font-medium pb-1">Favourite Items (1hr)</h2>

            <div className="flex flex-col gap-4">
                <SortableList
                    onSortEnd={onSortEnd}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 gap-y-4"
                    draggedItemClassName="dragged"
                >
                    {favourites.map(fav => (
                        <SortableItem key={fav}>
                            <Favourite name={fav} remove={() => removeFavourite(fav)} initialData={initialData?.[fav] ?? []} />
                        </SortableItem>
                    ))}
                </SortableList>
            </div>
        </div>
    )
}
