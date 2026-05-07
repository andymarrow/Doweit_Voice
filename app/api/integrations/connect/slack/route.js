export const dynamic = "force-dynamic";
// app/api/integrations/connect/slack/route.js
//
// Initiates the Slack OAuth flow. Redirects the user to Slack with our
// app's bot scopes and a state nonce. Slack will redirect back to
// /api/integrations/oauth/slack/callback after user approval.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import crypto from "crypto";

const SLACK_AUTHORIZE = "https://slack.com/oauth/v2/authorize";

// Bot scopes we need:
//   chat:write       — post messages (channels we're added to)
//   channels:read    — list public channels in the picker
//   groups:read      — list private channels we're a member of
//   im:write         — DM individual users (future use)
const BOT_SCOPES = ["chat:write", "channels:read", "groups:read"];

export async function GET(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json(
            { error: "Slack integration is not configured on the server." },
            { status: 500 },
        );
    }

    const redirectUri = `${process.env.BASE_URL || "http://localhost:3000"}/api/integrations/oauth/slack/callback`;
    // Encode userId in state so the callback can attribute the connection.
    // Sign it with a hash to prevent tampering.
    const nonce = crypto.randomBytes(8).toString("hex");
    const state = Buffer.from(JSON.stringify({ userId, nonce })).toString("base64url");

    const url = new URL(SLACK_AUTHORIZE);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("scope", BOT_SCOPES.join(","));
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);

    return NextResponse.redirect(url.toString());
}
