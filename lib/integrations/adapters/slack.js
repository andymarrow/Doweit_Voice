// lib/integrations/adapters/slack.js
//
// Slack Web API wrapper. We use the OAuth `bot` token stored in
// userConnections under provider='slack'. Connection payload shape:
//   { accessToken, teamId, teamName, botUserId, scope }
//
// Outgoing message: we render the user's template into Block Kit so links and
// fields look native in Slack rather than dumping markdown.

const SLACK_API = "https://slack.com/api";

async function slackPost(method, token, body) {
    const res = await fetch(`${SLACK_API}/${method}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.ok) {
        const err = new Error(json.error || "slack_unknown_error");
        err.detail = json;
        throw err;
    }
    return json;
}

async function slackGet(method, token, params = {}) {
    const url = new URL(`${SLACK_API}/${method}`);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!json.ok) {
        const err = new Error(json.error || "slack_unknown_error");
        err.detail = json;
        throw err;
    }
    return json;
}

// Convert the rendered message body into Block Kit. We keep the user's text as
// the leading section, then attach an "Extracted actions" section listing the
// key/value pairs, and finally a button linking back to the call detail page.
export function renderSlackBlocks({ body, ctx, agentName }) {
    const blocks = [
        {
            type: "header",
            text: {
                type: "plain_text",
                text: `📞 ${agentName || "Call Agent"} — call summary`,
                emoji: true,
            },
        },
        {
            type: "section",
            text: { type: "mrkdwn", text: body || " " },
        },
    ];

    if (ctx._actionsList && ctx._actionsList.length > 0) {
        const fields = ctx._actionsList.slice(0, 10).map((a) => ({
            type: "mrkdwn",
            text: `*${a.displayName}*\n${a.value}`,
        }));
        blocks.push({ type: "divider" });
        blocks.push({ type: "section", fields });
    }

    if (ctx.call?.transcriptUrl && ctx.call.transcriptUrl !== "—") {
        blocks.push({
            type: "actions",
            elements: [
                {
                    type: "button",
                    text: { type: "plain_text", text: "Open call" },
                    url: ctx.call.transcriptUrl,
                    style: "primary",
                },
            ],
        });
    }

    return blocks;
}

export async function postSlackMessage({ token, channelId, text, blocks }) {
    return slackPost("chat.postMessage", token, {
        channel: channelId,
        text: text || "Call summary", // fallback for notifications
        blocks,
    });
}

// Pull list of channels the bot can post to. Used by the channel picker UI.
// Returns { channels: [{ id, name, is_private, is_member }] }.
export async function listSlackChannels(token, cursor) {
    return slackGet("conversations.list", token, {
        types: "public_channel,private_channel",
        limit: 200,
        exclude_archived: true,
        cursor,
    });
}

// Exchange OAuth code for an access token + team metadata.
export async function exchangeOAuthCode({ code, clientId, clientSecret, redirectUri }) {
    const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
    });
    const res = await fetch(`${SLACK_API}/oauth.v2.access`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
    });
    const json = await res.json();
    if (!json.ok) {
        const err = new Error(json.error || "slack_oauth_failed");
        err.detail = json;
        throw err;
    }
    // Persist only what we need at message-send time.
    return {
        accessToken: json.access_token, // bot token (xoxb-...)
        teamId: json.team?.id,
        teamName: json.team?.name,
        botUserId: json.bot_user_id,
        scope: json.scope,
    };
}
