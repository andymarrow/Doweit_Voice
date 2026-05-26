# Doweit Voice — API Test Plan (Postman / Thunder Client)

This file documents the request set used to validate the major modules of the
Doweit Voice platform. Every entry below is ready to paste into Postman or
Thunder Client as a new request — Method, URL, Headers, Body, and the
response shape to verify in a screenshot.

> **Base URL** — replace `{{baseUrl}}` with `http://localhost:3000` for local
> testing or your production domain (e.g. `https://doweit-voice.vercel.app`).
> **Auth cookie** — most routes use better-auth session cookies. In Postman
> create an environment with `baseUrl` and let the cookie jar persist
> `better-auth.session_token` after sign-in.
>
> **CSRF / Origin header** — better-auth rejects any `/api/auth/*` request
> that doesn't carry an `Origin` header matching a trusted origin. Postman
> and Thunder Client don't send `Origin` by default, so every auth request
> below adds `Origin: {{baseUrl}}` (e.g. `http://localhost:3000`). Omitting
> it returns `400 { "code": "MISSING_OR_NULL_ORIGIN" }`.
>
> **How to use the request bodies below** — every "**Body**" block in this
> doc is the exact JSON to paste into Postman → Body → **raw** (JSON
> selected from the dropdown), or Thunder Client → Body → **JSON**. Replace
> `REPLACE_…` placeholders and `{{variables}}` with your real values.
> Requests that don't list a Body don't need one (GET/DELETE).

---

## 1. Authentication & Authorization

### 1.1 Sign Up — create an account

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/auth/sign-up/email` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "name": "QA Tester",
  "email": "qa.tester+01@example.com",
  "password": "StrongTestPassword123!"
}
```

**Expected response** — `200 OK`, body contains the new `user.id`, `user.email`,
and a `Set-Cookie: better-auth.session_token=…` header.

**Check** — Postman cookie jar shows the session cookie.

---

### 1.2 Sign In — email/password

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/auth/sign-in/email` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "email": "qa.tester+01@example.com",
  "password": "StrongTestPassword123!"
}
```

**Expected response** — `200 OK`, `Set-Cookie` with the session token, body
includes `user` and `session` objects.

**Failure case to also test** — wrong password should return `401` and the
cookie should NOT be set.

---

### 1.3 Get current session

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/auth/get-session` |
| Headers | (cookie auto-attached) |

**Expected response** — `200 OK`, body has `user.id`, `user.email`,
`session.expiresAt`.

**Negative case** — clear cookies, hit the endpoint again, expect `null` or
empty response.

---

### 1.4 Protected route — confirm authorization works

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/callagents/create` |

**With session cookie** — `200 OK`, JSON array of the caller's agents.
**Without session cookie** — `401 Unauthorized` body `{ "error": "..." }`.

---

### 1.5 Sign Out

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/auth/sign-out` |

**Expected response** — `200 OK`. Session cookie cleared. Repeating 1.3
afterwards should now return `null`.

---

## 2. Unified Voice Repository

### 2.1 List all voices (Gemini + Vapi defaults + Vapi assistants + user custom)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/voices` |

**Expected response** — `200 OK`, JSON **array** of voice objects with shape:
```json
{
  "id": "vapi-Elliot",
  "voiceId": "Elliot",
  "name": "Elliot",
  "description": "Vapi default voice",
  "sampleAudioUrl": null,
  "platform": "vapi",
  "provider": "vapi"
}
```

**Things to verify in the screenshot**
- `provider: "google"` entries (Gemini voices like Aoede, Puck, …).
- `provider: "vapi"` entries for the hard-coded defaults (Elliot, Rohan,
  Emma, Zoe, …).
- `provider: "11labs"` entries if the test account has ElevenLabs imported.
- Voices the test user created in Vapi appear with their custom names.

---

### 2.2 Voice list sorted alphabetically

Same request as 2.1 — confirm the response is sorted by `name` ascending.

---

### 2.3 Unauthorized voice fetch

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/voices` |
| Headers | (clear the session cookie) |

**Expected** — the route still returns voices, but `customVoices` is empty
since `userId` is null. Used to verify the route degrades gracefully.

---

## 3. AI Voice Agent (Call Agents)

### 3.1 Create an inbound call agent

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/callagents/create` |
| Headers | `Content-Type: application/json` |

> The route accepts both JSON and `multipart/form-data`. JSON is used below
> because it's copy-pasteable into Postman's raw body editor. (The form-data
> path is only needed when you also want to upload an avatar image — out of
> scope for API testing.)

**Body**
```json
{
  "name": "QA Inbound Agent",
  "type": "inbound",
  "systemPrompt": "You are a friendly receptionist for ACME Corp. Greet callers warmly and ask how you can help.",
  "voiceConfig": {
    "voiceProvider": "vapi",
    "voiceId": "Elliot",
    "voiceName": "Elliot"
  }
}
```

**Expected response** — `201 Created`, body contains the new agent's `id`,
`publicId`, `name`, `type: "inbound"`, `status: "active"`.

**Save** `publicId` as `{{agentId}}` for the following requests.

---

### 3.2 List the caller's agents

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/callagents/create` |

**Expected** — `200 OK`, array including the agent created in 3.1. Each entry
has `id`, `publicId`, `name`, `type`, `status`.

---

### 3.3 Fetch one agent's config

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/callagents/{{agentId}}/config` |

**Expected** — `200 OK`, full agent JSON including `voiceConfig`, `callConfig`,
`prompt`, `greetingMessage`.

---

### 3.4 Patch the prompt / voice

| Field | Value |
|---|---|
| Method | `PATCH` |
| URL | `{{baseUrl}}/api/callagents/{{agentId}}/config` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "prompt": "You are a friendly receptionist for ACME Corp. Always greet by name.",
  "greetingMessage": "Hi! Thanks for calling ACME, how can I help?",
  "voiceConfig": {
    "voiceProvider": "vapi",
    "voiceId": "Rohan",
    "voiceName": "Rohan"
  }
}
```

**Expected** — `200 OK`, response shows the patched values persisted.

---

### 3.5 Start a test call

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/callagents/{{agentId}}/start-test-call` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{ "channel": "web" }
```

**Expected** — `200 OK`, body contains a Vapi-issued `callId` (or assistant
config) used by the in-browser SDK. Verify in Vapi dashboard that a session
was created.

---

### 3.6 Vapi end-of-call webhook (simulated)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/vapi-webhook` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body** (trimmed end-of-call-report)
```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "vapi-call-test-001",
      "metadata": { "agentId": "REPLACE_WITH_INTEGER_ID" }
    },
    "recordingUrl": "https://example.com/recording.mp3",
    "transcript": "AI: Hello.\nUser: Hi.\nAI: Goodbye.",
    "endedReason": "customer-ended-call"
  }
}
```

**Expected** — `200 OK`. Check the `calls` table — the matching row now has
`audioUrl` and `transcript` populated.

---

## 4. Workflow Automation (Post-call actions & integrations)

### 4.1 List assigned actions for an agent

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/callagents/{{agentId}}/actions` |

**Expected** — `200 OK`, array of `{ id, action, timing }` entries where
`timing` ∈ `before` | `during` | `after`.

---

### 4.2 Assign an action with `after` timing

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/callagents/{{agentId}}/actions` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "actionId": "REPLACE_WITH_ACTION_UUID",
  "timing": "after"
}
```

**Expected** — `201 Created`. Re-run 4.1 to confirm the action shows in the
list.

---

### 4.3 Manually trigger analysis of a finished call

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/callagents/{{agentId}}/calls/{{callId}}/analyze` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body** — `{}`

**Expected** — `202 Accepted`. The endpoint fans off `extractActionValuesFromTranscript`
in the background; verify rows appear in `callActionValues` within a few
seconds.

---

### 4.4 Export call data to Google Sheets

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/callagents/{{agentId}}/calls/export-to-sheets` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "spreadsheetId": "PASTE_YOUR_SHEET_ID",
  "range": "Calls!A1"
}
```

**Expected** — `200 OK`, body `{ ok: true, rowsWritten: <n> }`. Open the
Google Sheet in a screenshot to show the row was written.

---

### 4.5 Cal.com tool webhook (Vapi → Doweit)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/integrations/calcom/tool` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "message": {
    "type": "function-call",
    "call": { "metadata": { "agentId": "REPLACE_WITH_INTEGER_ID" } },
    "toolCalls": [{
      "id": "tc1",
      "function": {
        "name": "check_availability",
        "arguments": "{\"dateFrom\":\"2026-06-01\",\"dateTo\":\"2026-06-05\"}"
      }
    }]
  }
}
```

**Expected** — `200 OK`, body `{ results: [{ toolCallId: "tc1", result: "..." }] }`.

---

## 5. Recruitment AI

### 5.1 Create an interview position

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/recruiter/createInterview` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "title": "Senior Frontend Engineer",
  "jobPosition": "Software Engineer",
  "department": "Engineering",
  "description": "Build React UIs for the Doweit Voice platform.",
  "location": "Remote",
  "employmentType": "full-time",
  "requiredExperience": "senior",
  "language": "English",
  "duration": 30,
  "questionCount": 5,
  "antiCheatEnabled": true,
  "voiceProvider": "vapi",
  "voiceId": "Elliot",
  "agentName": "Viktor",
  "tone": "Friendly",
  "systemPrompt": "Interview the candidate for the Senior Frontend role.",
  "aiQuestions": [
    "Tell me about a tough React bug you fixed.",
    "How do you decide between context and Redux?"
  ],
  "evaluationCriteria": [
    { "name": "Technical depth", "weight": 40 },
    { "name": "Communication",   "weight": 30 },
    { "name": "Problem solving", "weight": 30 }
  ],
  "candidateEvaluation": "Auto-reject below fit score 60."
}
```

**Expected** — `200 OK`, body:
```json
{
  "success": true,
  "data": {
    "position": { "id": "…", "title": "Senior Frontend Engineer", … },
    "linkId": "…",
    "magicLink": "https://your-domain/interview/…",
    "registrationLink": "https://your-domain/candidate/…"
  }
}
```

**Save** `data.positionId` as `{{positionId}}` and `data.linkId` as `{{linkId}}`.

---

### 5.2 Fetch one position

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/recruiter/createInterview?positionId={{positionId}}` |

**Expected** — `200 OK`, body `{ success: true, data: { …full position row… } }`.

---

### 5.3 Edit the position (incl. prompt + voice — added in this release)

| Field | Value |
|---|---|
| Method | `PATCH` |
| URL | `{{baseUrl}}/api/recruiter/createInterview` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "positionId": "{{positionId}}",
  "title": "Senior Frontend Engineer (Updated)",
  "duration": 45,
  "systemPrompt": "Updated interview script with deeper architecture questions.",
  "voiceProvider": "vapi",
  "voiceId": "Rohan",
  "agentName": "Casey"
}
```

**Expected** — `200 OK`, returned `data` reflects all the new values.

---

### 5.4 Register a candidate (open candidate form)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/recruiter/applications` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "linkId": "{{linkId}}",
  "candidateName": "Jane Doe",
  "candidateEmail": "jane.doe@example.com",
  "candidatePhone": "+251911111111",
  "experience": "5+ years React"
}
```

**Expected** — `200 OK`, body contains `publicId`. Save as `{{candidatePublicId}}`.

---

### 5.5 Send interview invitation emails

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/recruiter/send-interview-emails` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{ "positionId": "{{positionId}}" }
```

**Expected** — `200 OK`, body `{ success: true, emailsSent: 1, emailDetails: [...] }`.

**Verify** in the email inbox of the candidate that the link is e.g.
`https://your-domain/interview/<linkId>/<candidatePublicId>` — **no
`undefined`** in the URL (this used to be the bug).

---

### 5.6 Save interview transcript (auto-fires at end of interview)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/interview/save-transcript` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "candidateId": "{{candidatePublicId}}",
  "interviewData": "AI: Hello, Jane.\nCandidate: Hi.\nAI: Tell me about React.\nCandidate: …\nAI: Thank you for completing the interview. Goodbye!",
  "transcript": [
    { "role": "AI",        "text": "Hello, Jane.", "timestamp": "2026-05-26T10:00:00Z" },
    { "role": "Candidate", "text": "Hi.",          "timestamp": "2026-05-26T10:00:05Z" }
  ]
}
```

**Expected** — `200 OK`, body `{ success: true, candidateId, transcriptLength }`.
Check the `candidateApplications` row: `interviewTaken = true`.

---

### 5.7 Get analyzed candidate result

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/recruiter/getCandidateResults` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{ "positionId": "{{positionId}}" }
```

**Expected** — `200 OK`, body contains for each candidate:
- `fitScore` (0–100)
- `summary`
- `hiringRecommendation`
- `skillRadar` (array used by the radar chart)
- `keyInsights`

---

### 5.8 Send results email to candidates

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/recruiter/send-result-emails` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{ "positionId": "{{positionId}}" }
```

**Expected** — `200 OK`, body lists which candidates were emailed and the
message-ID for each.

---

### 5.9 Delete an interview position

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `{{baseUrl}}/api/recruiter/createInterview?positionId={{positionId}}` |

**Expected** — `200 OK`, body `{ success: true }`. Re-run 5.2 to confirm
`404 Position not found`.

---

## 6. Web Assistant SDK (Embeddable widget)

### 6.1 List the developer's SDK apps

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/sdk/apps` |

**Expected** — `200 OK`, array of apps with `name`, `publicKey`, `status`,
`domainWhitelist`.

---

### 6.2 Create a new SDK app

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/sdk/apps` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{
  "name": "QA Demo Site",
  "agentId": "REPLACE_WITH_AGENT_INTEGER_ID",
  "mode": "agent"
}
```

**Expected** — `200 OK`, body contains `publicKey` starting with `dw_pub_`.
**Save** as `{{sdkKey}}`.

---

### 6.3 SDK init (the call the widget makes on page load)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `https://doweit-voice.onrender.com/api/sdk/init` |
| Headers | `Authorization: Bearer {{sdkKey}}` |

**Expected** — `200 OK`, body
```json
{
  "success": true,
  "config": {
    "appName": "QA Demo Site",
    "agent": { "name": "...", "voiceId": "...", "language": "en", "greeting": "..." },
    "tools": [ … manifest actions … ]
  }
}
```

**Negative case** — same request from a Postman environment that sends
`Origin: https://not-whitelisted.example.com` should return `403` with body
`{ "error": "Domain '…' is not authorized for this app. …" }`.

---

### 6.4 SDK manifest upload (developer registers their actions)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `https://doweit-voice.onrender.com/api/sdk/manifest` |
| Headers | `Authorization: Bearer {{sdkKey}}` ; `Content-Type: application/json` |

**Body**
```json
{
  "environment": "production",
  "actions": [
    {
      "name": "addToCart",
      "description": "Add a product to the cart.",
      "params": { "productId": { "type": "string", "required": true } }
    }
  ],
  "stateSchema": {}
}
```

**Expected** — `200 OK`, body `{ success: true, version: <n> }`.

---

### 6.5 Pause / activate the SDK app

| Field | Value |
|---|---|
| Method | `PATCH` |
| URL | `{{baseUrl}}/api/sdk/apps/{{appId}}` |
| Headers | `Content-Type: application/json` + `Origin: {{baseUrl}}` |

**Body**
```json
{ "status": "paused" }
```

**Expected** — `200 OK`. Run 6.3 again — now `403` with `"This app is
currently paused"`.

Set `"status": "active"` to restore.

---

### 6.6 Add a whitelisted domain

| Field | Value |
|---|---|
| Method | `PATCH` |
| URL | `{{baseUrl}}/api/sdk/apps/{{appId}}` |

**Body**
```json
{ "domainWhitelist": ["app.acme.com", "https://hilltech-gray.vercel.app/"] }
```

**Expected** — `200 OK`. Re-run 6.3 with `Origin: https://app.acme.com` —
should now succeed.

---

## 7. Marketplace (publish / browse / clone AI agents)

The marketplace is built on **job positions** (the same `jobPositions` table
the recruiter uses) — any position whose `accessType` starts with `"Public"`
shows up here. There is no `/api/marketplace` root; the real endpoint is
`/api/marketplace/positions`.

### 7.1 List marketplace listings

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/marketplace/positions` |

**Optional query** — add `?q=engineer` to filter by title / department.

**Expected** — `200 OK`, JSON array of listing rows. Each row contains:
```json
{
  "id": "abc123def4567",
  "title": "Senior Frontend Engineer",
  "department": "Engineering",
  "description": "…",
  "location": "Remote",
  "employment_type": "full-time",
  "language": "English",
  "required_experience": "senior",
  "duration": 30,
  "question_count": 5,
  "price": 50,
  "access_type": "Public (Anyone)",
  "status": "active",
  "user_id": "<seller user id>",
  "seller_name": "Jane Doe",
  "seller_email": "jane@example.com",
  "created_at": "2026-05-26T10:00:00Z"
}
```

**Save** one `id` value as `{{listingId}}` for 7.3 and 7.5.

---

### 7.2 Publish a position to the marketplace

The "publish" action is just flipping `accessType` to a `"Public …"` value on
an existing position. Use the recruiter PATCH route to do it:

| Field | Value |
|---|---|
| Method | `PATCH` |
| URL | `{{baseUrl}}/api/recruiter/createInterview` |
| Headers | `Content-Type: application/json` |

**Body**
```json
{
  "positionId": "{{positionId}}",
  "accessType": "Public (Anyone)",
  "price": 50,
  "status": "active"
}
```

**Expected** — `200 OK`, returned `data.accessType` is `"Public (Anyone)"`.
Re-run 7.1 — the position now appears in the array.

---

### 7.3 Buy / clone a marketplace listing (as a trainee)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/marketplace/positions/{{listingId}}/buy` |
| Headers | `Content-Type: application/json` |

**Body**
```json
{ "buyerType": "trainee" }
```

**Expected** — `200 OK`, body contains the cloned trainee interview record
(rows in `trainee_interviews`). Two `token_transactions` rows are written
(debit on buyer, credit on seller); buyer's `token_balance` is debited by
the listing `price`, seller's is credited.

**Recruiter clone variant** — same URL, send `{ "buyerType": "recruiter" }`
to clone the position into the caller's own `job_positions` as a fresh
draft they own.

**Failure cases**
- Buying your own listing → `400 { "error": "You can't buy your own listing" }`.
- Insufficient balance → `402` (or `400` with `"Insufficient tokens"`).
- Listing not `Public …` → `403 Forbidden`.

---

### 7.4 Rate a marketplace listing

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{baseUrl}}/api/marketplace/positions/{{listingId}}/rate` |
| Headers | `Content-Type: application/json` |

**Body**
```json
{ "rating": 5 }
```

**Expected** — `200 OK`. Re-run 7.1 — the listing's average rating field now
reflects your vote. The route is self-healing — first call will auto-create
the `position_ratings` table if a fresh DB hasn't been pushed yet.

---

### 7.5 Marketplace dashboard (recruiter side)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/recruiter/dashboard` |

**Expected** — `200 OK`, body has counts: `totalInterviews`, `activeAgents`,
`marketplaceSales`, plus a recent-activity feed.

---

### 7.6 Recent recruiter activity

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{baseUrl}}/api/recruiter/activities` |

**Expected** — `200 OK`, list of activity rows (purchases, published agents,
interviews taken) ordered by most recent.

---

## Appendix — Postman Environment Variables

Create one environment per test run with:

| Variable | Example value |
|---|---|
| `baseUrl` | `http://localhost:3000` |
| `agentId` | `<UUID returned from 3.1>` |
| `positionId` | `<id returned from 5.1>` |
| `linkId` | `<linkId returned from 5.1>` |
| `candidatePublicId` | `<publicId from 5.4>` |
| `sdkKey` | `dw_pub_<…>` |
| `callId` | `<calls.id you want to analyze>` |
| `listingId` | `<id from 7.1 — a public job_positions row>` |

For screenshots in your report, capture for each request:
1. The **request** pane (URL + method + body)
2. The **response** body
3. The **status code** and time

That gives one screenshot per row and makes the test evidence section
self-contained.
