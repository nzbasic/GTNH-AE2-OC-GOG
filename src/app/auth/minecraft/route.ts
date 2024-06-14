import { createClient } from "@/util/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    console.log('/auth/minecraft called')

    const client = createClient();
    const session = await client.auth.getSession();
    const provider_token = session.data.session?.provider_token

    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    const redirectUrl = `${origin}`;

    const xblAuthRes = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
        body: JSON.stringify({
            "Properties": {
                "AuthMethod": "RPS",
                "SiteName": "user.auth.xboxlive.com",
                "RpsTicket": `d=${provider_token}`
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
        return NextResponse.redirect(redirectUrl);
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
        return NextResponse.redirect(redirectUrl);
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
        return NextResponse.redirect(redirectUrl);
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
        return NextResponse.redirect(redirectUrl);
    }
    const finalData = await finalRes.json();
    const name = finalData.name;
    const id = finalData.id;
    const mcError = finalData.error;

    if (mcError) {
        console.error(mcError);
        return NextResponse.redirect(redirectUrl);
    }

    if (name && id) {
        await client.auth.updateUser({ data: { minecraftName: name, minecraftId: id }});
    }

    return NextResponse.redirect(redirectUrl);
}
