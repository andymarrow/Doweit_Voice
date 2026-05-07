# Vapi-hosted phone numbers — setup guide

If you don't want to deal with Twilio at all, Vapi sells phone numbers directly. They're slightly more expensive than Twilio but require zero outside setup — buy on Vapi, sync to Doweit Voice, assign to an agent, done.

You will:

1. Buy a number on Vapi's dashboard
2. Click "Sync from Vapi" in Doweit Voice
3. Assign it to an agent and test

---

## 1. Buy a number on Vapi

> The same `VAPI_SECRET_KEY` you already have in `.env.local` is used by Doweit Voice to talk to Vapi. No additional connection step is needed.

1. Sign in at https://vapi.ai
2. Open **Phone Numbers** in the left sidebar
3. Click **Buy Number**
4. Pick a country + area code, complete the purchase

Vapi-hosted numbers come with voice routing pre-configured — no Twilio, no SIP trunks, no TwiML.

## 2. Sync to Doweit Voice

In the app: **Call Agents → Phone Numbers** → **+ Add number** → switch to the **Vapi-hosted** tab → click **Sync from Vapi**.

Doweit Voice fetches the list of all your Vapi-hosted numbers (and any BYO Twilio imports already on Vapi) and upserts them into the local Phone Numbers table. You'll see them appear in the main list immediately.

## 3. Assign to an agent

Same as Twilio: open an agent → Dashboard → **Connect a phone number** button → pick from the available list → **Connect**. Test with **Call my phone**.

## When to use Vapi-hosted vs Twilio (BYO)

| Use case | Recommended |
|---|---|
| Already have a Twilio account / numbers | Twilio (BYO) — keep your existing setup |
| Want the simplest possible setup | Vapi-hosted |
| Need SMS too (not just voice) | Twilio — Vapi-hosted numbers are voice-only at the time of writing |
| Need international numbers | Twilio has wider coverage |
| Want to keep all billing in one place | Vapi-hosted (it shows up on your Vapi invoice) |

## Troubleshooting

| Symptom | Fix |
|---|---|
| `VAPI_SECRET_KEY is not set` | Add it to `.env.local` and restart `npm run dev`. The key is in your Vapi dashboard under API Keys. |
| `Sync` finds nothing | You haven't bought any numbers on Vapi yet. Buy one first on https://vapi.ai/dashboard/phone-numbers. |
| Imported number won't ring on inbound | Make sure you've assigned it to an agent (agent dashboard → Connect a phone number). |

## Cost notes

Vapi typically charges:
- Monthly rental for the number itself
- Per-minute call rate (LLM + voice + telephony)

Check the latest pricing at https://vapi.ai/pricing.
