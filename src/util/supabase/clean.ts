import { createAdminClient } from "./service_worker";
import { DateTime, DateTimeUnit } from "luxon";

type Insert = {
    id: number;
    created_at: string;
    type: string;
}

function findToDeleteBetween(inserts: Insert[], time1: DateTime, time2: DateTime, groupUnit: DateTimeUnit) {
    const toDelete: number[] = [];

    // group all inserts by minute between dayAgo and hourAgo
    const periodGroups = inserts.reduce((acc, insert) => {
        const created_at = DateTime.fromISO(insert.created_at);
        if (created_at < time2 || created_at > time1) {
            return acc;
        }

        const minute = created_at.startOf(groupUnit).toISO();
        if (!minute) {
            return acc;
        }

        if (!acc[minute]) {
            acc[minute] = [];
        }

        acc[minute].push(insert);

        return acc;
    }, {} as Record<string, Insert[]>);

    // keep 1 per minute of each insert.type
    for (const period in periodGroups) {
        const periodInserts = periodGroups[period];
        const periodInsertsByType = periodInserts.reduce((acc, insert) => {
            if (!acc[insert.type]) {
                acc[insert.type] = [];
            }

            acc[insert.type].push(insert);

            return acc;
        }, {} as Record<string, Insert[]>);

        for (const type in periodInsertsByType) {
            const typeInserts = periodInsertsByType[type];
            if (typeInserts.length > 1) {
                toDelete.push(...typeInserts.slice(1).map(insert => insert.id));
            }
        }
    }

    return toDelete;
}

export async function clean() {
    const supabase = await createAdminClient();

    // Data retention:
    // Keep all items from the past hour
    // Keep 1 per minute for the past day
    // After that, keep 1 per hour
    // All inserts are tracked on the "inserts" table, use that to find which data to remove

    const res = await supabase.from("inserts").select("id, created_at, type");
    if (!res.data) {
        return;
    }

    const now = DateTime.now();
    const dayAgo = now.minus({ days: 1 });
    const hourAgo = now.minus({ hours: 1 });

    const toDelete: number[] = [];

    const inserts = res.data as Insert[];

    const toDeleteDay = findToDeleteBetween(inserts, hourAgo, dayAgo, "minute");
    toDelete.push(...toDeleteDay);

    const toDeleteOverDay = findToDeleteBetween(inserts, DateTime.fromISO("1970-01-01T00:00:00.000Z"), dayAgo, "hour");
    toDelete.push(...toDeleteOverDay);

    // relations have cascade delete
    for (const id of toDelete) {
        await supabase.from("inserts").delete().eq("id", id);
    }

    return;
}
