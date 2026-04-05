# Architectural Patterns

> Extracted from actual code. No assumptions.

---

## Frontend Patterns

### Component Structure

The project uses a co-location pattern inside the App Router:

```
/app/[section]/
  ├── page.jsx           # Route entry point (Server or Client)
  ├── layout.jsx         # Section layout (sidebar, providers)
  └── _components/       # Components used only by this section
      └── SomeComponent.jsx
```

Global reusable components live in `/components/ui/` (shadcn primitives) and `/components/custom/` (app-specific).

**Naming convention:**
- Underscore-prefixed `_components/` = co-located, not globally imported
- `components/ui/` = shadcn/ui raw primitives (button, dialog, input, etc.)
- `components/custom/` = app-specific wrappers (custom button, modal)

---

### Reusable UI Strategy

Built on three layers:
1. **Radix UI primitives** (`@radix-ui/*`) — accessible, unstyled
2. **shadcn/ui wrappers** (`components/ui/`) — styled with Tailwind (button, card, dialog, dropdown-menu, select, sheet, sidebar, skeleton, tooltip, etc.)
3. **Page-level components** (`app/*/components/` or `_components/`) — consume shadcn components

The `components.json` file at root configures shadcn CLI for adding new components.

---

### State Handling

**Context API** is the primary state strategy.

Example — `CallAgentContext`:
```jsx
// app/callagents/[agentid]/_context/CallAgentContext.jsx
const CallAgentContext = createContext(undefined);

export function CallAgentProvider({ agent, children }) {
    return (
        <CallAgentContext.Provider value={agent}>
            {children}
        </CallAgentContext.Provider>
    );
}

export function useCallAgent() {
    const context = useContext(CallAgentContext);
    if (context === undefined) throw new Error('...');
    return context;
}
```

**Pattern:** Layout files (`layout.jsx`) fetch data server-side and inject into providers. Client sub-pages consume via hooks.

**Local state:** `useState` for UI state (modals open/close, form state, loading flags). No Redux, no Zustand observed.

**Custom hooks:** `hooks/use-mobile.jsx` and `hooks/use-media-query.jsx` for responsive behavior.

---

### Animation Pattern

Framer Motion is used heavily in:
- `AiInterviewSession.jsx` — speaking animations (AnimatePresence + motion.div)
- `voice-agents-dashboard` components
- General fade/scale transitions

Pattern:
```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={uniqueKey}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
  >
```

---

## Backend / API Patterns

### API Route Structure

All routes in `app/api/` follow Next.js App Router conventions:

```
app/api/
  [resource]/
    route.js              # Collection: GET (list), POST (create)
    [id]/
      route.js            # Item: GET, PATCH, DELETE
      [action]/
        route.js          # Sub-resource or action
```

Example hierarchy:
```
/api/callagents/
  route.js                      ← GET all agents
  create/route.js               ← POST create
  [agentid]/
    route.js                    ← GET/PATCH/DELETE single agent
    calls/
      route.js                  ← GET calls for agent
      [callid]/
        route.js                ← GET single call
        analyze/route.js        ← POST trigger analysis
        export-to-sheets/route.js
```

---

### Request → Validation → Logic → Response Pattern

Every API route follows this exact pattern:

```js
export async function POST(req, { params }) {
    // 1. AUTH — Always first
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. PARAM VALIDATION
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // 3. BODY PARSING
    const body = await req.json(); // or req.formData()
    const { field } = body;
    if (!field) return NextResponse.json({ error: "Missing field" }, { status: 400 });

    // 4. BUSINESS LOGIC (DB + external calls)
    try {
        const result = await db.insert(table).values({...}).returning();
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("[CONTEXT] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
```

---

### Error Handling Style

- All errors use `console.error("[CONTEXT] message:", error)` — context prefix in brackets (e.g., `[VAPI WEBHOOK]`, `[ANALYSIS TRIGGER]`, `[API CREATE]`)
- Always return JSON error object: `{ error: "Description" }`
- Never expose raw error messages to the client
- Graceful degradation: if TTS fails or Firebase upload fails, proceed without audio — don't crash the whole request
- Fire-and-forget for expensive async operations: `someAsyncFn().catch(err => console.error(err))`

---

### Content-Type Branching Pattern

Used in `/api/callagents/create/route.js` and `/api/callagents/ingest/route.js`:

```js
const contentType = req.headers.get("content-type") || "";

if (contentType.includes("application/json")) {
    // Handle JSON payload
} else if (contentType.includes("multipart/form-data")) {
    // Handle file upload
} else {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
}
```

---

## AI Integration Pattern

### Gemini — Standard Text Generation

Used for: chat responses, action extraction, interview analysis, quiz generation, JD ingestion.

```js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" } // When structured output needed
});

const result = await model.generateContent(prompt);
const text = result.response.text();
const parsed = JSON.parse(text); // For structured responses
```

**Prompt construction pattern:** Always string templates with clear labeled sections:
```
--- SECTION HEADER ---
content
---
TASK: ...
OUTPUT FORMAT: ...
```

**JSON output:** When structured JSON is required, set `responseMimeType: "application/json"` in generationConfig. Clean raw markdown fences from response before parsing: `.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim()`.

---

### Gemini — Live Audio Streaming

Used for: character AI voice conversations (`lib/google-ai/gemini-chat-stream.js`).

Model: `models/gemini-2.5-flash-preview-native-audio-dialog`

```js
const session = await ai.live.connect({
    model: AI_STREAMING_MODEL,
    callbacks: { onmessage, onerror, onclose },
    config: {
        responseModalities: [Modality.AUDIO, Modality.TEXT],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: characterConfig.voiceId } } }
    }
});

session.sendClientContent({ turns: [{ text: prompt }] });
await turnCompletePromise; // Wait for AI turn signal
session.close();
```

Audio returned as base64 chunks, combined, then returned as raw base64 string.

---

### Vapi AI Integration

Two usage modes:

**Mode 1 — TTS only (Character AI):**
```js
const ttsResponse = await fetch("https://api.vapi.ai/v1/audio/tts", {
    method: "POST",
    headers: { Authorization: `Bearer ${VAPI_SECRET_KEY}` },
    body: JSON.stringify({ text, voice: { provider, voiceId }, language, format: "mp3" })
});
const audioBuffer = await ttsResponse.arrayBuffer();
// Upload to Firebase → return public URL
```

**Mode 2 — Full Voice Calls (Call Agents + Recruitment):**
- Vapi manages the entire call lifecycle
- Webhook: `POST /api/vapi-webhook` receives `end-of-call-report`
- Interview session identified by `callData.metadata.sessionId`
- Recording URL + transcript delivered via webhook payload

---

### AI Usage per Feature

| Feature | AI Model | Purpose |
|---|---|---|
| Character chat (text) | Gemini 2.5 Flash | Generate character dialogue |
| Character chat (voice) | Gemini Live Audio Dialog | Real-time audio streaming |
| Character TTS | Vapi TTS API | Text-to-speech synthesis |
| Call action extraction | Gemini 2.5 Flash | Extract structured data from call transcripts |
| Interview analysis | Gemini 2.5 Flash (JSON mode) | Score + radar + insights from interview |
| JD ingestion | Gemini 2.5 Flash (JSON mode) | Parse JD → systemPrompt + rubric |
| Quiz generation | Gemini 2.5 Flash (JSON mode) | Generate training questions from agent context |
| Voice calls | Vapi Server/Web SDK | Full telephony (inbound/outbound) |
| Voice catalog | ElevenLabs SDK | Custom voice management |

---

## Data Layer Patterns

### Drizzle ORM Usage

**Query style:** Drizzle's relational query builder (`db.query.*`) preferred for reads with relations:

```js
const agent = await db.query.callAgents.findFirst({
    where: eq(callAgents.id, agentId),
    with: {
        agentActions: { with: { action: true } },
        knowledgeBase: true
    }
});
```

**Mutations:** Direct insert/update/delete:

```js
const [newRecord] = await db.insert(table).values({...}).returning();
await db.update(table).set({...}).where(eq(table.id, id));
await db.delete(table).where(eq(table.id, id));
```

**JSONB fields:** Used heavily for flexible config storage:
- `voiceConfig`, `callConfig`, `recruitmentConfig`, `marketplaceConfig` on `call_agents`
- `content` on `knowledge_bases`
- `transcript`, `analysisData`, `screenshots` on `interviews`
- `config` on `actions`

**JSONB querying** (raw SQL): `sql\`${calls.rawCallData}->>'vapiCallId' = ${vapiCallId}\``

---

### Convex Usage (Isolated)

Convex is **only** used for the workspace/code generation feature — not integrated with the primary Drizzle/NeonDB data.

Schema:
```js
// convex/schema.js
users: defineTable({ name, email, picture, uid, token })
workspace: defineTable({ messages: v.any(), fileData: v.optional(v.any()), user: v.id('users') })
```

Do not mix Convex data with Drizzle data. They are completely separate.

---

### Firebase Storage Pattern

Server-side upload (API routes):
```js
import admin from "@/configs/firebaseAdmin";
import { getStorage } from "firebase-admin/storage";

const bucket = getStorage(admin.apps[0]).bucket();
const file = bucket.file(`path/${timestamp}.mp3`);
await file.save(buffer, { metadata: { contentType: "audio/mp3" }, predefinedAcl: "publicRead" });
const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;
```

Client-side upload (lib/firebase/upload.js): Used for avatar images.

---

## Multi-Product Hub Logic

### Character AI Product
- Characters are database-driven entities with: `name`, `description`, `greeting`, `behavior[]`, `voiceId`, `voiceProvider`, `language`
- Chat sessions identified by `chatSessionId = "${userId}_${characterId}"`
- Voice synthesis: Gemini text → Vapi TTS → Firebase Storage URL → returned to client for playback
- Simulated call mode available via `SimulatedCallModal.jsx`
- Marketplace feature: characters can be made public/private, liked, counted

### Recruitment AI Product
- **Three roles**: Recruiter (creates agents, reviews results), Candidate (takes interview), Trainee (practices)
- **Agent type**: `type: 'recruiter'` or `type: 'trainee_clone'` in `call_agents` table
- **Recruitment config** stored in `recruitmentConfig JSONB`: `{ jobDescription, systemPrompt, rubric[], candidateLimit, expiryDate, antiCheatEnabled }`
- **Interview session lifecycle**: `pending` → `ongoing` → `completed` → `reviewed`
- **Analysis output**: `{ fitScore(0-100), summary, hiringRecommendation, skillRadar[], keyInsights: { strengths, weaknesses }, timelineSentiment[] }`
- **Anti-cheat**: `screenshots JSONB` array in interviews table; warning overlay in `AiInterviewSession.jsx`

### Call Agent Product
- **Agent types**: `inbound`, `outbound`, `recruiter`, `trainee_clone`
- **Action system**: Global `actions` (definitions) linked to agents via `agent_actions` (with timing: before/during/after)
- **Analysis**: Gemini extracts action values from transcript post-call → `call_action_values`
- **Workflow builder**: ReactFlow visual tool at `/callagents/workflow` with PromptNode, KnowledgeBaseNode, ActionNode
- **Knowledge bases**: Content stored as JSONB array of `{ type: 'text'|'file'|'url', value }` entries
- **Integrations**: Google Sheets, ElevenLabs, and platform API keys

### Trainee Gamification
- XP + level system in `trainee_progress` table
- Quiz types: `choice`, `true_false`, `flashcard`
- Mock engine for live practice via Vapi
- Progress analytics shown via recharts
