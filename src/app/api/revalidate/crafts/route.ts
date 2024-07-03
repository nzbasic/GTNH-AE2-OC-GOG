import { getCpusCached, getItemHistoryCached } from "@/util/cache";
import { revalidateTag } from "next/cache";

export const maxDuration = 60

export async function POST() {
    revalidateTag("active-crafts")

    // // sleep 1 second
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // const cpus = await getCpusCached();
    // const craftPromises = cpus.filter((cpu: any) => !!cpu.craft_id).map((cpu: any) => getItemHistoryCached(cpu.craft_id));

    // await Promise.all(craftPromises);

    return new Response('revalidated');
}
