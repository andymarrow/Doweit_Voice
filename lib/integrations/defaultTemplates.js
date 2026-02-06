// lib/integrations/defaultTemplates.js
//
// Sensible default templates per destination. The dispatcher falls back to
// these when an integration rule has no custom template attached. They're
// also seeded into the user's template library on first use of each
// destination so they have something to clone and modify.

const SLACK_DEFAULT = {
    name: "Default — Slack call summary",
    destination: "slack",
    subject: null,
    body:
        "*A call just wrapped up.*\n" +
        "Caller: `{{call.phoneNumber}}` · Direction: *{{call.direction}}* · Duration: *{{call.duration}}*\n\n" +
        "{{#if call.summary}}> {{call.summary}}{{/if}}",
};

const TELEGRAM_DEFAULT = {
    name: "Default — Telegram call summary",
    destination: "telegram",
    subject: null,
    body:
        "A call just wrapped up\\.\n" +
        "Caller: `{{call.phoneNumber}}` · Direction: *{{call.direction}}* · Duration: *{{call.duration}}*\n\n" +
        "{{#if call.summary}}{{call.summary}}{{/if}}",
};

const EMAIL_DEFAULT = {
    name: "Default — Email call summary",
    destination: "email",
    subject: "Call summary — {{call.agentName}}",
    body:
        "Hi,\n\n" +
        "Your agent **{{call.agentName}}** just finished a {{call.direction}} call with {{call.phoneNumber}} ({{call.duration}}).\n\n" +
        "{{#if call.summary}}**Summary:** {{call.summary}}\n\n{{/if}}" +
        "The extracted action data is included below.\n",
};

const TEMPLATES = {
    slack: SLACK_DEFAULT,
    telegram: TELEGRAM_DEFAULT,
    email: EMAIL_DEFAULT,
};

export function getDefaultTemplate(destination) {
    return TEMPLATES[destination] || SLACK_DEFAULT;
}

export function getAllDefaultTemplates() {
    return Object.values(TEMPLATES);
}

// Variables exposed to the template editor's autocomplete + preview legend.
// `agentActions` (optional) is the list of agent_actions with their action
// definitions, so the editor can suggest the right `{{action.<name>}}` keys
// for *this* agent.
export function describeVariables(agentActions = []) {
    const callVars = [
        { token: "{{call.agentName}}", label: "Agent name" },
        { token: "{{call.phoneNumber}}", label: "Caller phone number" },
        { token: "{{call.direction}}", label: "inbound / outbound" },
        { token: "{{call.duration}}", label: "Formatted duration (e.g. 2m 14s)" },
        { token: "{{call.startedAt}}", label: "ISO timestamp" },
        { token: "{{call.summary}}", label: "AI-generated call summary" },
        { token: "{{call.transcriptUrl}}", label: "Link to call detail page" },
    ];
    const actionVars = (agentActions || [])
        .filter((a) => a?.action)
        .map((a) => ({
            token: `{{action.${a.action.name}}}`,
            label: a.action.displayName || a.action.name,
        }));
    const blockHelpers = [
        {
            token: "{{#if action.<name>}}…{{/if}}",
            label: "Show block only when an action has a value",
        },
        {
            token: "{{#each actions}}{{name}}: {{value}}{{/each}}",
            label: "Loop over every extracted action",
        },
    ];
    return { callVars, actionVars, blockHelpers };
}
