// lib/integrations/calcom/vapiTools.js
//
// Builds the Vapi function-tool definitions for Cal.com, given an agent's
// per-agent config. The tools point at our /api/integrations/calcom/tool
// webhook, which the toolHandler dispatches.
//
// Use:
//   const tools = await buildCalcomToolsForAgent(agentId);
//   if (tools.length) {
//     assistantConfig.model.tools = [...(assistantConfig.model.tools || []), ...tools];
//   }
//
// Scope drives which tools we expose so the agent can't call unauthorised
// actions even if the LLM hallucinates them — we just don't tell it those
// tools exist.

import { db } from "@/lib/database";
import { agentIntegrations } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

function getServerUrl() {
    const base =
        process.env.BASE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "http://localhost:3000";
    return `${base.replace(/\/$/, "")}/api/integrations/calcom/tool`;
}

// Definitions in Vapi v1 "tools" array shape.
function checkAvailabilityTool() {
    return {
        type: "function",
        async: false,
        server: { url: getServerUrl() },
        function: {
            name: "check_availability",
            description:
                "Check available appointment slots in the agent's calendar. " +
                "Use when the caller asks about scheduling, free times, or whether a date works.",
            parameters: {
                type: "object",
                properties: {
                    dateFrom: {
                        type: "string",
                        description:
                            "Start of the search window as ISO datetime, e.g. 2026-05-04T09:00:00Z. " +
                            "Defaults to 'now' if omitted.",
                    },
                    dateTo: {
                        type: "string",
                        description:
                            "End of the search window as ISO datetime. Defaults to two weeks from now.",
                    },
                    timeZone: {
                        type: "string",
                        description: "IANA tz like 'America/New_York'. Optional.",
                    },
                },
            },
        },
    };
}

function createBookingTool() {
    return {
        type: "function",
        async: false,
        server: { url: getServerUrl() },
        function: {
            name: "create_booking",
            description:
                "Lock in a confirmed appointment. Only call this once the caller has agreed " +
                "on a specific date AND time AND given a name + email/phone.",
            parameters: {
                type: "object",
                required: ["start", "attendeeName"],
                properties: {
                    start: {
                        type: "string",
                        description:
                            "ISO datetime for the booking start, e.g. 2026-05-04T18:00:00-04:00.",
                    },
                    end: { type: "string", description: "Optional ISO end time." },
                    attendeeName: { type: "string", description: "Caller's full name." },
                    attendeeEmail: { type: "string" },
                    attendeePhone: { type: "string" },
                    notes: {
                        type: "string",
                        description:
                            "Free-form notes — e.g. party size, special requests, table preferences.",
                    },
                    timeZone: { type: "string" },
                },
            },
        },
    };
}

function listBookingsTool() {
    return {
        type: "function",
        async: false,
        server: { url: getServerUrl() },
        function: {
            name: "list_upcoming_bookings",
            description:
                "Look up upcoming appointments on the calendar so you can answer questions " +
                "like 'when is the doctor next free?' or 'do I already have a booking?'",
            parameters: {
                type: "object",
                properties: {
                    dateFrom: { type: "string" },
                    dateTo: { type: "string" },
                },
            },
        },
    };
}

// Public: returns array of tool definitions for an agent, or [] if Cal.com
// isn't enabled.
export async function buildCalcomToolsForAgent(agentId) {
    const rule = await db.query.agentIntegrations.findFirst({
        where: and(
            eq(agentIntegrations.agentId, agentId),
            eq(agentIntegrations.provider, "calcom"),
            eq(agentIntegrations.enabled, true),
        ),
    });
    if (!rule) return [];

    const cfg = rule.destinationConfig || {};
    const scope = cfg.scope || "read_only";
    if (scope === "off") return [];

    const tools = [checkAvailabilityTool(), listBookingsTool()];
    if (scope === "read_book" || scope === "read_book_reschedule") {
        tools.push(createBookingTool());
    }
    return tools;
}

// Convenience — also returns a system-prompt suffix that briefs the LLM on
// how/when to use the tools. Callers can append this to the agent's existing
// system prompt so the model knows the tools exist.
export function buildCalcomPromptSuffix(scope) {
    const lines = [
        "",
        "You have access to the caller's calendar via tools. " +
            "Always check availability before suggesting a time. " +
            "When you have a confirmed date+time AND a name+contact, call create_booking to lock it in.",
    ];
    if (scope === "read_only") {
        return [
            "",
            "You can check availability but you cannot create bookings. " +
                "If the caller wants to book, tell them you'll have someone follow up.",
        ].join("\n");
    }
    return lines.join("\n");
}

// One-shot convenience used by /start-test-call: returns
// { tools, promptSuffix } so the route can compose without duplicating logic.
export async function getCalcomVapiAddons(agentId) {
    const tools = await buildCalcomToolsForAgent(agentId);
    if (tools.length === 0) return null;

    const rule = await db.query.agentIntegrations.findFirst({
        where: and(
            eq(agentIntegrations.agentId, agentId),
            eq(agentIntegrations.provider, "calcom"),
            eq(agentIntegrations.enabled, true),
        ),
    });
    const scope = rule?.destinationConfig?.scope || "read_only";
    return { tools, promptSuffix: buildCalcomPromptSuffix(scope) };
}
