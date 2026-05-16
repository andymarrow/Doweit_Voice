// lib/siteAssistant/manifest.js
//
// Single source of truth for the Doweit Voice "site assistant" — the chat
// widget that lives at the bottom of every page and lets the user navigate
// the app and operate agents by speaking ("take me to phone numbers", "open
// my agents", "create a new agent named Clinic", "set the greeting to …",
// "what integrations do I have", "open the latest call").
//
// The same definitions are used in two places:
//   - The bootstrap endpoint persists them as the SDK manifest (so the
//     server-side Gemini Live proxy knows what tool schemas to expose).
//   - The SiteAssistant React component registers matching client-side
//     handlers (so the actual fetch/router.push runs in the browser).
//
// Keep the names and param shapes identical on both sides.

export const SITE_SECTIONS = [
    { name: "home", path: "/voice-agents-dashboard", description: "Main dashboard after login." },
    { name: "call agents", path: "/callagents", description: "List of all call agents you've built." },
    { name: "integrations", path: "/callagents/Integrations", description: "Connect Slack, Telegram, Email, Cal.com, Twilio, Google Sheets." },
    { name: "phone numbers", path: "/callagents/phone-numbers", description: "Buy, import, and assign phone numbers." },
    { name: "actions", path: "/callagents/actions", description: "Library of reusable actions agents can extract." },
    { name: "knowledge base", path: "/callagents/knowledgebase", description: "Knowledge bases attached to your agents." },
    { name: "workflow", path: "/callagents/workflow", description: "Visual workflow builder." },
    { name: "alan ai", path: "/test-sdk", description: "The Alan AI / Doweit Voice SDK test playground." },
    { name: "sdk playground", path: "/callagents/embedded", description: "Manage SDK apps and embedded agents." },
    { name: "character ai", path: "/characterai", description: "Chat with custom AI personas." },
    { name: "recruitment", path: "/agents", description: "AI recruitment / interview agents." },
];

// Sub-pages inside a single agent's detail view (/callagents/<id>/...).
// `suffix` is appended to /callagents/<id>. Used by `open_agent_section`.
export const AGENT_SECTIONS = [
    { name: "overview", suffix: "", description: "The agent's main overview page." },
    { name: "configure", suffix: "/configure", description: "General settings: name, AI model, timezone, vocabulary." },
    { name: "voice", suffix: "/configure", description: "Voice selection and voice settings (a tab on the configure page)." },
    { name: "call settings", suffix: "/configure", description: "Call behaviour: recording, filler words (a tab on the configure page)." },
    { name: "prompt", suffix: "/prompt", description: "The agent's system prompt and greeting message." },
    { name: "actions", suffix: "/actions", description: "Actions attached to this agent (before/during/after a call)." },
    { name: "calls", suffix: "/calls", description: "Call history, transcripts, recordings, and extracted data." },
    { name: "deployment", suffix: "/deployment", description: "Deployment and phone number assignment." },
    { name: "integrations", suffix: "/integrations", description: "Per-agent integration settings." },
];

// Fields `update_agent` knows how to change. The server-side quick-update
// route mirrors this list, so adding a new field here without updating the
// route will return "unknown field".
export const UPDATE_AGENT_FIELDS = [
    "name",
    "prompt",
    "greetingMessage",
    "voiceId",
    "aiModel",
    "status",
    "useFillerWords",
    "enableRecording",
    "timezone",
];

export const SITE_ASSISTANT_ACTIONS = [
    {
        name: "navigate",
        description:
            "Navigate the user to a top-level section of the Doweit Voice app. " +
            "Pass the section name (e.g. 'call agents', 'phone numbers') as `destination`.",
        params: {
            destination: {
                type: "string",
                required: true,
                description:
                    "Section name from the known list, OR a path starting with '/'.",
            },
        },
        scope: "navigation",
    },
    {
        name: "open_agent",
        description:
            "Open the detail page of one of the user's existing call agents. " +
            "Prefer passing `agentName` (what the user spoke). The handler resolves " +
            "the correct page URL itself.",
        params: {
            agentName: { type: "string", required: false, description: "The agent's name as spoken by the user." },
            agentId: { type: "string", required: false, description: "The agent's id, only if the user gave one explicitly." },
        },
        scope: "navigation",
    },
    {
        name: "open_agent_section",
        description:
            "Open a specific section/tab of a call agent's detail page — use this " +
            "for requests like 'take me to calls', 'open the voice settings', 'go to " +
            "the actions page', 'show the system prompt'. Works on the agent the user " +
            "is currently viewing; if they name a different agent pass `agentName`. " +
            "Valid sections: 'overview', 'configure', 'voice', 'call settings', " +
            "'prompt', 'actions', 'calls', 'deployment', 'integrations'.",
        params: {
            section: { type: "string", required: true, description: "One of the valid section names." },
            agentName: { type: "string", required: false, description: "Only if opening a section of a DIFFERENT agent than the one in view." },
        },
        scope: "navigation",
    },
    {
        name: "go_back",
        description: "Go back to the previous page in the user's history.",
        params: {},
        scope: "navigation",
    },
    {
        name: "create_agent",
        description:
            "Create a brand-new call agent and navigate to its detail page. " +
            "ALWAYS gather both `name` and `type` first — ask the user a short " +
            "question if either is missing. `type` is either 'inbound' (the " +
            "agent receives calls) or 'outbound' (the agent makes calls).",
        params: {
            name: { type: "string", required: true, description: "Friendly name for the new agent." },
            type: { type: "string", required: true, description: "'inbound' or 'outbound'." },
        },
        scope: "navigation",
    },
    {
        name: "update_agent",
        description:
            "Change one setting on the call agent the user is currently viewing. " +
            "Only valid when the UI state shows `currentAgentId` is set (i.e. user " +
            "is on /callagents/<id>/...). Supported fields: " +
            "'name', 'prompt' (system prompt), 'greetingMessage', 'voiceId', " +
            "'aiModel', 'status' (active|paused|draft|archived), 'useFillerWords' " +
            "('true'/'false'), 'enableRecording' ('true'/'false'), 'timezone'. " +
            "If the user asks to change something else, ask them to clarify.",
        params: {
            field: {
                type: "string",
                required: true,
                description:
                    "One of: name, prompt, greetingMessage, voiceId, aiModel, status, useFillerWords, enableRecording, timezone.",
            },
            value: {
                type: "string",
                required: true,
                description:
                    "New value as text. For booleans pass 'true' or 'false'. For long prompts pass the full text.",
            },
        },
        scope: "navigation",
    },
    {
        name: "get_agent_info",
        description:
            "Look up and report the current settings of the call agent the user is " +
            "viewing — its name, status, type, AI model, selected voice, whether call " +
            "recording is on, greeting message, timezone. Use this whenever the user " +
            "asks a question about the agent ('what voice is this agent using?', " +
            "'is recording on?', 'what's its status?'). Only valid when `currentAgentId` is set.",
        params: {},
        scope: "info",
    },
    {
        name: "list_integrations",
        description:
            "Look up and report which third-party integrations the user has connected " +
            "to their Doweit account (Slack, Telegram, Email, Cal.com, Twilio, Google, " +
            "ElevenLabs, etc.). Use this whenever the user asks 'what integrations do I " +
            "have', 'is Slack connected', 'which services have I set up'.",
        params: {},
        scope: "info",
    },
    {
        name: "add_action",
        description:
            "Attach one of the user's existing reusable actions to the call agent " +
            "currently in view, at a given call timing. Only valid when `currentAgentId` " +
            "is set. `actionName` must match an action from the user's action library — " +
            "if it doesn't, the handler returns the list of available action names so " +
            "you can read them out and ask which one. `timing` is when the action runs " +
            "relative to the call: 'before', 'during', or 'after' (default 'during').",
        params: {
            actionName: { type: "string", required: true, description: "Name of an action from the user's library." },
            timing: { type: "string", required: false, description: "'before', 'during', or 'after'. Defaults to 'during'." },
        },
        scope: "agent",
    },
    {
        name: "open_call",
        description:
            "Open the detail modal for one of the current agent's calls — its " +
            "transcript, recording, and extracted data. Use for 'open the latest call', " +
            "'show me the most recent call', 'open call number 3'. Only valid when " +
            "`currentAgentId` is set. `which` selects the call: 'latest' (default) or an " +
            "ordinal number counting from the most recent (1 = most recent).",
        params: {
            which: { type: "string", required: false, description: "'latest' or a number (1 = most recent call)." },
        },
        scope: "agent",
    },
];

export function buildSiteAssistantSystemPrompt() {
    const sectionList = SITE_SECTIONS.map(
        (s) => `  • "${s.name}" — ${s.description}`,
    ).join("\n");

    const agentSectionList = AGENT_SECTIONS.map(
        (s) => `  • "${s.name}" — ${s.description}`,
    ).join("\n");

    return [
        "You are the Doweit Voice site assistant — a warm, helpful co-pilot embedded inside the app.",
        "",
        "PERSONALITY",
        "  • Talk like a friendly teammate, not a robot. One short sentence is usually plenty.",
        "  • Acknowledge before acting (\"Sure, opening Call Agents now…\") and confirm after (\"Done — you're on the agents page.\").",
        "  • Never read JSON, status codes, or tool names aloud. Speak in plain natural language.",
        "",
        "MULTI-TURN",
        "  • The conversation NEVER ends after one action. Stay attentive and ready for the next request.",
        "  • If the user says something new after an action completed, treat it as a fresh request — don't assume they're still talking about the previous one.",
        "",
        "WHAT YOU CAN DO",
        "  1. Navigate the app  →  `navigate` with a top-level section name.",
        "  2. Open a specific user agent  →  `open_agent` with its name.",
        "  3. Jump to a section of an agent  →  `open_agent_section` (calls, voice, actions, prompt, deployment, …).",
        "  4. Go back  →  `go_back`.",
        "  5. Create a new call agent  →  `create_agent` once you have BOTH a name AND a type.",
        "  6. Edit the current agent's settings  →  `update_agent` (only when `currentAgentId` is set).",
        "  7. Answer questions about the current agent  →  `get_agent_info`.",
        "  8. Tell the user which integrations they have connected  →  `list_integrations`.",
        "  9. Attach a reusable action to the current agent  →  `add_action`.",
        "  10. Open a call's details  →  `open_call`.",
        "",
        "ANSWERING QUESTIONS WITH REAL DATA",
        "  • For `get_agent_info` and `list_integrations`, the tool returns real data — wait for the",
        "    result, then tell the user the answer in a natural sentence (\"This agent uses the Aoede",
        "    voice and recording is turned on.\"). Don't guess; call the tool.",
        "  • `add_action` may come back with `available` — a list of the user's actions. If so, the",
        "    name didn't match: read a few options and ask which they meant.",
        "",
        "GATHERING INFO",
        "  • Before any tool call that needs missing info, ask ONE focused question: \"What should I name it?\" / \"Inbound or outbound?\"",
        "  • Don't list options unless the user asks. Don't read params back.",
        "",
        "VALID TOP-LEVEL SECTIONS (use the quoted name as `destination`):",
        sectionList,
        "",
        "VALID AGENT SECTIONS (use the quoted name as `section` for `open_agent_section`):",
        agentSectionList,
        "",
        "EXAMPLES",
        '  User: "take me to call agents"',
        '    → navigate({ destination: "call agents" })',
        "",
        '  User: "open my Clinic agent"',
        '    → open_agent({ agentName: "Clinic" })',
        "",
        '  User (on an agent page): "take me to its calls"',
        '    → open_agent_section({ section: "calls" })',
        "",
        '  User (on an agent page): "what voice is this agent using?"',
        '    → get_agent_info({})  → "It\'s using the Aoede voice."',
        "",
        '  User: "what integrations do I have set up?"',
        '    → list_integrations({})  → "You\'ve got Slack and Google connected."',
        "",
        '  User (on an agent page): "enable recording"',
        '    → update_agent({ field: "enableRecording", value: "true" })',
        "",
        '  User (on an agent page): "open the latest call"',
        '    → open_call({ which: "latest" })',
        "",
        "CRITICAL: SAYING vs DOING",
        "  • Speaking a confirmation does NOTHING by itself. You MUST emit the matching tool call",
        "    in the SAME turn. Saying \"opening it now\" without the tool call = the user is stranded.",
        "",
        "Never say \"I can't do that\" for anything in the lists above — call the tool.",
    ].join("\n");
}
