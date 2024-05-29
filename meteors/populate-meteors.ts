// This file should be run manually from root
// npx tsx --env-file=.env ./meteors/populate-meteors.ts

import { promises as fs } from 'fs';
import { join } from 'path';
import { createAdminClient } from "@/util/supabase/service_worker";
import { Meteor, MeteorItem } from '@/types/supabase';

(async () => {
    const meteorFolder = join(__dirname, 'json');
    const files = await fs.readdir(meteorFolder);

    const client = await createAdminClient();

    for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const data = await fs.readFile(join(meteorFolder, file), 'utf-8');
        const info = JSON.parse(data);

        // in json contents is stored flat, e.g. [name, weight, name, weight]
        const contents: MeteorItem[] = [];
        for (let i = 0; i < info.ores.length; i += 2) {
            contents.push({
                item_name: info.ores[i],
                weight: info.ores[i + 1],
            });
        }

        const meteor: Omit<Meteor, 'id' | 'created_at'> = {
            name: file.replace('.json', ''),
            cost: info.cost,
            radius: info.radius,
            contents,
        }

        await client.from('meteors').delete().eq('name', meteor.name);
        await client.from('meteors').insert(meteor);
    }
})();
