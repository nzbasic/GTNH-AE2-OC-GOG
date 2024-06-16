"use server"

import { redirect } from "next/navigation";
import { createClient } from "./server";
import { headers } from "next/headers";
import { createAdminClient } from "./service_worker";

export async function login() {
    "use server"

    const headersList = headers();
    const origin = headersList.get('origin') || 'https://gog.nzbasic.com/';

    const client = createClient();

    const { data, error } = await client.auth.signInWithOAuth({
        provider: 'azure',
        options: {
            scopes: 'email openid XboxLive.signin',
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (!data.url) return;
    return redirect(data.url)
}

export async function logout() {
    "use server"

    const client = createClient();

    const { error } = await client.auth.signOut();

    if (error) {
        console.error(error);
    }

    redirect("/")
}

export async function mcAuth() {
    "use server"

    const client = createClient();
    const user = await client.auth.getUser();

    const isLoggedIn = !user.error && !!user.data;
    let username: string;
    let onWhitelist = false;

    const adminClient = await createAdminClient();
    const { data, error } = await adminClient.from('mc_auth').select('*').eq('uid', user.data.user?.id).single();
    username = data?.username;

    if (username) {
        const { data, error } = await adminClient.from("auth").select("username").eq("username", username).single();
        onWhitelist = !error && data.username === username;
    }

    return {
        isLoggedIn,
        username,
        onWhitelist,
    };
}
