# Debug Strategy

> Tailored to the actual layers in this codebase.

---

## Layer Map

```
Browser (React)
    ↓ fetch()
Next.js API Route (app/api/*)
    ↓ getSession / db query / AI call
lib/ (business logic)
    ↓ db.*
NeonDB (PostgreSQL via Drizzle)
    ↓ or
Firebase Storage
    ↓ or
Vapi / Gemini / ElevenLabs (external)
    ↓ (async)
Vapi Webhook → /api/vapi-webhook
```

---

## How to Trace an Issue

### 1. UI Issues (Component not rendering, wrong data displayed)

**Start at:** the page/component file

Checklist:
- Is the component `"use client"`? If not, hooks won't work
- Is data coming from a server component (prop) or a client fetch?
- Open browser DevTools → Network tab → find the API call the component is making
- Check the request URL, method, headers (Authorization cookie present?)
- Check the response status and body

Common pitfalls:
- Context not provided: `useCallAgent must be used within a CallAgentProvider` → check `layout.jsx` has the provider
- JSONB data shape mismatch: `voiceConfig?.someField` returns undefined because the JSONB was saved empty `{}`
- Framer Motion SSR: If animations fail to hydrate, add `"use client"` to the wrapper

---

### 2. API Route Issues (500 errors, unexpected responses)

**Start at:** `app/api/[route]/route.js`

Checklist:
- Check server logs for the `[CONTEXT]` prefix line: `[VAPI WEBHOOK]`, `[API CREATE]`, etc.
- Is `getSession` returning a user? Log `user?.id` at the top of the handler
- Is the DB query correct? Run the equivalent Drizzle query in `npm run db:studio`
- Is the content-type being branched correctly? (JSON vs FormData in create routes)

Common pitfalls:
- `GEMNI_API_KEY` vs `GEMINI_API_KEY` — check which one the route uses
- `await headers()` must be called inside the route handler, not at module level
- Vapi webhook must always return 200 — if it's returning 500, Vapi will retry and duplicate processing

---

### 3. Authentication Issues (401 responses, redirects to sign-in)

**Start at:** `middleware.js` and `lib/auth.js`

Checklist:
- Is the cookie `better-auth.session_token` present in the browser? (DevTools → Application → Cookies)
- Is the cookie name correct for the environment? (`__Secure-` prefix in production)
- Is `BASE_URL` env var set correctly? better-auth uses it for OAuth redirects
- For Google OAuth: check `GOOGLE_AUTH_CLIENT_ID` and `GOOGLE_AUTH_CLIENT_SECRET` (note: different from `GOOGLE_CLIENT_ID` for Sheets)

Debugging `getSession`:
```js
const sessionData = await getSession(await headers());
console.log("Session:", JSON.stringify(sessionData)); // Log full session object
```

---

### 4. Database Issues (Drizzle queries failing)

**Start at:** `lib/database.js` then the schema in `lib/db/schemaCharacterAI.js`

Checklist:
- Run `npm run db:studio` to inspect actual table data
- Check for unique constraint violations: `user_character_unq`, `agent_action_timing_unq`, `call_agent_action_value_unq`
- Check for foreign key violations: deleting a user cascades to many tables — verify cascade behavior
- JSONB column updates: if a PATCH saves only one field of a JSONB column, other fields are wiped — use spread/merge

Tracing a Drizzle query:
```js
// Add this temporarily to see the SQL generated
import { sql } from "drizzle-orm";
console.log(db.query.callAgents.findFirst({ where: eq(callAgents.id, 1) }).toSQL());
```

---

### 5. AI / Gemini Issues (Empty responses, parse errors)

**Start at:** `lib/gemini/`, `lib/recruitment/analysisEngine.js`, or the specific API route calling Gemini

Checklist:
- Is `GEMINI_API_KEY` set in the env? (and `GEMNI_API_KEY` for character chat routes)
- Is the model name correct? Current: `gemini-2.5-flash`
- Is `responseMimeType: "application/json"` set when you expect JSON output?
- Log the raw response before parsing: `console.log("[DEBUG] Raw Gemini:", responseText)`
- Trim markdown fences: `.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim()`

Gemini JSON parse failure flow:
```
Gemini returns:  ```json { ... } ```
JSON.parse fails → "Unexpected token `"
Fix: strip markdown → parse clean string
```

---

### 6. Vapi Issues (Calls not starting, webhooks not firing)

**Start at:** `app/api/vapi-webhook/route.js` and the start-test-call route

Checklist:
- Check Vapi dashboard for webhook delivery logs — did Vapi try to send the webhook?
- Is the webhook URL registered in the Vapi dashboard pointing to the correct domain?
- Is `VAPI_SECRET_KEY` set? (Used for auth headers to Vapi API)
- Is `NEXT_PUBLIC_VAPI_PUBLIC_KEY` set? (Used by browser SDK)
- For recruitment interviews: is `metadata.sessionId` being passed when starting the call?

Webhook payload inspection:
```js
// Temporarily add to /api/vapi-webhook/route.js
console.log("[VAPI DEBUG] Full payload:", JSON.stringify(body, null, 2));
```

---

### 7. Firebase Storage Issues (Audio/avatar upload failures)

**Start at:** `configs/firebaseAdmin.js` and `lib/firebase/upload.js`

Checklist:
- Is `FIREBASE_ADMIN_PRIVATE_KEY` correctly formatted? (Newlines as `\n` in env, or use JSON)
- Is the bucket name correct? Typically `projectId.appspot.com`
- Is `admin.apps.length > 0` at the time of storage access?
- Check Firebase Console → Storage for the uploaded file path

Firebase Admin initialization order:
```
configs/firebaseAdmin.js initializes admin
↓
API route imports admin
↓
getStorage(admin.apps[0]).bucket() → must happen after initialization
```

---

### 8. Google Sheets Issues (Export fails)

**Start at:** `lib/google/sheetsHelper.js` and `app/api/integrations/oauth/google/callback/route.js`

Checklist:
- Is the Google OAuth token for Sheets stored in `user_connections` with `provider='google'`?
- Is the token expired? (Check `refreshToken` flow in `lib/google/googleAuth.js`)
- Use `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — these are for the Sheets integration, separate from `GOOGLE_AUTH_CLIENT_ID` for login

---

## Console Log Conventions

The codebase uses bracketed prefixes. Search logs by prefix:

| Prefix | Location |
|---|---|
| `[VAPI WEBHOOK]` | `app/api/vapi-webhook/route.js` |
| `[ANALYSIS TRIGGER]` | `app/api/callagents/[agentid]/calls/[callid]/analyze/route.js` |
| `[ANALYSIS]` | `lib/gemini/actionExtractor.js` |
| `[API CREATE]` | `app/api/callagents/create/route.js` |
| `[Interview Session]` | `app/api/interview/session/route.js` |
| `Analysis Engine Error` | `lib/recruitment/analysisEngine.js` |
| `Quiz Gen Error` | `app/api/trainee/quiz/generate/route.js` |

To trace a flow end-to-end, filter logs by these prefixes in the server console.
