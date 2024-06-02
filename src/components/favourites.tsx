"use client"

import { defaultFavs } from "@/util/default";
import { useLocalStorage } from "usehooks-ts"
import React from "react";
import { arrayMoveImmutable } from 'array-move';
import SortableList, { SortableItem } from "react-easy-sort";
import { Favourite } from "./favourite-chart";

export default function Favourites() {
    const [favourites, setFavourites] = useLocalStorage('favourites', defaultFavs)

    function onSortEnd(oldIndex: number, newIndex: number) {
        setFavourites((array) => arrayMoveImmutable(array, oldIndex, newIndex));
    };

    function removeFavourite(name: string) {
        setFavourites((array) => array.filter(fav => fav !== name));
    }

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
                            <Favourite key={fav} name={fav} remove={() => removeFavourite(fav)} />
                        </SortableItem>
                    ))}
                </SortableList>
            </div>
        </div>
    )
}
