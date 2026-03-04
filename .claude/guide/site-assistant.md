# Doweit Voice site assistant — setup guide

This is the global chat widget that floats on every page of Doweit Voice and lets you navigate the app by voice — *"take me to phone numbers"*, *"open my clinic agent"*, *"go back"*. It uses the published `@doweit/voice` SDK against an internal SDK app you create with one click.

You will:

1. Run a one-shot bootstrap to create the SDK app + manifest in your DB
2. Copy the public key into `.env.local`
3. Restart `npm run dev`
4. Open any page → see the floating chat bubble bottom-right → speak

---

## 1. Bootstrap the site-assistant SDK app

Make sure you're signed in to the app first (the bootstrap binds the SDK app to your user). Then visit this URL in your browser **while logged in**:

```
http://localhost:3000/api/sdk/site-assistant/bootstrap
```

You'll get a JSON response like:

```json
{
  "success": true,
  "publicKey": "dw_pub_<48 hex chars>",
  "agentId": 123,
  "appId": 7,
  "manifestVersion": 1,
  "envHint": "Add this to .env.local then restart `npm run dev`:\nNEXT_PUBLIC_DOWEIT_SITE_PUBLIC_KEY=dw_pub_..."
}
```

What it does:
- **Find-or-creates** a Call Agent named "Doweit Voice Site Assistant" with a navigation-flavoured system prompt
- **Find-or-creates** an `sdkApps` row owned by you with a fresh public key
- **Always inserts** a new manifest version with the latest navigation actions from `lib/siteAssistant/manifest.js`

It's idempotent — running it again reuses the same agent + app and just bumps the manifest version. Do this whenever you change the navigation actions in `lib/siteAssistant/manifest.js`.

## 2. Add the public key to `.env.local`

In `Doweit_Voice/.env.local`:

```bash
NEXT_PUBLIC_DOWEIT_SITE_PUBLIC_KEY=dw_pub_<paste the key from step 1>
```

The `NEXT_PUBLIC_` prefix is required so the client-side widget can read it. Restart `npm run dev` so the new env var takes effect.

## 3. Use it

Open any page in the app. You should see a blue floating button bottom-right. Click it → the chat panel opens. Press the mic and speak:

- *"Take me to phone numbers"* → router pushes to `/callagents/phone-numbers`
- *"Open call agents"* → router pushes to `/callagents`
- *"Show me Alan AI"* → router pushes to `/test-sdk`
- *"Open my clinic agent"* → fetches the agents list, fuzzy-matches the name, navigates
- *"Go back"* → `router.back()`

You should also be able to type questions in the input box if the mic isn't working in your environment.

## How it works

```
SiteAssistant.jsx (client)
  → DoweitClient.register({ navigate, open_agent, go_back })
  → DoweitWidget mounts UI
       ↓
  [User speaks] → 16-bit PCM @ 16 kHz → /api/sdk/live (WebSocket)
       ↓
  Gemini Live (with site-assistant system prompt + manifest tools)
       ↓
  Either: tool_call → SiteAssistant handler → router.push(...)
  Or:     audio reply → played in browser
       ↓
  inputAudioTranscription → text_user bubble
  outputAudioTranscription → text bubble
```

## Adding more navigation actions

1. Edit `lib/siteAssistant/manifest.js` — add the action shape + system-prompt section list
2. Edit `app/_components/SiteAssistant.jsx` — register the matching client-side handler
3. Re-hit `/api/sdk/site-assistant/bootstrap` to publish a new manifest version

The manifest version is what the server-side `/api/sdk/live` proxy reads to expose tools to Gemini, so a fresh bootstrap is required after every action change.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Widget doesn't appear at all | `.env.local` is missing `NEXT_PUBLIC_DOWEIT_SITE_PUBLIC_KEY`, or you forgot to restart `npm run dev` |
| Bootstrap returns 401 | You're not signed in — open `/sign-in` first, then re-hit the URL |
| Widget shows "Connection Error" | Check the dev server logs for `[WS Proxy]` errors. Most common: `GEMINI_API_KEY` missing in `.env.local` |
| Mic asks for permission then nothing happens | Browser blocked autoplay/audio context — click the mic button explicitly to grant the gesture |
| Agent answers "I can't navigate to that" | The destination isn't in `SECTION_TO_PATH` (in `SiteAssistant.jsx`) or in the manifest's section list — add it in both places + re-bootstrap |
| Voice latency still slow | Make sure you're on `@doweit/voice@0.1.6`+ (the smaller-buffer + VAD-tuning fixes). `npm ls @doweit/voice` should show 0.1.6 or higher |

## Privacy notes

- The widget only listens when you press the mic — it does not run continuously
- Audio is streamed to your own Gemini Live session via the same `/api/sdk/live` proxy used everywhere else
- The "current path" is the only piece of UI state shared with the model — see `bindState` in `SiteAssistant.jsx`
