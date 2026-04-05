# External Integrations

> How each external service interacts with the system, risks, and maintenance rules.

---

## 1. Vapi AI (`@vapi-ai/server-sdk`, `@vapi-ai/web`)

**What it does:**
- Manages the entire voice call lifecycle (inbound/outbound telephony)
- Provides TTS API for Character AI voice responses
- Delivers call recordings, transcripts, and metadata via webhooks

**How it integrates:**
| Touchpoint | File | Direction |
|---|---|---|
| TTS endpoint | `app/api/chat/[characterId]/message/route.js` | Outbound → Vapi |
| Start test call | `app/api/callagents/[agentid]/start-test-call/route.js` | Outbound → Vapi |
| Call configuration | `app/api/callagents/[agentid]/config/route.js` | Outbound → Vapi |
| Webhook receiver | `app/api/vapi-webhook/route.js` | Inbound ← Vapi |
| Browser SDK | `app/callagents/[agentid]/_components/TestAgentSidePanel.jsx` | Browser ↔ Vapi |

**Risks when modifying:**
- `vapi-webhook` handles TWO flows (standard calls + recruitment) — modifying it can silently break one path
- Vapi expects HTTP 200 from webhook — if your code throws before the return, Vapi retries and creates duplicate records
- The `metadata.sessionId` field in Vapi call setup is how recruitment interviews are identified — if this field is missing, the webhook treats the call as a standard call
- TTS endpoint URL `https://api.vapi.ai/v1/audio/tts` is not a standard documented path — verify on Vapi API changes

**Rules:**
- Always return `{ received: true }` with status 200 in the webhook handler, even on errors
- Log the full webhook payload when debugging Vapi issues
- Keep `VAPI_SECRET_KEY` and `NEXT_PUBLIC_VAPI_PUBLIC_KEY` separate — one is server-only

---

## 2. Google Gemini (`@google/generative-ai`, `@google/genai`)

**What it does:**
- Primary AI brain for all text generation, analysis, extraction, and quiz creation
- Two distinct modes: standard text generation + live audio streaming

**How it integrates:**
| Usage | File | Model |
|---|---|---|
| Character chat dialogue | `app/api/chat/[characterId]/message/route.js` | gemini-2.5-flash |
| Live audio dialog | `lib/google-ai/gemini-chat-stream.js` | gemini-2.5-flash-preview-native-audio-dialog |
| Action value extraction | `lib/gemini/actionExtractor.js` | gemini-2.5-flash |
| Interview analysis | `lib/recruitment/analysisEngine.js` | gemini-2.5-flash |
| JD ingestion | `app/api/callagents/ingest/route.js` | gemini-2.5-flash |
| Quiz generation | `app/api/trainee/quiz/generate/route.js` | gemini-2.5-flash |

**Risks when modifying:**
- The model name `gemini-2.5-flash` is hardcoded in every file — if you upgrade to a new model, update all 6 locations
- The `gemini-2.5-flash-preview-native-audio-dialog` model is a preview model — it may be deprecated; check Google AI changelog
- Structured JSON mode (`responseMimeType: "application/json"`) can still return unexpected format — always try/catch JSON.parse
- The `GEMNI_API_KEY` typo means two different env vars power different parts of the system

**Rules:**
- Never change the prompt structure of `analysisEngine.js` or `actionExtractor.js` without verifying the JSON output schema still matches what the DB expects
- The interview analysis output schema (`fitScore`, `skillRadar`, `keyInsights`, `timelineSentiment`) is consumed directly by frontend chart components — changing it breaks the UI
- Test AI routes in isolation with `curl` before wiring to UI

---

## 3. Firebase (`firebase`, `firebase-admin`)

**What it does:**
- Cloud file storage for audio files (TTS output) and user/agent avatars
- Admin SDK for server-side uploads from API routes

**How it integrates:**
| Usage | File |
|---|---|
| Character audio upload | `app/api/chat/[characterId]/message/route.js` |
| Agent avatar upload | `app/api/callagents/create/route.js` → `lib/firebase/upload.js` |
| User avatar upload | `app/api/upload-avatar/route.js` |
| Interview screenshots | `app/api/interview/snapshot/route.js` |
| General storage helpers | `lib/firebase/storage.js` |
| Admin initialization | `configs/firebaseAdmin.js` |

**File path conventions:**
- Character audio: `chat-audio/{characterId}/{userId}/{timestamp}.mp3`
- Agent avatars: `agent-avatars/{userId}/{filename}`

**URL format:** `https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded_path}?alt=media`

**Risks when modifying:**
- All audio files are `predefinedAcl: "publicRead"` — they are publicly accessible to anyone with the URL
- Firebase Admin SDK initialization must complete before any storage access — check `admin.apps.length > 0`
- If the bucket name changes, all stored URL references in the DB become invalid

**Rules:**
- Never delete the `configs/firebaseAdmin.js` initialization pattern
- The bucket name comes from `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` env — keep it in env, not hardcoded
- For large audio files, consider storage cleanup strategy (files are never auto-deleted in current code)

---

## 4. Google OAuth & Google Sheets (`googleapis`)

**Two separate Google OAuth credentials are used:**

| Purpose | Env Var | Used In |
|---|---|---|
| User login (Google sign-in) | `GOOGLE_AUTH_CLIENT_ID` / `GOOGLE_AUTH_CLIENT_SECRET` | `lib/auth.js` |
| Sheets data export | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | `lib/google/googleAuth.js` |

**Sheets integration flow:**
1. User connects Google account → OAuth flow → tokens stored in `userConnections` (encrypted)
2. Per-agent setup links to a specific spreadsheet
3. Export call: `lib/google/sheetsHelper.js` writes rows to spreadsheet

**Risks when modifying:**
- Using the wrong Google client ID/secret breaks one of the two features
- Token refresh logic in `googleAuth.js` must be maintained — expired tokens cause silent export failures
- If `user_connections.encryptedAccessToken` decryption fails, Sheets exports fail with no clear error

**Rules:**
- Keep the two sets of Google credentials strictly separate
- Always decrypt the token before using it — the stored value is encrypted
- Log Sheets API errors with row data for debugging

---

## 5. ElevenLabs (`@elevenlabs/elevenlabs-js`)

**What it does:**
- Provides custom and cloned voices as an alternative to Vapi's built-in voices
- User API keys stored in `user_connections` with `provider='elevenlabs'`

**How it integrates:**
- Integration setup: `app/api/integrations/connect/elevenlabs/route.js`
- Voice listing: likely uses ElevenLabs SDK to sync voices to `voices` table
- Characters/agents can select ElevenLabs voices as `voiceProvider='elevenlabs'`

**Risks when modifying:**
- ElevenLabs API key is per-user (stored in `user_connections`) — don't use a global key
- Voice IDs from ElevenLabs are used in Vapi TTS calls — they must match exactly

---

## 6. NeonDB (via `@neondatabase/serverless`)

**What it does:**
- Serverless PostgreSQL — primary data store for all application data

**Connection:** `lib/database.js` — single Drizzle instance shared across all API routes.

**Risks when modifying:**
- NeonDB is serverless — cold starts can cause first-request latency; connection pooling matters
- Schema changes without `db:push` leave the DB and code out of sync
- The serverless driver has connection behavior differences from pg — be careful with transactions

**Rules:**
- Run `npm run db:push` after every schema change
- Never use raw SQL except where Drizzle can't express it (currently: JSONB field access with `->>`)
- The migration script at `lib/scripts/migration-script.js` exists for data migrations — use it for non-destructive data changes

---

## 7. Convex

**What it does:**
- Real-time backend for the workspace/code generation feature only
- Completely separate from the main NeonDB data

**How it integrates:**
- `convex/schema.js` defines its own `users` and `workspace` tables
- `convex/users.js` and `convex/workspace.js` for mutations/queries
- Connected via `NEXT_PUBLIC_CONVEX_URL` env var

**Risks when modifying:**
- Convex users are not linked to Drizzle users — there is no foreign key bridge
- Changes to Convex schema require re-running Convex CLI tooling
- Do not attempt to share data between Convex and NeonDB without building an explicit sync layer
