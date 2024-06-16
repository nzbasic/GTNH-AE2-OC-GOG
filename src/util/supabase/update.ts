"use server"

import { mcAuth } from "./auth";
import { createAdminClient } from "./service_worker";


export async function toggleSaveCraft(id: number, save: boolean) {
    const { onWhitelist } = await mcAuth();
    if (!onWhitelist) return "Not logged in";

    const adminClient = await createAdminClient();

    const { error } = await adminClient.from('crafts').update({ save }).eq('id', id);

    return error;
}

export async function orderItem(item: string, quantity: number) {
    const { onWhitelist, username } = await mcAuth();
    if (!onWhitelist) return "Not logged in";

    const adminClient = await createAdminClient();

    const { error } = await adminClient.from('instructions').insert({ sent_by: username, status: 'awaiting-assignment', type: 'craft', data: { item, quantity } });

    return error;
}
