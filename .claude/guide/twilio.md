# Twilio integration — setup guide

Bring your own Twilio phone numbers into Doweit Voice. Once connected, your numbers can:

- **Receive inbound calls** that route directly to a chosen agent
- **Place outbound calls** including the "Call my phone" test from the agent dashboard
- Keep their existing Twilio billing — you pay Twilio for SMS/voice, Doweit Voice doesn't add a markup

You will:

1. Make sure you have a Twilio account with at least one number purchased
2. Grab your Account SID + Auth Token
3. Connect Twilio in Doweit Voice
4. Import the specific number(s) you want to use
5. Assign a number to an agent and test a real call

---

## 1. Buy a number on Twilio (if you haven't)

1. Sign in at https://console.twilio.com
2. Open **Phone Numbers → Manage → Buy a number**
3. Filter by country and capabilities (Voice is required for our use case; SMS is optional)
4. Click **Buy** on a number you like — typically $1–2/month per number

You don't need to configure any TwiML, webhooks, or SIP trunks on the Twilio side — Doweit Voice + Vapi handle all of that automatically when you import.

## 2. Get your Account SID + Auth Token

1. From the Twilio console homepage, scroll to **Account Info** (or **Account → API keys & tokens**)
2. Copy:
   - **Account SID** — starts with `AC` followed by 32 hex characters
   - **Auth Token** — click "View" to reveal, then copy the 32-character string

> **Security:** treat the Auth Token like a password. Anyone with it can place calls on your bill.

> **Test credentials:** Twilio has separate test credentials that won't actually place calls. Use your **live** credentials.

## 3. Connect Twilio in Doweit Voice

In the app: **Call Agents → Integrations** → click the **Twilio** card.

| Field | Value |
|---|---|
| Account SID | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| Auth Token | the 32-character token |

Click **Connect**. We hit Twilio's `Account` API to validate the credentials before saving — if it works, the card flips to Connected.

## 4. Import a number

Navigate to **Call Agents → Phone Numbers** (top-level page next to Integrations). Click **+ Add number**.

In the **Twilio (BYO)** tab you'll see every number you've bought on Twilio. For each:

- **Import** — registers the number with Vapi (Vapi takes over routing — see "What happens behind the scenes" below) and saves it in Doweit Voice
- **Imported** badge — already imported; nothing to do

After importing, the number shows up on the main Phone Numbers list with capabilities + an "Unassigned" chip.

## 5. Assign to an agent and test

Open any agent → look at the **Dashboard** (the first sidebar entry). You'll see either:

- **No number connected** banner with a **Connect a phone number** button
- Or, if already connected, the assigned number with a **Call my phone** button

Click **Connect a phone number**, pick from your unassigned numbers, click **Connect**. Behind the scenes we:

1. Create a Vapi assistant configured with the agent's prompt + voice + (if enabled) Cal.com tools
2. Bind that assistant to the imported phone number on Vapi
3. Save the assignment in our DB

That's the full pipeline. Now:

- **Inbound test:** call the number from your phone. Vapi answers with the agent's greeting.
- **Outbound test:** click **Call my phone** on the dashboard, enter your phone in E.164 format (`+15551234567`), click **Call me**. Your phone rings within seconds and you can talk to the agent.

## What happens behind the scenes

Doweit Voice doesn't run its own telephony backbone. We use **Vapi** as the call-routing infrastructure, with three providers possible underneath:

```
Caller → Twilio (your number) → Vapi (your assistant) → LLM + voice
                                       ↘ Cal.com tools (optional)
                                       ↘ Action extraction post-call
                                       ↘ Slack/Telegram/Email notifications
```

When you connect Twilio + import a number, we make a one-time POST to Vapi's `/phone-number` endpoint with `{ provider: "twilio", twilioAccountSid, twilioAuthToken, number }`. Vapi takes responsibility for:

- Auto-configuring the Twilio number's voice URL to point at Vapi's media servers
- Receiving inbound calls and connecting them to the assigned assistant
- Placing outbound calls when you trigger the "Call my phone" flow

Your Twilio credentials are stored encrypted on Vapi's side too. Doweit Voice's local DB only holds the Vapi phone-number ID + your encrypted Twilio creds (used in case we need to re-import).

## Reassigning / unassigning

- **Reassign:** assigning a number to a different agent automatically unassigns it from the previous one.
- **Unassign:** the user-X icon next to the number on the agent dashboard releases it back to the Phone Numbers pool.
- **Delete:** from the Phone Numbers page, the trash icon removes the number from our DB and releases Vapi's claim — your Twilio number is untouched (still on your Twilio account).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Twilio rejected those credentials` | Check the SID is exactly 34 chars (AC + 32 hex). Auth token is 32 chars. Use live, not test, creds. |
| Twilio import shows no available numbers | You haven't purchased any numbers on Twilio yet. Go to https://www.twilio.com/console/phone-numbers/incoming. |
| Inbound call doesn't ring the agent | After importing, did you assign the number to an agent? On the agent's dashboard. |
| "Call my phone" returns "isn't fully wired to Vapi" | The number's Vapi binding broke. Click Unassign then Connect again on the agent dashboard. |
| Outbound call fails with "premium number" | Some destinations (premium-rate, restricted countries) are blocked by Twilio. Try a different number. |

## Cost notes

- Twilio charges you for the call duration (per-minute) + the number's monthly fee
- Vapi charges you separately for the AI processing (LLM tokens + voice synthesis)
- Doweit Voice itself doesn't add any per-minute billing on top — we just orchestrate
