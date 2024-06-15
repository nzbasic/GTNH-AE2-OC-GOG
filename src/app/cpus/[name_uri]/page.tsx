import { fetchCPU } from "@/util/supabase/fetch"
import CPUItems from "@/components/cpu-items"
import { createAdminClient } from "@/util/supabase/service_worker"

type Props = {
    params: {
        name_uri: string
    }
}

export const revalidate = 60;

export default async function CPU({ params: { name_uri } }: Props) {
    const name = decodeURIComponent(name_uri)

    const client = await createAdminClient()
    const data = await fetchCPU(client, name);

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
                <CPUItems name={name} initialData={data} />
            ) : (
                <p>Not crafting anything</p>
            )}
        </div>
    )
}
