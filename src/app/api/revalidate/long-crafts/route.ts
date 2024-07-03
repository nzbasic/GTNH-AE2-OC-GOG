import { getItemHistoryLongCached } from "@/util/cache";
import { createAdminClient } from "@/util/supabase/service_worker";
import { DateTime } from "luxon";
import { revalidateTag } from "next/cache";

export const maxDuration = 60

export async function POST() {
    // // temporary
    // return new Response('not implemented', { status: 501 });

    revalidateTag("long-active-crafts")

    // // sleep 1 second
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // const client = await createAdminClient();
    // const { data } = await client.from("crafts").select("id, created_at").is('ended_at', null);
    // const crafts = data ?? [];

    // // get timezone from frist craft
    // const firstCraft = crafts[0];
    // const firstCraftTime = DateTime.fromISO(firstCraft.created_at);
    // const timezone = firstCraftTime.zoneName;

    // const now = DateTime.now().setZone(timezone!)

    // const promises = [];
    // for (const craft of crafts) {
    //     const craftTime = DateTime.fromISO(craft.created_at);
    //     const hours = now.diff(craftTime, 'hours').hours;

    //     if (hours > 6) {
    //         promises.push(getItemHistoryLongCached(craft.id));
    //     }
    // }

    // await Promise.all(promises);

    return new Response('revalidated');
}
