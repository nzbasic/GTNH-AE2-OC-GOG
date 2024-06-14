import { Button } from "@/components/ui/button";
import { logout } from "@/util/supabase/auth";
import { createClient } from "@/util/supabase/server";
import Link from "next/link";

export default async function AuthFail({ searchParams: { message } }: { searchParams: { message?: string } }) {
    const client = createClient();
    const user = await client.auth.getUser();

    const isLoggedIn = !!user.data;

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2>Authentication Failed</h2>
                <p>Message: {message ?? 'unknown'}</p>
            </div>

            <form className="flex items-center gap-2">
                {isLoggedIn && (
                    <Button formAction={logout} disabled={!isLoggedIn}>Logout</Button>
                )}
                <Link href="/"><Button>Home</Button></Link>
            </form>
        </div>
    );
}
