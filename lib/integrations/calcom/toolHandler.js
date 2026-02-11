// lib/integrations/calcom/toolHandler.js
//
// Handles a single tool-call from a Vapi assistant during a live call.
// The tool-call payload comes from Vapi's "function-call" message type;
// we look up the agent's Cal.com config + the user's connection, dispatch
// to the right adapter call, and return the response Vapi expects.
//
// Vapi's expected response shape for a tool call:
//   { results: [{ toolCallId, result: "<string the LLM will read>" }] }
// We return the *string* result; the route wraps it in that envelope.

import { db } from "@/lib/database";
import {
    callAgents,
    agentIntegrations,
} from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";
import { getConnection } from "@/lib/integrations/connections";
import {
    findSlots,
    createBooking,
    listBookings,
} from "@/lib/integrations/adapters/calcom";

// Returns the merged config for an agent's calcom rule, or null if not
// configured / disabled.
async function loadAgentCalcomConfig(agentId) {
    const rule = await db.query.agentIntegrations.findFirst({
        where: and(
            eq(agentIntegrations.agentId, agentId),
            eq(agentIntegrations.provider, "calcom"),
            eq(agentIntegrations.enabled, true),
        ),
    });
    if (!rule) return null;
    return {
        ruleId: rule.id,
        ...(rule.destinationConfig || {}),
    };
}

// Helper — parse a "natural-ish" date like "Monday at 6 PM" using JS Date.
// Not a full NLP parser, just a defensive fallback when the LLM gives us
// something un-ISO. Returns ISO string or null.
function parseDateLoose(s) {
    if (!s) return null;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
    return null;
}

// Format a slot map { "2026-05-04": [{ time }] } into a readable summary.
function formatSlotSummary(slotsByDate, max = 8) {
    const lines = [];
    let count = 0;
    for (const [date, slots] of Object.entries(slotsByDate)) {
        if (count >= max) break;
        const times = (slots || [])
            .slice(0, 4)
            .map((s) => {
                const d = new Date(s.time);
                return d.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                });
            })
            .join(", ");
        if (times) {
            lines.push(`${date}: ${times}`);
            count++;
        }
    }
    return lines.length
        ? lines.join("\n")
        : "No availability in that range — try a different date.";
}

// Main entry point. `payload` is the tool-call envelope Vapi sends:
//   {
//     message: {
//       type: "function-call",
//       call: { ... },
//       toolCalls: [{ id, function: { name, arguments } }]
//     }
//   }
// We support both single function-call payloads (legacy) and toolCalls arrays.
export async function handleToolCall(payload) {
    const msg = payload?.message || payload || {};
    // metadata travels on the call object so we can attribute the call to an agent.
    const call = msg.call || {};
    const agentIdRaw =
        call.metadata?.agentId ||
        call.assistantOverrides?.metadata?.agentId ||
        msg.metadata?.agentId;
    const agentId = agentIdRaw ? parseInt(agentIdRaw, 10) : null;
    if (!agentId || Number.isNaN(agentId)) {
        return [{ error: "agentId missing from call metadata" }];
    }

    // Find the agent's owner so we can decrypt their calcom credentials.
    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, agentId),
        columns: { id: true, creatorId: true, name: true },
    });
    if (!agent) return [{ error: `agent ${agentId} not found` }];

    const config = await loadAgentCalcomConfig(agentId);
    if (!config) return [{ error: "Cal.com not enabled for this agent" }];

    const conn = await getConnection(agent.creatorId, "calcom");
    if (!conn?.apiKey) return [{ error: "Cal.com not connected for this user" }];

    // toolCalls is the modern shape; fall back to functionCall for older Vapi.
    const toolCalls =
        msg.toolCalls ||
        (msg.functionCall
            ? [{ id: msg.functionCall.id || "fc1", function: msg.functionCall }]
            : []);

    const results = [];
    for (const tc of toolCalls) {
        const fn = tc.function || {};
        const name = fn.name;
        let args = fn.arguments;
        if (typeof args === "string") {
            try {
                args = JSON.parse(args);
            } catch {
                args = {};
            }
        }
        args = args || {};

        try {
            const result = await runTool(name, args, { config, conn, agent });
            results.push({ toolCallId: tc.id, result });
        } catch (e) {
            console.error(`[CALCOM TOOL] ${name} failed:`, e?.message);
            results.push({
                toolCallId: tc.id,
                result: `Sorry, I ran into an issue: ${e?.message || "unknown error"}.`,
            });
        }
    }

    return results;
}

async function runTool(name, args, { config, conn, agent }) {
    if (name === "check_availability") {
        if (config.scope === "off") {
            return "Calendar lookups are disabled for me right now.";
        }
        const eventTypeId = config.eventTypeId;
        if (!eventTypeId) return "No event type configured — I can't check availability.";

        const dateFrom = parseDateLoose(args.dateFrom) || new Date().toISOString();
        // default to a 14-day window if no end given
        const fallbackTo = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
        const dateTo = parseDateLoose(args.dateTo) || fallbackTo;

        const slots = await findSlots(conn, {
            eventTypeId,
            dateFrom,
            dateTo,
            timeZone: args.timeZone || config.timeZone || "UTC",
        });
        const summary = formatSlotSummary(slots);
        return `Availability for ${agent.name}:\n${summary}`;
    }

    if (name === "create_booking") {
        if (!["read_book", "read_book_reschedule"].includes(config.scope)) {
            return "I'm not allowed to create bookings — only check availability.";
        }
        const eventTypeId = config.eventTypeId;
        if (!eventTypeId) return "No event type configured — I can't make bookings.";

        const start = parseDateLoose(args.start);
        if (!start) {
            return "I need a specific date and time to book — could you confirm?";
        }

        const booking = await createBooking(conn, {
            eventTypeId,
            start,
            end: parseDateLoose(args.end) || undefined,
            attendeeName: args.attendeeName || args.name,
            attendeeEmail: args.attendeeEmail || args.email,
            attendeePhone: args.attendeePhone || args.phone,
            notes: args.notes,
            timeZone: args.timeZone || config.timeZone || "UTC",
            metadata: { source: "doweit-voice", agentId: agent.id },
        });

        return `Booking confirmed — id ${booking.id || booking.uid}, ${start}.`;
    }

    if (name === "list_upcoming_bookings") {
        if (config.scope === "off") return "Calendar lookups are disabled.";
        const dateFrom =
            parseDateLoose(args.dateFrom) || new Date().toISOString();
        const dateTo =
            parseDateLoose(args.dateTo) ||
            new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
        const bookings = await listBookings(conn, { dateFrom, dateTo });
        if (!bookings.length) return "No upcoming bookings in that window.";
        return bookings
            .slice(0, 8)
            .map((b) => `${b.startTime} — ${b.title || "Booking"} (${b.status})`)
            .join("\n");
    }

    return `Unknown tool: ${name}`;
}
