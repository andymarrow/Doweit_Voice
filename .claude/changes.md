# Session Change Log

> Append-only. Never overwrite. One phase per engineering session or significant change.

---

## Phase 0: Initial Engineering Documentation

### Summary
Generated the complete internal engineering context system for the Doweit Voice platform. No code was modified.

### Problem
No engineering documentation existed. Future sessions would require re-deriving the entire system architecture from scratch on every conversation, leading to inconsistent decisions and wasted time.

### Solution
Reverse-engineered the full codebase and produced five structured documents covering architecture, patterns, rules, debug strategy, and integration awareness.

### Implementation Details
- Read all key files: `package.json`, `lib/db/schemaCharacterAI.js`, `lib/auth.js`, `middleware.js`, all API routes, all lib modules, `convex/schema.js`, `configs/`, and representative component files
- Identified three distinct products sharing one codebase: Character AI, Call Agents, AI Recruitment
- Discovered the `GEMNI_API_KEY` typo (missing second I) used inconsistently across files
- Identified that `AiInterviewSession.jsx` is a UI demo with hardcoded questions, not wired to Vapi
- Identified that `workflow/page.jsx` contains placeholder modals
- Identified Convex and Drizzle as completely separate data stores with no bridge

### Files Affected
- `.claude/CLAUDE.md` — Created (main engineering brain)
- `.claude/docs/architectural_patterns.md` — Created
- `.claude/docs/development_rules.md` — Created (includes known tech debt)
- `.claude/docs/debug_strategy.md` — Created
- `.claude/docs/external_integrations.md` — Created
- `.claude/docs/engineering_mindset.md` — Created
- `.claude/changes.md` — Created (this file)

### Impact
Future engineering sessions can now:
- Understand system architecture in under 5 minutes
- Know which env vars to set before developing
- Trace any bug through the layer map
- Avoid the known tech debt pitfalls
- Maintain consistent patterns across all products

---

---

## Phase 1: Vercel Deployment Fix

### Summary
Fixed all deployment-breaking errors that caused the Vercel build to fail starting from the "recruiter dashboard page" commit.

### Problem
1. **Root cause**: `lib/database.js` throws a hard error at module initialization time when `DATABASE_URL` is missing. Next.js build phase imports all API route modules (for static analysis), which triggers this throw and causes "Failed to collect page data" errors for every API route.
2. **useSearchParams without Suspense**: `app/agents/page.jsx` used `useSearchParams()` directly without wrapping in a `<Suspense>` boundary — a required pattern in Next.js 14 App Router.
3. **Missing `export const dynamic = "force-dynamic"`**: 38 out of 48 API routes were missing this declaration, allowing Next.js to attempt static pre-rendering of dynamic routes.
4. **Missing `"use client"` directive**: All agent module files, callagents components, and several other React files used hooks (useState, useEffect, useRouter) without the required `"use client"` directive.
5. **Deprecated Next.js Image props**: `layout="fill"` and `objectFit` were deprecated in Next.js 13+ and removed in 14.

### Solution
- Removed the eager `throw` from `lib/database.js` — replaced with a safe fallback URL. The DB will fail gracefully at query time if `DATABASE_URL` is not configured, instead of crashing at build time.
- Added `<Suspense fallback={null}>` wrapper in `app/agents/page.jsx` around the component that consumes `useSearchParams`.
- Added `export const dynamic = "force-dynamic"` to all 38 API routes missing it via a batch script.
- Added `"use client"` to 70+ component/page files across `app/agents/`, `app/callagents/`, `app/characterai/`, `app/interview/`, and `app/voice-agents-dashboard/`.
- Fixed Next.js Image in `voice-agents-dashboard/page.jsx`: `layout="fill"` → `fill`, `objectFit="cover"` → `style={{ objectFit: "cover" }}`.

### Implementation Details
- `lib/database.js`: `databaseUrl ?? 'postgresql://user:pass@host/db'` — `neon()` does not connect on initialization, so the placeholder is safe for build time.
- `app/agents/page.jsx`: Renamed `function App()` to `function AgentsPageContent()`, added new `export default function AgentsPage()` as the Suspense wrapper.
- API routes: Prepended `export const dynamic = "force-dynamic";` to each file using a bash loop.
- Component files: Prepended `"use client";` to each file using a bash loop with hook detection.

### Files Affected
- `lib/database.js` — Remove eager throw
- `app/agents/page.jsx` — Add Suspense wrapper
- `app/agents/modules/recruiter/CreateInterview.jsx` — Add "use client"
- `app/voice-agents-dashboard/page.jsx` — Fix Image props
- 38 API route files — Add force-dynamic
- ~70 component/page files — Add "use client"

### Impact
The Vercel deployment pipeline will no longer fail at the "Collecting page data" step. All API routes are properly marked as dynamic. All React components using hooks are correctly declared as Client Components.

<!-- APPEND NEW PHASES BELOW THIS LINE -->
