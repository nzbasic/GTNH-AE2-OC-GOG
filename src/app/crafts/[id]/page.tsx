import { fetchCraft, fetchCraftItemHistory } from "@/util/supabase/fetch"
import ActiveCPUItems from "@/components/cpu-items"
import { createAdminClient } from "@/util/supabase/service_worker"
import { ReducedItemHistoryPoint } from "@/types/supabase"
import { DateTime } from "luxon"

type Props = {
    params: {
        id: string
    }
}

export const revalidate = 60;

export default async function CPU({ params: { id } }: Props) {
    const client = await createAdminClient()
    const res = await fetchCraft(client, id);

    if (!res) return (
        <div>
            <p>Craft Not found</p>
        </div>
    )

    const { craft, cpu } = res;

    const isActive = !!cpu.final_output;

    let itemHistory: Record<string, ReducedItemHistoryPoint[]> = {}
    if (isActive || craft.save) {
        itemHistory = await fetchCraftItemHistory(client, id);
    }

    const duration = DateTime.fromISO(craft.ended_at).diff(DateTime.fromISO(craft.created_at), ['hours', 'minutes', 'seconds']).toHuman({ maximumFractionDigits: 0 });

    return (
        <div className="flex flex-col gap-2">
            <p>Crafting: {craft.item_name}</p>
            <p>CPU: {cpu.name}</p>
            {Object.entries(itemHistory).length > 0 ? (
                <ActiveCPUItems initialData={cpu} craft={craft} initialItemHistory={itemHistory} />
            ) : (
                <>
                    <p>Status: Inactive</p>
                    <p>Duration: {duration}</p>
                    <p>This craft was not saved, or it may still be loading.</p>
                </>
            )}
        </div>
    )
}
