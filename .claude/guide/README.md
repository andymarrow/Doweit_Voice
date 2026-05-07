# Doweit Voice integration setup guides

This folder contains step-by-step setup instructions for each external integration. Each guide is self-contained — you don't need to read them in order.

## Phase A — Post-call notifications (shipped)

- [Slack](./slack.md) — OAuth-based; create an app, add scopes, connect.
- [Telegram](./telegram.md) — bot token from @BotFather, find chat ID, connect.
- [Email (SMTP)](./email.md) — works with Gmail (app password), Outlook, Mailgun, etc.

## Phase B — Mid-call calendar (shipped)

- [Cal.com](./calcom.md) — gives the agent live calendar superpowers (check availability + create bookings during a call).

## Phase C — Phone numbers (shipped)

- [Twilio](./twilio.md) — bring your own Twilio numbers; Doweit + Vapi handle routing.
- [Vapi-hosted numbers](./vapi-numbers.md) — buy a number directly on Vapi and sync.

## Phase D — Sheets verification (shipped)

- [Google Sheets](./google-sheets.md) — three blocker bugs fixed; manual export works end-to-end.

## Site assistant (shipped)

- [Doweit Voice site assistant](./site-assistant.md) — global voice-driven nav widget powered by `@doweit/voice@0.1.6`. One-shot bootstrap + env var.

---

## Required environment variables

Add these to `Doweit_Voice/.env.local` once per workspace. Restart `npm run dev` after editing.

```bash
# Required for the encryption layer that stores third-party credentials
ENCRYPTION_KEY=                # any 32-character string (must be exactly 32)

# Required if you intend to use Slack (OAuth)
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# Required for Phase B/C (already in your env from earlier work)
VAPI_SECRET_KEY=
BASE_URL=http://localhost:3000

# Optional — only set if Vapi server-side webhook URL differs
NEXT_PUBLIC_WEBHOOK_URL=https://your-public-domain/api/vapi-webhook
```

`ENCRYPTION_KEY` example (any 32 chars): `aBcDeFgHiJkLmNoPqRsTuVwXyZ123456`

> Telegram, Email, Cal.com, and Twilio do **not** need server-side env vars. Their credentials are entered per-user in the UI and stored encrypted in the database.

## Database migrations

After pulling new integration work, run:

```bash
npm run db:push
```

Tables added:

- **Phase A:** `agent_integrations`, `message_templates`, `integration_dispatch_log`
- **Phase C:** `phone_numbers`

(Phase B reuses the `agent_integrations` table with `provider='calcom'` — no new tables.)

## Dependency install

The Email integration uses Nodemailer:

```bash
npm install nodemailer
```

(All other integrations use only built-in `fetch` — no additional dependencies.)

## Quick sanity checklist after everything is set up

1. `.env.local` has `ENCRYPTION_KEY`, `VAPI_SECRET_KEY`, `BASE_URL`, and (if using Slack) `SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET`
2. `npm run db:push` succeeded — the four new tables exist
3. Workspace **Integrations** page shows cards for: Slack, Telegram, Email, Cal.com, Twilio (and Google Sheets / ElevenLabs / Zapier from before)
4. Agent's **Integrations** sidebar entry opens the per-agent rules page
5. Phone Numbers page lists your numbers (after at least one import/sync)
6. Agent dashboard's first widget is a phone-number card (warning if unassigned, summary if assigned)

If any of the above is wrong, check the relevant per-integration guide for the missing piece.
