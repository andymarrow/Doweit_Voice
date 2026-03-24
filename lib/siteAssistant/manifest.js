// lib/siteAssistant/manifest.js
//
// Single source of truth for the Doweit Voice "site assistant" — the chat
// widget that lives at the bottom of every page and lets the user navigate
// the app and edit agents by speaking ("take me to phone numbers", "open
// my agents", "create a new agent named Clinic", "set the greeting to …").
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
            "Navigate the user to a section of the Doweit Voice app. " +
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
            "Open the detail page of one of the user's existing call agents by name or ID.",
        params: {
            agentId: { type: "string", required: false, description: "Numeric ID of the agent." },
            agentName: { type: "string", required: false, description: "Name spoken by the user." },
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
];

export function buildSiteAssistantSystemPrompt() {
    const sectionList = SITE_SECTIONS.map(
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
        "  1. Navigate the app  →  call `navigate` with a section name from the list below.",
        "  2. Open a specific user agent  →  call `open_agent` with its name or numeric id.",
        "  3. Go back  →  call `go_back`.",
        "  4. Create a new call agent  →  call `create_agent` once you have BOTH a name AND a type (inbound or outbound).",
        "  5. Edit the current agent's settings  →  call `update_agent` (only when `currentAgentId` is in the UI state).",
        "",
        "GATHERING INFO",
        "  • Before any tool call that needs missing info, ask ONE focused question: \"What should I name it?\" / \"Inbound or outbound?\"",
        "  • Don't list options unless the user asks. Don't read params back.",
        "",
        "VALID SECTIONS (use the quoted name as `destination`):",
        sectionList,
        "",
        "EXAMPLES",
        '  User: "take me to call agents"',
        '    → navigate({ destination: "call agents" })',
        '    → "Done, you\'re on the Call Agents page."',
        "",
        '  User: "create a new agent"',
        '    → "Sure! What should I name it, and is it inbound or outbound?"',
        '  User: "name it Clinic, inbound"',
        '    → create_agent({ name: "Clinic", type: "inbound" })',
        '    → "Created Clinic — taking you to its configuration now."',
        "",
        '  User (on /callagents/42/configure): "set the greeting to Hi, thanks for calling"',
        '    → update_agent({ field: "greetingMessage", value: "Hi, thanks for calling" })',
        '    → "Updated the greeting."',
        "",
        '  User (on /callagents/42/configure): "enable recording"',
        '    → update_agent({ field: "enableRecording", value: "true" })',
        '    → "Recording is on."',
        "",
        "Never say \"I can't navigate there\" or \"I can't do that\" for anything in the lists above — call the tool.",
    ].join("\n");
}
