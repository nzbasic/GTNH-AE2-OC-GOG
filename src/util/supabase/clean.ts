import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./service_worker";
import { DateTime, DateTimeUnit } from "luxon";

type Insert = {
    id: number;
    created_at: string;
    type: string;
}

function startOf(dateTime: DateTime, unit: 'minute' | 'hour', quantity: number = 1) {
    const units = dateTime[unit];
    const rounded = Math.floor(units / quantity) * quantity;

    return DateTime.fromObject({ ...dateTime.toObject(), [unit]: rounded, second: 0, millisecond: 0 });
}

type Row = {
    id: number;
    created_at: string;
    type?: string;
}

function findToDeleteBetween(inserts: Row[], time1: DateTime, time2: DateTime, unit: 'minute' | 'hour', quantity: number = 1) {
    const toDelete: number[] = [];
    let hasType = false;

    // group all inserts by minute between dayAgo and hourAgo
    const periodGroups = inserts.reduce((acc, insert) => {
        if (insert.type) {
            hasType = true;
        }

        const created_at = DateTime.fromISO(insert.created_at);

        if (created_at.toMillis() > time2.toMillis() || created_at.toMillis() < time1.toMillis()) {
            return acc;
        }

        const period = startOf(created_at, unit, quantity).toISO()
        if (!period) {
            return acc;
        }

        if (!acc[period]) {
            acc[period] = [];
        }

        acc[period].push(insert);

        return acc;
    }, {} as Record<string, Row[]>);

    // keep 1 per minute of each insert.type
    for (const period in periodGroups) {
        const periodInserts = periodGroups[period];

        if (hasType) {
            const periodInsertsByType = periodInserts.reduce((acc, insert: Row) => {
                const row = insert as Required<Row>;

                if (!acc[row.type]) {
                    acc[row.type] = [];
                }

                acc[row.type].push(row);

                return acc;
            }, {} as Record<string, (Required<Row>)[]>);

            for (const type in periodInsertsByType) {
                const typeInserts = periodInsertsByType[type];
                if (typeInserts.length > 1) {
                    toDelete.push(...typeInserts.slice(1).map(insert => insert.id));
                }
            }
        } else {
            if (periodInserts.length > 1) {
                toDelete.push(...periodInserts.slice(1).map(insert => insert.id));
            }
        }
    }

    return toDelete;
}

async function cleanInserts(client: SupabaseClient, now: DateTime,  hourAgo: DateTime, dayAgo: DateTime) {
    const res = await client.from("inserts").select("id, created_at, type");
    if (!res.data) {
        return;
    }

    const inserts = res.data as Insert[];

    const toDelete: number[] = [];
    toDelete.push(...findToDeleteBetween(inserts, dayAgo, hourAgo, "minute"));
    toDelete.push(...findToDeleteBetween(inserts, DateTime.fromISO("1970-01-01T00:00:00.000Z"), dayAgo, "minute", 15));

    console.log("Inserts to delete: " + toDelete.length)

    // relations have cascade delete
    for (const id of toDelete) {
        await client.from("inserts").delete().eq("id", id);
    }
}

async function cleanLSC(client: SupabaseClient, now: DateTime,  hourAgo: DateTime, dayAgo: DateTime) {
    const res = await client.from("lsc").select("id, created_at");
    if (!res.data) {
        return;
    }

    const lscData = res.data;

    const toDelete: number[] = [];
    toDelete.push(...findToDeleteBetween(lscData, dayAgo, hourAgo, "minute"));
    toDelete.push(...findToDeleteBetween(lscData, DateTime.fromISO("1970-01-01T00:00:00.000Z"), dayAgo, "minute", 15));

    console.log("LSC to delete: " + toDelete.length)

    for (const id of toDelete) {
        await client.from("lsc").delete().eq("id", id);
    }
}

export async function clean() {
    const supabase = await createAdminClient();

    // Data retention:
    // Keep all items from the past hour
    // Keep 1 per minute for the past day
    // After that, keep 1 per hour
    // All inserts are tracked on the "inserts" table, use that to find which data to remove

    const now = DateTime.now();
    const dayAgo = now.minus({ days: 1 });
    const hourAgo = now.minus({ hours: 1 });

    await cleanInserts(supabase, now, hourAgo, dayAgo);

    const craftRes = await supabase.from("crafts").select('*').not('ended_at', 'is', null).eq('save', false)
    if (craftRes.data) {
        const crafts = craftRes.data
        for (const craft of crafts) {
            await supabase.from("item_crafting_status").delete().eq("craft_id", craft.id)
        }
    }

    // await cleanLSC(supabase, now, hourAgo, dayAgo);

    console.log('clean done')

    return;
}
