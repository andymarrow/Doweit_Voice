// lib/integrations/templateRenderer.js
//
// Variable substitution + conditional filter evaluation for integration
// templates.
//
// Supported placeholders:
//   {{call.id}}          — DB id (number)
//   {{call.agentName}}
//   {{call.phoneNumber}}
//   {{call.direction}}   — inbound/outbound
//   {{call.duration}}    — formatted "Xm Ys"
//   {{call.startedAt}}   — ISO date
//   {{call.summary}}
//   {{call.transcriptUrl}} — link back to the platform call detail page
//   {{action.<name>}}    — extracted value for the action with that name,
//                          or the literal "—" when missing/null.
//
// Two block helpers:
//   {{#if action.<name>}}...{{/if}}     — render block only if value is truthy
//   {{#each actions}}...{{/each}}       — render block per extracted action
//                                          (inside, use {{name}} and {{value}})

const MISSING = "—";

function formatDuration(seconds) {
    if (typeof seconds !== "number" || !Number.isFinite(seconds)) return MISSING;
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s ? `${m}m ${s}s` : `${m}m`;
}

function stringifyValue(v) {
    if (v === null || v === undefined || v === "") return MISSING;
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "object") {
        try {
            return JSON.stringify(v);
        } catch {
            return MISSING;
        }
    }
    return String(v);
}

// Build the variable context the renderer reads from.
// `call` is a row from the `calls` table; `agent` is the parent agent;
// `actionValues` is an array of { name, displayName, value, rawValue }.
export function buildContext({ call, agent, actionValues, baseUrl }) {
    const actionsByName = {};
    const actionsList = [];
    for (const a of actionValues || []) {
        actionsByName[a.name] = a.value;
        actionsList.push({
            name: a.name,
            displayName: a.displayName || a.name,
            value: stringifyValue(a.value),
            rawValue: a.value,
        });
    }

    const transcriptUrl =
        baseUrl && agent && call
            ? `${baseUrl.replace(/\/$/, "")}/callagents/${agent.id}/calls?callId=${call.id}`
            : "";

    return {
        call: {
            id: call?.id ?? MISSING,
            agentName: agent?.name ?? MISSING,
            phoneNumber: call?.phoneNumber ?? MISSING,
            direction: call?.direction ?? MISSING,
            duration: formatDuration(call?.duration),
            startedAt: call?.startTime ? new Date(call.startTime).toISOString() : MISSING,
            summary: call?.summary ?? MISSING,
            transcriptUrl,
        },
        action: actionsByName, // raw values for conditionals + readable for display
        // For {{#each actions}} block:
        _actionsList: actionsList,
    };
}

// Resolve a dotted path like "call.duration" or "action.first_name"
// against the context object. Returns the raw value (which the renderer then
// stringifies). Returns undefined if the path doesn't resolve.
function resolvePath(ctx, path) {
    const parts = path.split(".");
    let cur = ctx;
    for (const part of parts) {
        if (cur === null || cur === undefined) return undefined;
        cur = cur[part];
    }
    return cur;
}

// Render a single template body string against the context.
// Order matters: {{#each}} -> {{#if}} -> simple {{var}} substitution.
export function renderTemplate(template, ctx) {
    if (typeof template !== "string" || !template) return "";

    let out = template;

    // {{#each actions}}<inner>{{/each}}
    out = out.replace(
        /\{\{#each\s+actions\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
        (_, inner) => {
            const list = ctx._actionsList || [];
            return list
                .map((item) =>
                    inner
                        .replace(/\{\{\s*name\s*\}\}/g, item.displayName)
                        .replace(/\{\{\s*value\s*\}\}/g, item.value),
                )
                .join("");
        },
    );

    // {{#if action.foo}}...{{/if}}  — truthiness check on resolved value
    out = out.replace(
        /\{\{#if\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,
        (_, path, inner) => {
            const v = resolvePath(ctx, path);
            const truthy = v !== undefined && v !== null && v !== "" && v !== MISSING;
            return truthy ? inner : "";
        },
    );

    // Simple {{ path }} substitution
    out = out.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
        const v = resolvePath(ctx, path);
        return stringifyValue(v);
    });

    return out;
}

// Evaluate whether an integration rule's filter matches the given context.
// Filter shape (stored in agent_integrations.filter):
//   { mode: 'all_calls' }                                — always fire
//   { mode: 'has_actions', requiredActions: ['name'] }   — at least one of these has a value
//   { mode: 'condition', condition: { actionName, equals } } — exact match
export function shouldDispatch(filter, ctx) {
    if (!filter || !filter.mode || filter.mode === "all_calls") return true;

    if (filter.mode === "has_actions") {
        const required = Array.isArray(filter.requiredActions)
            ? filter.requiredActions
            : [];
        if (required.length === 0) return true;
        return required.some((name) => {
            const v = ctx.action?.[name];
            return v !== undefined && v !== null && v !== "";
        });
    }

    if (filter.mode === "condition") {
        const cond = filter.condition || {};
        if (!cond.actionName) return true;
        const actual = ctx.action?.[cond.actionName];
        // Equality check, coerced to string for stable UX
        return String(actual ?? "") === String(cond.equals ?? "");
    }

    return true;
}
