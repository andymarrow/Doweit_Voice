# Cal.com integration — setup guide

This integration gives your call agents real-time scheduling superpowers:

- During a call the agent can answer "when are you free Tuesday?" by checking the calendar live.
- The agent can lock in a confirmed booking on the spot — caller gets a Cal.com email confirmation moments later.
- Per-agent scope toggle: read-only (look-ups only), read+book, or full access including reschedule.
- Specific to each agent: every agent can have its own event type, time zone, and scope.

You will:

1. Get a Cal.com API key
2. (Optional) Create the right event types
3. Paste the key into the workspace Integrations page
4. Per agent, choose event type + scope + time zone
5. Test with a live call

---

## 1. Get a Cal.com API key

> **Important:** Cal.com **API v1** was decommissioned in 2025. Doweit Voice uses
> **API v2** (`https://api.cal.com/v2`). The same `cal_live_...` API key works
> for both, but make sure your account is active and has access to v2.

### Cloud Cal.com

1. Sign in at https://app.cal.com
2. Open **Settings** (top-right) → **Developer** → **API Keys**
3. Click **+ Add** — give it a name like "Doweit Voice integration"
4. Pick an expiry (or never expires). Click **Save**.
5. Copy the key — it starts with `cal_live_...`. **You can only see it once**, so paste it into Doweit Voice immediately.

### Self-hosted Cal.com

Same UI path: **Settings → Developer → API Keys**. Note your instance's API v2 base URL — typically `https://your-cal-host.com/api/v2`. Paste this into the optional **Base URL** field on the workspace Integrations card.

## 2. Set up your event types (optional but recommended)

The agent uses an **event type** as the template for any booking it makes — duration, location, default reminders, etc. Create them once on Cal.com and the agent reuses them.

Examples:

- **30-min consultation** — for sales calls
- **Hotel reservation** — 60 min, location field for table preference
- **Doctor appointment** — 15 min, hidden from public scheduling page

Visit **cal.com/event-types** to create one. Anything you set up there becomes selectable in the agent UI.

## 3. Connect Cal.com in Doweit Voice

In the app: **Call Agents → Integrations** → click the **Cal.com** card.

| Field | Value |
|---|---|
| Cal.com API Key | the `cal_live_...` key from step 1 |
| Base URL | leave blank for cloud Cal.com; set to your host's `/api/v1` URL for self-hosted |

Click **Connect**. We call `/me` on Cal.com to validate the key — if it works, the card flips to Connected.

## 4. Per-agent setup

Open any agent → **Integrations** in the sidebar. The first section, **Mid-call capabilities**, has a Cal.com card.

- **Event type** — pick from the list pulled live from your account
- **What can this agent do?**
  - **Disabled** — agent has no calendar access
  - **Read-only** — agent can answer "when am I free?" but won't book
  - **Read + Book** *(default)* — agent can check availability and lock in new bookings
  - **Full access** — read + book + reschedule existing bookings
- **Default time zone** — the IANA tz used when the caller doesn't specify one (e.g. `America/New_York`)
- **Auto-confirm bookings** — leave on for instant confirmations; turn off if you want to manually approve each booking in Cal.com first

Click **Save Cal.com settings**. The bottom of the card shows which function tools were injected into your agent (`check_availability`, `create_booking`, etc.).

## 5. Test it

Open the **Test Agent** panel and start a web call. Try:

- *"When are you free on Friday?"* — agent should call `check_availability` and read back available slots.
- *"Book me Friday at 2 PM, my name is Jane and my email is jane@example.com."* — agent should call `create_booking` and confirm.

Within a few seconds Jane will receive a Cal.com confirmation email. Refresh the agent's **Calls** page — the call's transcript will show the agent calling the tools.

## How the magic works

When Cal.com is enabled for an agent we inject Vapi function tools into the assistant config:

```
check_availability(dateFrom, dateTo, timeZone)
list_upcoming_bookings(dateFrom, dateTo)
create_booking(start, end, attendeeName, attendeeEmail, attendeePhone, notes, timeZone)
```

Each tool's `server.url` points at this app's `/api/integrations/calcom/tool` endpoint. When the LLM decides to call a tool mid-conversation, Vapi POSTs the call here, we hit the Cal.com API, and Vapi reads our response back to the LLM — which then phrases it naturally for the caller. Latency is typically 1–2 seconds.

Scope filtering is server-side: if you set "Read-only" we don't even *expose* `create_booking` to the LLM, so a misbehaving model can't escape your guardrails.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Cal.com not connected" toast on the agent page | Connect the workspace card first |
| Empty event-type dropdown | You haven't created any event types yet — go to cal.com/event-types |
| Agent says "I can't check availability right now" | Wrong event type ID, or scope is set to "Disabled". Save the form again. |
| Booking created but no caller email | Caller's email wasn't captured in the call; the agent will fall back to a placeholder. Make sure your prompt asks for an email. |
| Time zones look wrong | Set the per-agent time zone (e.g. `America/Chicago`) — Cal.com defaults to UTC otherwise. |

## Privacy notes

- The API key is encrypted at rest with your `ENCRYPTION_KEY`. Only the server can decrypt it at runtime.
- We never read your Cal.com data outside an active call's tool invocations.
