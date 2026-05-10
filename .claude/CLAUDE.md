# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Doweit Voice — Engineering Brain

> This document is the operating manual for the Doweit Voice platform. Everything here is derived directly from the codebase. Do not treat this as a template.

---

## 0. Common Commands

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Run the built app
npm run lint         # next lint

npm run db:push      # Apply Drizzle schema changes to NeonDB (no migration files)
npm run db:studio    # Open Drizzle Studio at https://local.drizzle.studio
npm run migrate      # Run lib/scripts/migration-script.js (one-off data migrations)
```

There is **no test runner configured** — `package.json` has no `test` script and no Jest/Vitest/Playwright deps. Don't claim tests pass; verify behavior by exercising the UI or API directly.

Drizzle uses `db:push` (schema sync), not generated migration files. The `drizzle/` directory holds historical SQL but the live workflow is push-based — edit `lib/db/schemaCharacterAI.js`, then `npm run db:push`.

Convex (workspace feature only) is run separately via `npx convex dev` if you need to touch [convex/](convex/).

---

## 1. Project Overview

**Doweit Voice** is a multi-product AI voice platform. It bundles three distinct products under one application:

| Product | Route Prefix | Description |
|---|---|---|
| **Character AI** | `/characterai` | Create and chat (text + voice) with custom AI personas |
| **Call Agents** | `/callagents` | Build, configure, and deploy AI voice agents for inbound/outbound calls |
| **AI Recruitment** | `/agents` | End-to-end AI interview pipeline for recruiters, candidates, and trainees |

The landing page is `/voice-agents`. After authentication, users land at `/voice-agents-dashboard`.

---

## 2. Tech Stack (Inferred from package.json + code)

### Framework & Routing
- **Next.js 14** (App Router) — `app/` directory, file-based routing, Server Components + Client Components
- **React 18** — UI rendering

### Authentication
- **better-auth `^1.3.11`** — Email/password + Google OAuth. Drizzle adapter writes to NeonDB. Session cookies.
- Session cookie name: `better-auth.session_token` (dev) / `__Secure-better-auth.session_token` (prod)

### Database & ORM
- **Drizzle ORM `^0.33.0`** — Primary ORM. Schema in `lib/db/schemaCharacterAI.js`
- **@neondatabase/serverless `^0.9.5`** — PostgreSQL (NeonDB serverless driver)
- **Convex `^1.19.4`** — Secondary real-time DB used for workspace/code-generation feature only

### AI Services
- **@google/generative-ai `^0.17.1`** — Gemini 2.5 Flash (text generation, analysis, extraction)
- **@google/genai `^1.7.0`** — Gemini Live Streaming (native audio dialog model)
- **@vapi-ai/server-sdk `^0.9.3`** — Vapi AI for call management (server)
- **@vapi-ai/web `^2.3.7`** — Vapi AI browser SDK (for test calls in-browser)
- **openai `^6.1.0`** — OpenAI client (installed, currently commented-out as alternative to Gemini)
- **@elevenlabs/elevenlabs-js `^2.17.0`** — ElevenLabs (third-party voice integration)

### File Storage
- **uploadthing `^7.7.2`** — All file uploads (avatars, TTS audio, anti-cheat snapshots, call recordings) go through `lib/uploadthing/server.js` (`uploadFile`, `deleteFileByUrl`). Firebase has been removed; legacy `firebasestorage.googleapis.com` URLs already in DB still resolve (hybrid state).

### UI & Styling
- **Tailwind CSS `^3.4.1`** — Utility-first styling
- **Radix UI** — Primitive UI components (dialog, dropdown, select, tooltip, etc.)
- **shadcn/ui** — Component layer built on Radix UI, located in `components/ui/`
- **lucide-react `^0.436.0`** — Icon library
- **react-icons `^5.5.0`** — Additional icons
- **framer-motion `^12.18.1`** — Animations
- **next-themes `^0.4.6`** — Dark/light mode
- **react-hot-toast `^2.5.2`** — Toast notifications
- **recharts `^3.5.1`** — Charts (radar, line for analytics)

### Workflow Builder
- **@xyflow/react `^12.8.1`** (ReactFlow v12) — Visual workflow builder in `/callagents/workflow`
- **reactflow `^11.11.4`** — Legacy ReactFlow (both present)

### Other
- **googleapis `^160.0.0`** — Google Sheets export integration
- **react-markdown `^9.1.0`** — Markdown rendering
- **uuid4 `^2.0.3`** — UUID generation
- **drizzle-kit `^0.24.2`** — DB migrations (`npm run db:push`, `npm run db:studio`)

---

## 3. Key Directories

```
Doweit_Voice/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group — sign-in, sign-up pages
│   ├── _components/              # Global landing page components (Header, Hero)
│   ├── agents/                   # AI Recruitment platform
│   │   ├── modules/
│   │   │   ├── candidate/        # Candidate-facing: intro, form, device check, interview session
│   │   │   ├── recruiter/        # Recruiter: dashboard, create interview, analysis, DB, profile
│   │   │   ├── trainee/          # Trainee: training gym, quiz engine, mock engine, analysis
│   │   │   └── marketplace/      # Agent marketplace (browse, buy)
│   │   ├── components/Sidebar.jsx
│   │   └── layout.jsx
│   ├── callagents/               # Call Agent builder
│   │   ├── [agentid]/            # Per-agent pages
│   │   │   ├── configure/        # General, voice, call, integration config tabs
│   │   │   ├── prompt/           # System prompt editor (AskDoweit chat, templates)
│   │   │   ├── actions/          # Per-agent action assignment (before/during/after timing)
│   │   │   ├── calls/            # Call history, transcripts, audio player, actions data
│   │   │   ├── deployment/       # Deployment settings
│   │   │   └── _context/         # CallAgentContext (provides agent data to all sub-pages)
│   │   ├── actions/              # Global reusable actions library
│   │   ├── knowledgebase/        # KB management (text, file, URL)
│   │   ├── workflow/             # ReactFlow visual workflow builder
│   │   └── Integrations/         # Third-party integrations (OAuth, API keys)
│   ├── characterai/              # Character AI product
│   │   ├── create/               # Character creation form (voice, language, visibility)
│   │   └── chat/[characterid]/   # Chat interface with voice playback
│   ├── interview/[agentid]/      # Public magic-link interview page for candidates
│   ├── voice-agents/             # Marketing/landing page
│   ├── voice-agents-dashboard/   # Main dashboard post-login
│   └── api/                      # All API routes (see flows below)
│
├── lib/                          # Server-side business logic
│   ├── auth.js                   # better-auth config (DB adapter, providers)
│   ├── auth-client.js            # Client-side better-auth helpers
│   ├── database.js               # Drizzle + NeonDB connection instance
│   ├── db/
│   │   ├── schemaCharacterAI.js  # MASTER SCHEMA — all Drizzle tables
│   │   └── auth-schema.js        # Auth-specific tables (sessions, accounts, verifications)
│   ├── gemini/
│   │   └── actionExtractor.js    # Gemini: extract structured data from call transcripts
│   ├── google-ai/
│   │   └── gemini-chat-stream.js # Gemini Live: streaming audio+text for character chat
│   ├── recruitment/
│   │   └── analysisEngine.js     # Gemini: score + analyze interview transcripts
│   ├── uploadthing/
│   │   └── server.js             # UploadThing server helpers (uploadFile, deleteFileByUrl)
│   ├── google/
│   │   ├── googleAuth.js         # Google OAuth helpers
│   │   └── sheetsHelper.js       # Google Sheets write operations
│   ├── exportEngine.js           # Data export logic
│   └── utils/
│       └── crypto.js             # Hashing for API key storage
│
├── convex/                       # Convex backend (isolated — workspace feature)
│   ├── schema.js                 # users + workspace tables
│   └── workspace.js              # Workspace mutations/queries
│
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui primitives
│   └── custom/                   # App-specific reusable components
│
├── hooks/                        # Custom hooks (use-mobile, use-media-query)
├── configs/
│   └── constants.js              # Exports env vars (GEMINI_API_KEY, VAPI_PUBLIC_KEY)
│
├── middleware.js                 # Route protection (cookie-based session check)
├── drizzle.config.js             # Drizzle Kit config (NeonDB URL)
└── next.config.mjs               # Next.js config
```

---

## 4. Execution Flows

### 4.1 Authentication Flow
```
User → /sign-in or /sign-up
  → POST /api/auth/[...all]  (better-auth handler)
  → better-auth validates credentials
  → Drizzle writes session to NeonDB (sessions table)
  → Sets cookie: better-auth.session_token
  → Redirect to /voice-agents

middleware.js runs on every request:
  → Checks for session cookie
  → No cookie + non-public route → redirect to /sign-in
  → Has cookie + /sign-in or /sign-up → redirect to /voice-agents
```
**Key function:** `getSession(headers)` in `lib/auth.js:28` — used in every API route to authenticate requests.

---

### 4.2 Character AI Chat Flow
```
User → /characterai → browses characters (GET /api/characters)
  → selects character → /characterai/chat/[characterid]
  → GET /api/chat/[characterId] (loads chat history from chat_messages)
  → User types message → POST /api/chat/[characterId]/message

Server (app/api/chat/[characterId]/message/route.js):
  1. getSession(headers) → verify auth
  2. db.query.characters.findFirst({ where: eq(id, charIdInt) })
  3. Build system instruction from character: name, description, behavior, language
  4. Format history → Gemini contents array (user/model alternating roles)
  5. geminiAi.getGenerativeModel("gemini-2.5-flash").generateContent(...)
  6. POST https://api.vapi.ai/v1/audio/tts { text, voice: { provider, voiceId }, language, format: "mp3" }
  7. Upload mp3 ArrayBuffer → UploadThing (`uploadFile`) → public URL
  8. db.insert(chatMessages) × 2 (user msg + AI msg)
  9. Return { aiMessage: { text, audioUrl, id, timestamp } }
```
**Note:** `gemini-2.5-flash-preview-native-audio-dialog` is used for the live streaming path in `lib/google-ai/gemini-chat-stream.js`. The standard `/message` route uses `gemini-2.5-flash` (text only) + Vapi TTS separately.

---

### 4.3 Call Agent Creation & Configuration Flow
```
User → /callagents → POST /api/callagents/create
  → FormData (standard agent): type = 'inbound'|'outbound'|'recruiter'|'trainee_clone'
  → JSON (recruitment agent): includes recruitmentConfig, systemPrompt
  → Image → UploadThing (lib/uploadthing/server.js → uploadFile)
  → db.insert(callAgents) → status: 'draft' or 'active'
  → Redirect to /callagents/[agentid]

Configuration sub-pages (each PATCH /api/callagents/[agentid]):
  /configure → GeneralConfig (voice engine, AI model, timezone, vocabulary)
             → VoiceConfig (voiceConfig JSONB)
             → CallConfig (callConfig JSONB)
  /prompt    → System prompt + greeting message
  /actions   → POST /api/callagents/[agentid]/actions (assigns global actions with timing)
  /knowledgebase → create KB → attach to agent via knowledgeBaseId
```

---

### 4.4 Call Lifecycle & Analysis Flow
```
Test Call:
  POST /api/callagents/[agentid]/start-test-call
    → Vapi Web SDK in browser initiates call
    → Call recorded by Vapi

Call Ends → Vapi → POST /api/vapi-webhook (end-of-call-report)
  → Extract: vapiCallId, recordingUrl, transcript, metadata.sessionId

  Branch A (Standard Call — no sessionId):
    → db.update(calls) WHERE rawCallData->>'vapiCallId' = vapiCallId
    → Set audioUrl, transcript

  Branch B (Recruitment Interview — has sessionId):
    → db.query.interviews.findFirst({ where: id = sessionId, with: { agent } })
    → analysisEngine.analyzeCandidateInterview(transcript, agent.recruitmentConfig)
      → Gemini 2.5 Flash → JSON: { fitScore, summary, hiringRecommendation, skillRadar, keyInsights, timelineSentiment }
    → db.update(interviews).set({ status: 'completed', fitScore, analysisData, audioUrl, transcript })

Manual Analysis Trigger:
  POST /api/callagents/[agentid]/calls/[callid]/analyze
    → Fetch call + agent.agentActions
    → extractActionValuesFromTranscript(callId, agentActions, transcript) [fire-and-forget]
      → Gemini extracts key:value pairs per action
      → db.insert(callActionValues)
    → Return 202 immediately

Export:
  POST /api/callagents/[agentid]/calls/export-to-sheets
    → Google Sheets API via lib/google/sheetsHelper.js
```

---

### 4.5 Recruitment Interview Flow (Magic Link)
```
Recruiter:
  1. /agents → recruiter module → CreateInterview.jsx
  2. Uploads JD (PDF or text) → POST /api/callagents/ingest
     → Gemini analyzes JD → returns { systemPrompt, rubric[] }
  3. Creates recruiter-type agent → POST /api/callagents/create (JSON)
     → Stores recruitmentConfig: { jobDescription, systemPrompt, rubric }
  4. Sends magic link to candidate: /interview/[agentid]

Candidate:
  1. Opens /interview/[agentid] (public route, no auth required)
  2. CandidateModule: DeviceCheck → CandidateInfoForm → InterviewIntroduction → AiInterviewSession
  3. Submits name + email → POST /api/interview/session
     → db.insert(interviews) → returns { sessionId }
  4. Vapi call starts with metadata: { sessionId }
  5. Screenshot snapshots → POST /api/interview/snapshot (anti-cheat)
  6. Call ends → Vapi webhook → analysis engine runs (see 4.4 Branch B)

Recruiter views results:
  /agents → Analysis.jsx → fetches /api/interview/[agentid]
  → skillRadar chart (recharts), fitScore, hiringRecommendation, keyInsights
  /agents → CandidateDatabase.jsx → lists all candidates
  /agents → CandidateProfile.jsx → individual profile
```

---

### 4.6 Trainee Flow
```
Trainee → /agents → marketplace/Marketplace.jsx
  → POST /api/marketplace/buy → purchase agent with credits
  → /agents → trainee/TrainingGym.jsx → select agent

Quiz Engine:
  POST /api/trainee/quiz/generate
    → Fetch agent (recruitmentConfig.jobDescription || agent.prompt)
    → Gemini: generate N questions (choice, true_false, flashcard)
    → Return { questions[] }
  → QuizEngine.jsx renders questions → scores answers
  → Results → db.update(traineeProgress) XP + quizScores[]

Mock Engine:
  → MockEngine.jsx → simulate voice interview with agent
  → Uses Vapi Web SDK

Analysis:
  → TraineeAnalysis.jsx → shows progress, level, XP, quiz history
```

---

### 4.7 Google Sheets Integration Flow
```
User → /callagents/Integrations
  → OAuthConnectButton → GET /api/integrations/connect/google
  → Redirects to Google OAuth
  → Callback: GET /api/integrations/oauth/google/callback
  → Stores tokens in userConnections (encrypted) with provider='google'

Per-agent setup:
  POST /api/callagents/[agentid]/integrations/google-sheets/setup
  → Links agent to a specific spreadsheet

Export calls:
  POST /api/callagents/[agentid]/calls/export-to-sheets
  → lib/google/sheetsHelper.js writes rows
```

---

## 5. Environment Variables Required

```bash
# Database
DATABASE_URL=                         # NeonDB connection string

# Auth
GOOGLE_AUTH_CLIENT_ID=                # Google OAuth (for login)
GOOGLE_AUTH_CLIENT_SECRET=
BASE_URL=                             # http://localhost:3000 in dev

# AI
GEMNI_API_KEY=                        # Gemini API key (NOTE: typo in codebase — GEMNI not GEMINI)
GEMINI_API_KEY=                       # Also used in some files

# Voice
VAPI_SECRET_KEY=                      # Vapi server SDK secret
NEXT_PUBLIC_VAPI_PUBLIC_KEY=          # Vapi web SDK public key

# File storage
UPLOADTHING_TOKEN=                    # Single combined token from uploadthing.com dashboard (v7+)

# Google Sheets
GOOGLE_CLIENT_ID=                     # Google OAuth for Sheets integration
GOOGLE_CLIENT_SECRET=

# Convex (workspace feature)
NEXT_PUBLIC_CONVEX_URL=

# Optional
OPENAI_API_KEY=                       # Currently commented out
```

**CRITICAL:** There is a consistent typo in the codebase: `GEMNI_API_KEY` (missing the second I) is the variable name used in `configs/constants.js` and `app/api/chat/[characterId]/message/route.js`. Other files use `GEMINI_API_KEY`. Both must be set or consolidated.

---

## 6. Database Schema Summary

All tables live in `lib/db/schemaCharacterAI.js`. Auth tables in `lib/db/auth-schema.js`.

**Core Tables:**
- `users` — platform users (id, name, email, credits)
- `sessions`, `accounts`, `verifications` — better-auth managed

**Character AI:**
- `characters` — AI personas (name, description, voiceId, voiceProvider, language, behavior JSON)
- `chat_messages` — conversation history (chatSessionId = `userId_characterId`)
- `character_likes` — unique user-character like tracking

**Call Agents:**
- `call_agents` — agents (type: inbound/outbound/recruiter/trainee_clone, prompt, voiceConfig JSONB, callConfig JSONB, recruitmentConfig JSONB, marketplaceConfig JSONB)
- `agent_actions` — links agent ↔ action with timing (before/during/after)
- `actions` — reusable action definitions (type, config JSONB)
- `call_action_values` — extracted values per call per action
- `calls` — call records (transcript JSONB, audioUrl, summary)
- `contacts` — phone contacts
- `knowledge_bases` — KB records (content JSONB array)

**Recruitment & Trainee:**
- `interviews` — interview sessions (fitScore, analysisData JSONB, screenshots JSONB, transcript JSONB)
- `trainee_progress` — XP + level + quizScores per user per agent

**Integrations:**
- `user_connections` — encrypted third-party credentials (provider: 'elevenlabs', 'google', 'twilio')
- `api_keys` — platform-issued API keys (hashed, never stored plaintext)
- `voices` — voice catalog (providerVoiceId, provider, isPublic)

**Convex (separate):**
- `users` — Convex user records (separate from Drizzle users)
- `workspace` — messages + fileData (code generation feature)
