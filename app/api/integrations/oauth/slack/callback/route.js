export const dynamic = "force-dynamic";
// app/api/integrations/oauth/slack/callback/route.js
//
// Slack redirects users here after they authorize the app. We exchange the
// auth code for a bot access token and store it under provider='slack'.

import { NextResponse } from "next/server";
import { exchangeOAuthCode } from "@/lib/integrations/adapters/slack";
import { saveConnection } from "@/lib/integrations/connections";

export async function GET(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const back = (status) =>
        NextResponse.redirect(`${baseUrl}/callagents/Integrations?${status}`);

    if (error) {
        console.error("[SLACK CALLBACK] error from Slack:", error);
        return back(`error=slack_${encodeURIComponent(error)}`);
    }
    if (!code || !state) {
        return back("error=slack_missing_params");
    }

    // Decode state to recover the userId we set on the way out.
    let userId;
    try {
        const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
        userId = decoded.userId;
    } catch {
        return back("error=slack_bad_state");
    }
    if (!userId) return back("error=slack_no_user");

    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return back("error=slack_server_misconfigured");
    }

    try {
        const tokenInfo = await exchangeOAuthCode({
            code,
            clientId,
            clientSecret,
            redirectUri: `${baseUrl}/api/integrations/oauth/slack/callback`,
        });
        await saveConnection(userId, "slack", tokenInfo);
        return back("status=success&provider=slack");
    } catch (e) {
        console.error("[SLACK CALLBACK] exchange failed:", e?.message, e?.detail);
        return back(`error=slack_exchange_failed`);
    }
}
