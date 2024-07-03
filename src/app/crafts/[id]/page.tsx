import { fetchCPUs, fetchCraft, fetchSavedCrafts } from "@/util/supabase/fetch"
import ActiveCPUItems from "@/components/cpu/cpu-items"
import { createAdminClient } from "@/util/supabase/service_worker"
import { DateTime } from "luxon"
import { getItemHistoryCached, getItemHistoryFinishedCached, getItemHistoryLongCached } from "@/util/cache"
import { CraftRow } from "@/types/supabase"

type Props = {
    params: {
        id: string
    }
}

export const maxDuration = 60;
export const revalidate = 1800;
// export const dynamic = "force-static";

export async function generateStaticParams() {
    const toCache: { id: string }[] = []

    const client = await createAdminClient();

    const cpus = await fetchCPUs(client)
    for (const cpu of cpus) {
        if (cpu.craft_id) {
            toCache.push({ id: cpu.craft_id.toString() });
        }
    }

    const saved = await fetchSavedCrafts(client);
    for (const craft of saved) {
        if (!toCache.find(c => c.id === craft.id.toString())) {
            toCache.push({ id: craft.id.toString() });
        }
    }

    return toCache;
}

async function getItems(isActive: boolean, craft: CraftRow) {
    if (isActive) {
        const hours = DateTime.fromISO(craft.ended_at).diff(DateTime.fromISO(craft.created_at), ['hours']).hours;

        if (hours > 6) {
            return getItemHistoryLongCached(craft.id);
        } else {
            return getItemHistoryCached(craft.id);
        }
    } else if (craft.save) {
        return getItemHistoryFinishedCached(craft.id);
    } else {
        return null;
    }
}

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

    const itemHistory = await getItems(isActive, craft)

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
