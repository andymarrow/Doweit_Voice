# Development Rules

> Derived from actual codebase conventions and enforced as engineering discipline.

---

## 1. Structural Rules

### File Organization
- Co-locate components at the route level: `app/[section]/_components/`
- Shared UI only goes in `components/ui/` (shadcn) or `components/custom/`
- Business logic stays in `lib/` — never in API routes directly
- New AI operations (prompts, model calls) go in `lib/` subdirectories: `lib/gemini/`, `lib/recruitment/`, `lib/google-ai/`
- Drizzle schema changes go in `lib/db/schemaCharacterAI.js` only

### API Route Rules
- Every API route must authenticate first with `getSession(await headers())`
- Validate all inputs before touching the DB
- Use `console.error("[CONTEXT_NAME] message:", error)` with bracket context prefix
- Never expose raw DB errors or stack traces to the client
- Return `{ error: "Human readable message" }` for all error states
- Use HTTP 202 (Accepted) for fire-and-forget operations (analysis triggers)
- Use HTTP 201 (Created) for all successful creates

### Component Rules
- Mark components `"use client"` only when they use hooks, browser APIs, or event handlers
- Server components are the default — only add `"use client"` when necessary
- Context providers must be in layout files, never inline in page files
- Never fetch data inside a context provider — pass data as props from server layouts

---

## 2. Database Rules

### Drizzle ORM
- Use `db.query.*` (relational API) for reads with joins — avoid manual `db.select().leftJoin(...)`
- Always use `.returning()` after inserts that need the inserted record's ID
- JSONB columns (`voiceConfig`, `callConfig`, `recruitmentConfig`, etc.) accept partial updates — always merge with existing data before saving, don't overwrite the entire object unless intended
- `trainee_progress`, `interviews`, `callActionValues` — have unique constraints. Use upsert or check before insert to avoid duplicate key errors
- Always cascade deletes are defined in schema — trust them, don't manually clean up related records

### Schema Modification
- Run `npm run db:push` after schema changes in development
- Run `npm run db:studio` to inspect the DB visually
- Never rename a column without a migration script (`lib/scripts/migration-script.js` pattern)
- The `users` table in Drizzle and the `users` table in Convex are SEPARATE — never join or conflate them

---

## 3. AI Rules

### Gemini API Key Inconsistency (KNOWN BUG)
- `configs/constants.js` exports `GEMINI_API_KEY` from env var `process.env.GEMNI_API_KEY` (typo: missing second I)
- `app/api/chat/[characterId]/message/route.js` uses `process.env.GEMNI_API_KEY` directly
- `lib/gemini/actionExtractor.js`, `lib/recruitment/analysisEngine.js`, `app/api/trainee/quiz/generate/route.js` all use `process.env.GEMINI_API_KEY`
- **The `.env.local` file MUST define both `GEMNI_API_KEY` and `GEMINI_API_KEY` with the same value** until this is consolidated
- Do NOT "fix" this by changing one file without updating all references and the env file

### Gemini Prompt Rules
- Always structure prompts with labeled sections: `--- SECTION ---`, `TASK:`, `OUTPUT FORMAT:`
- For JSON output: always set `generationConfig: { responseMimeType: "application/json" }` — never parse unstructured text
- Strip markdown code fences before parsing: `.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim()`
- Never truncate important content. Current limits are safe: `jobDescription.substring(0, 2000)`, `transcript.substring(0, 20000)` — respect these bounds

### Vapi Rules
- The webhook at `/api/vapi-webhook` handles BOTH standard calls AND recruitment interviews
- Interview sessions are identified by `callData.metadata.sessionId` — always pass `metadata.sessionId` when starting recruitment calls
- Always return HTTP 200 to Vapi webhook regardless of processing outcome — failure to do so causes Vapi to retry
- Vapi TTS endpoint: `https://api.vapi.ai/v1/audio/tts` — this is a custom URL, not a public Vapi docs endpoint, verify if it changes

---

## 4. Security Rules

### API Keys
- Platform API keys are NEVER stored in plaintext — only `hashedKey` + `keyPreview` go in DB (`lib/utils/crypto.js`)
- Third-party credentials (ElevenLabs, Google tokens) stored encrypted in `userConnections.encryptedAccessToken`
- Never log API keys, tokens, or session values

### Authentication
- Every non-public API route must call `getSession` and check for user
- Public routes: `/api/vapi-webhook`, `/api/interview/session`, `/api/interview/snapshot` — these are intentionally unauthenticated
- Middleware protects all non-static, non-public routes at the edge
- The interview magic link at `/interview/[agentid]` is a public route by design

### Firebase Storage
- All audio files uploaded with `predefinedAcl: "publicRead"` — this is intentional for audio playback
- Avatar uploads also go through Firebase — verify bucket name in env is correct before deployment

---

## 5. Engineering Discipline Rules

### Before Writing Code
1. Read the relevant existing files — do not assume file contents
2. Check if the pattern you need already exists in the codebase (e.g., auth pattern, Drizzle query pattern)
3. Check schema before writing any DB query — column names and types matter
4. Identify which AI key variable is used in the target file (GEMNI vs GEMINI)

### Root-Cause Fixes Only
- If a bug appears in a component consuming data, trace it to the API route, then to the DB query
- Do not add null-safety checks (`?.`) everywhere to mask a data shape problem — fix the source
- If Gemini returns bad JSON, fix the prompt — don't add more error-swallowing try/catches

### No Speculative Additions
- Do not add error handling for scenarios that cannot happen (e.g., `if (!db)` — Drizzle is always initialized)
- Do not add loading states, retry logic, or fallbacks beyond what already exists in similar components
- Do not add TypeScript types unless the project is migrated to TypeScript

### Avoid Breaking Existing Flows
- The vapi-webhook handles two branches (standard call + recruitment). Modifying it risks breaking both — test both paths
- The `call_agents` table has four distinct `type` values with different behavior — always check type before applying type-specific logic
- Convex and Drizzle are completely separate data stores — do not mix queries from both in a single operation

### Consistency First
- Auth pattern is always: `const { user } = await getSession(await headers()); const userId = user?.id;`
- DB import is always: `import { db } from "@/lib/database";`
- Schema import is always: `import { tableName } from "@/lib/db/schemaCharacterAI";`
- Use `@/` path alias for all imports — never relative `../../` paths from deep files

---

## 6. The Known Technical Debt

| Issue | Location | Risk |
|---|---|---|
| `GEMNI_API_KEY` env var typo | `configs/constants.js`, `api/chat/.../message/route.js` | Gemini calls silently fail in some routes |
| `AiInterviewSession.jsx` uses hardcoded demo questions | `app/agents/modules/candidate/AiInterviewSession.jsx` | Interview session is UI demo, not wired to Vapi |
| `workflow/page.jsx` uses placeholder modals | `app/callagents/workflow/page.jsx` | Workflow builder is partially implemented |
| Convex users not linked to Drizzle users | `convex/users.js` | Two separate user tables with no bridge |
| OpenAI is installed but commented out | `app/api/chat/[characterId]/message/route.js` | Dead code — cleanup when decision is final |
