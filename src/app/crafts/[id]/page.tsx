import { fetchCraft } from "@/util/supabase/fetch"
import ActiveCPUItems from "@/components/cpu-items"
import { createAdminClient } from "@/util/supabase/service_worker"
import { DateTime } from "luxon"
import { getItemHistoryCached, getItemHistoryFinishedCached } from "@/util/cache"

type Props = {
    params: {
        id: string
    }
}

export const maxDuration = 60;
export const revalidate = false;
export const dynamic = "force-static";

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

    const itemHistory = isActive ? await getItemHistoryCached(craft.id) : craft.save ? await getItemHistoryFinishedCached(craft.id) : null;

    const duration = DateTime.fromISO(craft.ended_at).diff(DateTime.fromISO(craft.created_at), ['hours', 'minutes', 'seconds']).toHuman({ maximumFractionDigits: 0 });

    return (
        <div className="flex flex-col gap-2">
            <p>Crafting: {craft.item_name}</p>
            <p>CPU: {cpu.name}</p>
            {itemHistory ? (
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
