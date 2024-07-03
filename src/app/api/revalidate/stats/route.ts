import { getCpusCached, getHomeCached } from "@/util/cache";
import { revalidateTag } from "next/cache";

export const maxDuration = 60;

export async function POST() {
    // // temporary
    // return new Response('not implemented', { status: 501 });

    revalidateTag("stats")

    // sleep 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    await Promise.all([
        getHomeCached(),
        getCpusCached()
    ]);

    return new Response('revalidated');
}
