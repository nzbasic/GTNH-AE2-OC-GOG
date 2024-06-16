import { mcAuth } from "@/util/supabase/auth";
import OrderItemForm from "./order-item-form";

type Props = {
    initialData: string[];
}

export default async function OrderItem({ initialData }: Props) {
    const { onWhitelist } = await mcAuth();

    if (!onWhitelist) return null;

    return (
        <div className="flex flex-col gap-2">
            <h2 className="border-b text-md font-medium pb-1">Order Item</h2>
            <OrderItemForm craftables={initialData} />
        </div>
    );
}
