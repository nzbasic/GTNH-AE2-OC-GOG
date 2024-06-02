import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./server";

export async function login() {
    "use server"

    const cookieStore = cookies();
    const client = createClient(cookieStore);

    const { data, error } = await client.auth.signInWithOAuth({
        provider: 'azure',
        options: {
            scopes: 'email openid XboxLive.signin',
            redirectTo: '/auth/callback',
        },
    });

    if (!data.url) return;
    return redirect(data.url)
}

export async function logout() {
    "use server"

    const cookieStore = cookies();
    const client = createClient(cookieStore);

    const { error } = await client.auth.signOut();

    if (error) {
        console.error(error);
    }

    redirect("/")
}

export async function getMCName(code: string) {
    "use server"

    const cookieStore = cookies();
    const client = createClient(cookieStore);

    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
        console.error(error);
        redirect("/");
    }

    const xblAuthRes = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
        body: JSON.stringify({
            "Properties": {
                "AuthMethod": "RPS",
                "SiteName": "user.auth.xboxlive.com",
                "RpsTicket": `d=${data.session.provider_token}`
            },
            "RelyingParty": "http://auth.xboxlive.com",
            "TokenType": "JWT"
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    if (!xblAuthRes.ok) {
        console.error("XBL Auth Failed");
        redirect("/");
    }
    const xblAuthData = await xblAuthRes.json();
    const xblToken = xblAuthData.Token;
    const uhs = xblAuthData.DisplayClaims.xui[0].uhs;

    const xstsRes = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
        body: JSON.stringify({
            "Properties": {
                "SandboxId": "RETAIL",
                "UserTokens": [
                    xblToken
                ]
            },
            "RelyingParty": "rp://api.minecraftservices.com/",
            "TokenType": "JWT"
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    if (!xstsRes.ok) {
        console.error("XSTS Failed");
        redirect("/");
    }
    const xstsData = await xstsRes.json();
    const xstsToken = xstsData.Token;

    const mcRes = await fetch("https://api.minecraftservices.com/authentication/login_with_xbox", {
        body: JSON.stringify({
            "identityToken": `XBL3.0 x=${uhs};${xstsToken}`
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    if (!mcRes.ok) {
        console.error("MC Auth Failed");
        console.log(mcRes);
        redirect("/");
    }
    const mcData = await mcRes.json();
    const mcToken = mcData.access_token;

    const finalRes = await fetch("https://api.minecraftservices.com/minecraft/profile", {
        headers: {
            authorization: `Bearer ${mcToken}`,
            'Accept': 'application/json'
        },
    })

    if (!finalRes.ok) {
        console.error("MC Profile Failed");
        redirect("/");
    }
    const finalData = await finalRes.json();
    const mcName = finalData.name;
    const mcError = finalData.error;

    console.log(mcName, mcError);

    // await client.auth.updateUser({ data: { }})

    console.log(error);
    console.dir(data, { depth: null });

    redirect("/")
}
