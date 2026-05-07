export const dynamic = "force-dynamic";
// app/api/callagents/[agentid]/phone-number/route.js
//
// GET    — current phone number assigned to this agent (if any) + the
//          user's available unassigned numbers (so the picker can render).
// POST   — assign a number to this agent. Also tells Vapi to route inbound
//          calls on that number to a freshly-created assistant for the agent.
// DELETE — unassign the current number from this agent.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents, phoneNumbers } from "@/lib/db/schemaCharacterAI";
import { eq, and, isNull, or } from "drizzle-orm";
import {
    setAssistantOnNumber,
    createTransientAssistant,
} from "@/lib/integrations/adapters/vapiNumbers";
import { getCalcomVapiAddons } from "@/lib/integrations/calcom/vapiTools";
import { resolveCallAgentId } from "@/lib/utils/publicId";

async function authorizeAgent(userId, agentId) {
    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, agentId),
    });
    if (!agent) return { error: "Agent not found", status: 404 };
    if (agent.creatorId !== userId) return { error: "Not authorized", status: 403 };
    return { agent };
}

// Build a Vapi assistant config for an agent — used when assigning a phone
// number so inbound calls get routed to an assistant that mirrors this
// agent's prompt + voice + Cal.com tools.
async function buildAgentAssistantConfig(agent) {
    const calcomAddons = await getCalcomVapiAddons(agent.id);
    const systemPrompt =
        (agent.prompt || "You are a helpful assistant.") +
        (calcomAddons?.promptSuffix || "");

    // voiceProvider is stored directly as a Vapi provider string (e.g. "11labs",
    // "openai", "cartesia"). The only exception is legacy "elevenlabs" values
    // saved before the fix — map those to "11labs" which Vapi expects.
    const voiceProvider = agent.voiceConfig?.voiceProvider;
    const voiceId = agent.voiceConfig?.voiceId;
    const VALID_VAPI_PROVIDERS = new Set([
        "vapi", "11labs", "azure", "cartesia", "custom-voice", "deepgram",
        "hume", "lmnt", "neuphonic", "openai", "playht", "rime-ai",
        "smallest-ai", "tavus", "sesame", "inworld", "minimax", "wellsaid",
        "orpheus", "google",
    ]);
    const resolvedProvider =
        voiceProvider === "elevenlabs" ? "11labs" :
        VALID_VAPI_PROVIDERS.has(voiceProvider) ? voiceProvider :
        "google";
    const voiceConfig = {
        provider: resolvedProvider,
        voiceId: voiceId || "Aoede",
    };

    return {
        name: `Agent ${agent.id} — ${agent.name}`.slice(0, 40),
        model: {
            provider: "google",
            model: "gemini-2.5-flash",
            messages: [{ role: "system", content: systemPrompt }],
            ...(calcomAddons?.tools?.length ? { tools: calcomAddons.tools } : {}),
        },
        voice: voiceConfig,
        firstMessage: agent.greetingMessage || "Hello!",
        // Inbound-call metadata so the webhook + tool handler can attribute calls.
        metadata: { agentId: String(agent.id) },
        serverUrl:
            process.env.VAPI_SERVER_URL_PLACEHOLDER ||
            process.env.NEXT_PUBLIC_WEBHOOK_URL ||
            undefined,
    };
}

export async function GET(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    const authz = await authorizeAgent(userId, agentId);
    if (authz.error) return NextResponse.json({ error: authz.error }, { status: authz.status });

    // Number currently assigned to this agent
    const assigned = await db.query.phoneNumbers.findFirst({
        where: eq(phoneNumbers.assignedAgentId, agentId),
    });

    // Available pool: user's numbers not yet assigned to anyone
    const available = await db.query.phoneNumbers.findMany({
        where: and(
            eq(phoneNumbers.userId, userId),
            isNull(phoneNumbers.assignedAgentId),
        ),
    });

    return NextResponse.json({ assigned: assigned || null, available });
}

export async function POST(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    const authz = await authorizeAgent(userId, agentId);
    if (authz.error) return NextResponse.json({ error: authz.error }, { status: authz.status });

    const body = await req.json();
    const phoneNumberId = parseInt(body.phoneNumberId, 10);
    if (Number.isNaN(phoneNumberId)) {
        return NextResponse.json({ error: "phoneNumberId required" }, { status: 400 });
    }

    const number = await db.query.phoneNumbers.findFirst({
        where: and(
            eq(phoneNumbers.id, phoneNumberId),
            eq(phoneNumbers.userId, userId),
        ),
    });
    if (!number) return NextResponse.json({ error: "Number not found" }, { status: 404 });

    // First, unassign whatever number this agent had previously (one number / agent).
    await db
        .update(phoneNumbers)
        .set({ assignedAgentId: null, updatedAt: new Date() })
        .where(eq(phoneNumbers.assignedAgentId, agentId));

    // Create (or refresh) a Vapi assistant for this agent and bind it to the
    // phone number. Failures here propagate so the caller sees a real error
    // instead of silent half-assignment.
    const vapiNumberId = number.providerIds?.vapiNumberId;
    if (!vapiNumberId) {
        return NextResponse.json(
            { error: "This number isn't registered with Vapi yet — re-import it." },
            { status: 400 },
        );
    }

    let assistantId;
    try {
        const config = await buildAgentAssistantConfig(authz.agent);
        assistantId = await createTransientAssistant(config);
        await setAssistantOnNumber(vapiNumberId, assistantId);
    } catch (e) {
        console.error("[ASSIGN PHONE] Vapi error:", e?.message, e?.detail);
        return NextResponse.json(
            { error: e?.message || "Failed to bind number to agent on Vapi" },
            { status: 500 },
        );
    }

    const [updated] = await db
        .update(phoneNumbers)
        .set({
            assignedAgentId: agentId,
            providerIds: {
                ...(number.providerIds || {}),
                vapiNumberId,
                vapiAssistantId: assistantId,
            },
            updatedAt: new Date(),
        })
        .where(eq(phoneNumbers.id, number.id))
        .returning();

    return NextResponse.json({ phoneNumber: updated, assistantId });
}

export async function DELETE(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    const authz = await authorizeAgent(userId, agentId);
    if (authz.error) return NextResponse.json({ error: authz.error }, { status: authz.status });

    const number = await db.query.phoneNumbers.findFirst({
        where: eq(phoneNumbers.assignedAgentId, agentId),
    });
    if (!number) return NextResponse.json({ success: true });

    // Best-effort: remove the assistant binding on Vapi so the number stops routing.
    const vapiNumberId = number.providerIds?.vapiNumberId;
    if (vapiNumberId) {
        try {
            await setAssistantOnNumber(vapiNumberId, null);
        } catch (e) {
            console.warn("[UNASSIGN PHONE] Vapi unbind failed:", e?.message);
        }
    }

    await db
        .update(phoneNumbers)
        .set({ assignedAgentId: null, updatedAt: new Date() })
        .where(eq(phoneNumbers.id, number.id));
    return NextResponse.json({ success: true });
}
