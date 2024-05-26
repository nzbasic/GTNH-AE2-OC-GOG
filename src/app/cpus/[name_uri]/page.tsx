import { createClient } from "@/util/supabase/client"
import { fetchCPU } from "@/util/supabase/fetch"
import CPUItems from "@/components/cpu-items"

type Props = {
    params: {
        name_uri: string
    }
}

export const dynamic = "force-dynamic";

export default async function CPU({ params: { name_uri } }: Props) {
    const name = decodeURIComponent(name_uri)

    const client = createClient()
    const data = await fetchCPU(client, name);

    console.log(data);

    if (!data) return (
        <div>
            <p>CPU Not found</p>
        </div>
    )

    const isActive = !!data.final_output;

    return (
        <div className="flex flex-col gap-2">
            <p>CPU Name: {name}</p>

            {isActive ? (
                <>
                    <p>Crafting: {data.final_output.quantity}x {data.final_output.item_name}</p>

                    <CPUItems name={name} initialData={data} />
                </>
            ) : (
                <p>Not crafting anything</p>
            )}

        </div>
    )
}
