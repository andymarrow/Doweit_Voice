// app/callagents/[agentid]/integrations/_components/previewSupport.js
//
// Lightweight client-side mirror of lib/integrations/templateRenderer.js so we
// can preview as the user types without a server round-trip. Kept in a
// separate file from the React component so it doesn't carry the "use client"
// boundary unnecessarily.
//
// IMPORTANT: keep this in sync with the server renderer's substitution rules.

const MISSING = "—";

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

function resolvePath(ctx, path) {
    const parts = path.split(".");
    let cur = ctx;
    for (const part of parts) {
        if (cur === null || cur === undefined) return undefined;
        cur = cur[part];
    }
    return cur;
}

export function renderTemplateClient(template, ctx) {
    if (!template) return "";
    let out = template;

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

    out = out.replace(
        /\{\{#if\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,
        (_, path, inner) => {
            const v = resolvePath(ctx, path);
            const truthy = v !== undefined && v !== null && v !== "" && v !== MISSING;
            return truthy ? inner : "";
        },
    );

    out = out.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
        const v = resolvePath(ctx, path);
        return stringifyValue(v);
    });

    return out;
}

// Realistic-looking example values for the preview. We seed action variables
// with the agent's *actual* configured action names so the preview reflects
// what the user will see in production.
export function sampleContext(actionVars = []) {
    const actionsByName = {};
    const actionsList = [];

    const sampleValueFor = (label, idx) => {
        const map = {
            customer_name: "Jane Doe",
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@example.com",
            phone: "+1 555 0188",
            order_type: "Pickup",
            party_size: 4,
            time: "Friday 7:00 PM",
        };
        const lower = (label || "").toLowerCase();
        for (const k of Object.keys(map)) {
            if (lower.includes(k.replace("_", " ")) || lower.includes(k)) return map[k];
        }
        return `Sample value ${idx + 1}`;
    };

    actionVars.forEach((v, idx) => {
        // token looks like "{{action.foo}}" — strip wrapper.
        const m = /\{\{action\.([\w_]+)\}\}/.exec(v.token || "");
        const name = m ? m[1] : v.label || `action_${idx}`;
        const value = sampleValueFor(v.label || name, idx);
        actionsByName[name] = value;
        actionsList.push({
            name,
            displayName: v.label || name,
            value: stringifyValue(value),
            rawValue: value,
        });
    });

    return {
        call: {
            id: 12345,
            agentName: "Demo Agent",
            phoneNumber: "+1 555 0100",
            direction: "inbound",
            duration: "2m 14s",
            startedAt: new Date().toISOString(),
            summary:
                "Caller asked about reserving a table for four on Friday at 7 PM and confirmed pickup.",
            transcriptUrl: "#",
        },
        action: actionsByName,
        _actionsList: actionsList,
    };
}
