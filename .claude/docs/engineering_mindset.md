# Engineering Mindset

> How to approach every session working on this codebase.

---

## Before Touching Anything

1. **Read before writing.** Always read the file you're about to modify. Never assume its contents.
2. **Trace the flow.** For any feature: UI component → API route → `lib/` function → DB query. Know the full path before touching any layer.
3. **Check the schema.** Before writing a DB query, confirm column names and types in `lib/db/schemaCharacterAI.js`.
4. **Identify the AI key.** Before touching an AI route, check: does it use `GEMNI_API_KEY` or `GEMINI_API_KEY`? (See development rules.)
5. **Ask: what else uses this?** Before modifying a shared file (`lib/auth.js`, `lib/database.js`, `vapi-webhook`, `schemaCharacterAI.js`), search for all importers.

---

## Analysis Before Modification

For every bug:
- Reproduce it with the exact inputs that trigger it
- Identify which layer it lives in (UI, API, lib, DB, external)
- Find the root cause — not the symptom
- Fix the root cause — not the symptom

For every feature request:
- Map it to the existing architecture first
- Determine: does this need a new API route? New table column? New lib function?
- Reuse existing patterns before creating new ones

---

## Avoid Breaking Existing Flows

**High-risk files** — think twice before touching:

| File | Why Risky |
|---|---|
| `app/api/vapi-webhook/route.js` | Handles two production flows; must always return 200 |
| `lib/db/schemaCharacterAI.js` | Changing a column name breaks all queries referencing it |
| `lib/auth.js` | Breaks all authentication if misconfigured |
| `lib/database.js` | Breaks all DB access if connection config changes |
| `middleware.js` | Wrong pattern breaks all route protection |
| `lib/recruitment/analysisEngine.js` | JSON output schema consumed directly by frontend charts |

**When modifying these files:**
- Identify every caller before changing a function signature
- Test the full end-to-end flow (not just the file in isolation)
- For webhook changes: simulate a Vapi webhook payload with curl before deploying

---

## System Design Consistency

- **Auth pattern:** `const { user } = await getSession(await headers()); const userId = user?.id;` — always this exact pattern
- **DB imports:** `import { db } from "@/lib/database";` — always from this path
- **Error responses:** `return NextResponse.json({ error: "message" }, { status: NNN });` — always this shape
- **Log prefixes:** `console.error("[CONTEXT] message:", error)` — always bracket context
- **JSONB configs:** Stored as complete objects in DB. When updating a sub-field, read → merge → write.

Do not introduce a new pattern when an existing one covers the case. Consistency is more valuable than marginal improvement in isolated files.

---

## Scalable and Maintainable Solutions

- Add a new AI feature? Put the Gemini/AI logic in `lib/` — not in the API route
- Add a new data type? Add it to `schemaCharacterAI.js` with proper relations and run `db:push`
- Add a new integration? Follow the `user_connections` encrypted credentials pattern
- Add a new agent type? Check the `type` enum in `call_agents` and update all places that switch on type

**Prefer:**
- Extending existing JSONB config columns over adding new table columns (for flexible config)
- A single comprehensive API route over multiple thin routes for related operations
- Drizzle relational queries over raw SQL joins

**Avoid:**
- Putting business logic in React components
- Calling external APIs directly from components — always go through your own API route
- Storing sensitive data in localStorage or component state — use session/server state

---

## Working with AI Features

- Every Gemini prompt is a contract. The output structure feeds into the DB or frontend directly.
- When modifying a prompt: verify the new output still matches the expected JSON schema.
- When the AI returns unexpected data: fix the prompt — not the downstream parser.
- The `analysisEngine.js` output (`fitScore`, `skillRadar`, etc.) maps directly to recharts components — never change the output key names without updating the consuming components.

---

## Deployment Awareness

- This is Next.js 14 on (likely) Vercel — `maxDuration = 60` is set on `vapi-webhook` for longer AI processing
- Serverless functions have cold starts — don't rely on module-level state persisting between requests
- Firebase Admin SDK must be initialized cleanly — the `admin.apps.length` check exists for a reason
- NeonDB is serverless — queries on cold starts may be slower; don't add unnecessary round trips
