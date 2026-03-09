# Slack integration — setup guide

This guide walks you through everything you need to connect Slack so any of your call agents can post a beautifully formatted summary into a Slack channel after every call.

You will:

1. Create a Slack app on api.slack.com
2. Add the right OAuth scopes
3. Set the redirect URL to point at this app
4. Copy the `Client ID` and `Client Secret` into your `.env.local`
5. Click **Add to Slack** on the workspace Integrations page
6. Configure a per-agent rule and test it

---

## 1. Create a Slack app

1. Go to https://api.slack.com/apps and click **Create New App** → **From scratch**.
2. Pick a name (e.g. **Doweit Voice**) and the Slack workspace you want to develop in.

> The workspace you choose here is the *development* workspace. Once you're happy with the setup, anyone can install your app into their workspace via the OAuth flow.

## 2. Add bot scopes

In the left sidebar, click **OAuth & Permissions**. Scroll down to **Scopes → Bot Token Scopes** and add these three:

- `chat:write` — post messages to channels the bot is in
- `channels:read` — list public channels (needed for the channel picker)
- `groups:read` — list private channels the bot has been invited to

You can leave **User Token Scopes** empty.

## 3. Set the OAuth redirect URL

Still on the **OAuth & Permissions** page, scroll up to **Redirect URLs** and click **Add New Redirect URL**:

```
http://localhost:3000/api/integrations/oauth/slack/callback
```

For production, also add your real domain (e.g. `https://your-domain.com/api/integrations/oauth/slack/callback`). Save.

## 4. Get your Client ID and Client Secret

Go to **Basic Information** in the left sidebar. Scroll down to **App Credentials**.

- Copy the **Client ID**
- Reveal and copy the **Client Secret**

Add these to your `.env.local` (in the `Doweit_Voice/` folder):

```bash
SLACK_CLIENT_ID=1234567890.1234567890123
SLACK_CLIENT_SECRET=abcdef1234567890abcdef1234567890
```

Make sure `BASE_URL` is also set in `.env.local`:

```bash
BASE_URL=http://localhost:3000
```

Restart `npm run dev` so the new env vars are picked up.

## 5. Connect Slack

In the app, navigate to **Call Agents → Integrations** (the workspace page) and click the **Slack** card. You'll see an **Add to Slack** button — click it.

Slack will ask you to authorise the app. Pick the workspace, then **Allow**. You'll be redirected back with a success toast.

## 6. Per-agent setup

Open any agent → **Integrations** in the sidebar. Click the **Send to Slack** card to add a rule:

- **Rule name:** something memorable, e.g. *"New leads → #sales"*
- **Slack channel:** pick from the searchable list. If a channel shows **Invite bot**, you must run `/invite @doweit` (or whatever you named your app) in that channel before the bot can post there.
- **Message:** customise the template body in the editor. Click variable chips to insert values like `{{call.summary}}` or `{{action.customer_name}}`. The right-hand pane shows a live preview.
- **When to fire:** keep "Every call" or limit to when specific actions are extracted.

Click **Send a test message** (the play icon on the rule card) to fire a sample message. If the channel doesn't show it, double-check that the bot is a member.

## Troubleshooting

| Error | Likely cause |
|---|---|
| `slack_exchange_failed` | Wrong Client Secret, or redirect URL doesn't exactly match what's in the Slack app config. |
| `not_in_channel` (failed dispatch) | Bot isn't a member of the channel. Run `/invite @doweit`. |
| `channel_not_found` | The channel was deleted, or it's private and the bot was removed. Pick a different channel. |
| Empty channel list in the picker | Slack token has insufficient scopes. Re-install the app after re-adding `channels:read` and `groups:read`. |

## What this integration does NOT do (by design)

- It does **not** read your Slack messages or DM history.
- It does **not** notify users via mention. Use channel topic/notifications.
- It does **not** support threads (yet — coming in a later phase).
