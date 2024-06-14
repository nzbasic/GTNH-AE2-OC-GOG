import { Button } from "./ui/button";
import { login, logout, mcAuth } from "@/util/supabase/auth";

export default async function Auth() {
    const { username, isLoggedIn, onWhitelist } = await mcAuth();

    if (isLoggedIn) {
        return (
            <form className="flex items-center gap-4">
                <p>Hi {username}, you are {!onWhitelist && 'not'} on the whitelist!</p>

                <Button formAction={logout} variant="outline">Logout</Button>
            </form>
        )
    }

    return (
        <form>
            <Button className="gap-2" variant="outline" formAction={login}>
                <span>Login with Microsoft</span>
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1528 1528">
                   	<g id="Layer">
                  		<path fill="#f25022" d="M0 0L724.96 0L724.96 725.8L0 725.8L0 0Z" />
                  		<path fill="#7fba00" d="M801.27 0L1526.24 0L1526.24 725.8L801.27 725.8L801.27 0Z" />
                  		<path fill="#00a4ef" d="M0 802.2L724.96 802.2L724.96 1528L0 1528L0 802.2Z" />
                  		<path fill="#ffb900" d="M801.27 802.2L1526.24 802.2L1526.24 1528L801.27 1528L801.27 802.2Z" />
                   	</g>
                </svg>
            </Button>
        </form>
    );
}
