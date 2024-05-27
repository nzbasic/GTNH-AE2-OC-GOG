import { createAdminClient } from "../supabase/service_worker";

type Rule = {
    type: 'item';
    rule: ItemRule;
}

type ItemRule = {
    item_name: string;
    tests: {
        [level: string]: {
            condition: (quantity: number) => boolean;
            message: string | ((quantity: number, item: string) => string);
            repeat?: true;
            warnAfter?: string;
        }
    }
}

const rules: Rule[] = [
    {
        type: 'item',
        rule: {
            item_name: 'drop of Cetane-Boosted Diesel',
            tests: {
                warning: {
                    condition: (quantity: number) => quantity < 2000000,
                    message: (quantity) => `Warning: CBD < 2M (${quantity})`,
                    repeat: true,
                },
                normal: {
                    condition: (quantity: number) => quantity > 4000000,
                    message: 'CBD is back to normal (>4M)',
                    warnAfter: 'warning',
                }
            }
        }
    }
]

export async function tryWarnDiscord(items: Record<string, number>) {
    const client = await createAdminClient();
    const res = await client.from('warning').select("*").order('created_at', { ascending: false });
    const warnings = res.data ?? [];

    for (const { rule } of rules) {
        const item = items[rule.item_name];
        if (!item) return;

        const last = warnings.find(warning => warning.item_name === rule.item_name);
        for (const [level, test] of Object.entries(rule.tests)) {
            if (test.warnAfter && last.level !== test.warnAfter) {
                continue;
            }

            if (last.level === level && !test.repeat) {
                continue;
            }

            if (! test.condition(item)) {
                continue;
            }

            await client.from('warning').insert({ item_name: rule.item_name, level, quantity: item });

            if (process.env.DISCORD_WEBHOOK) {
                const message = typeof test.message === 'function' ? test.message(item, rule.item_name) : test.message;

                fetch(process.env.DISCORD_WEBHOOK, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: message })
                });
            }
        }
    }
}
