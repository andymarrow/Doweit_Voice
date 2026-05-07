export const dynamic = "force-dynamic";
export const maxDuration = 60;
// app/api/callagents/[agentid]/call-my-phone/route.js
//
// Triggers an outbound call FROM the agent's assigned phone number TO the
// number the user provides ("call my phone"). The user picks up and talks
// to the agent on the line they bought from Twilio/Vapi — the acceptance
// test for Phase C.
//
// Pre-conditions:
//   - Agent must have a phone number assigned (POST /api/callagents/<id>/phone-number first)
//   - That number must have providerIds.vapiNumberId AND vapiAssistantId

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents, phoneNumbers } from "@/lib/db/schemaCharacterAI";
import { eq } from "drizzle-orm";
import { makeOutboundCall, getCallStatus } from "@/lib/integrations/adapters/vapiNumbers";
import { resolveCallAgentId } from "@/lib/utils/publicId";

export async function POST(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, agentId),
        columns: { id: true, creatorId: true, name: true },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (agent.creatorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { phoneNumber, userName } = await req.json();
    if (!phoneNumber || !/^\+[1-9]\d{1,14}$/.test(phoneNumber.trim())) {
        return NextResponse.json(
            { error: "Provide phoneNumber in E.164 format (e.g. +15551234567)" },
            { status: 400 },
        );
    }

    const assigned = await db.query.phoneNumbers.findFirst({
        where: eq(phoneNumbers.assignedAgentId, agentId),
    });
    if (!assigned) {
        return NextResponse.json(
            {
                error:
                    "This agent doesn't have a phone number assigned. Connect one from the agent dashboard first.",
            },
            { status: 400 },
        );
    }
    const vapiNumberId = assigned.providerIds?.vapiNumberId;
    const assistantId = assigned.providerIds?.vapiAssistantId;
    if (!vapiNumberId || !assistantId) {
        return NextResponse.json(
            {
                error:
                    "The assigned number isn't fully wired to Vapi. Re-assign it from the dashboard.",
            },
            { status: 400 },
        );
    }

    try {
        const result = await makeOutboundCall({
            phoneNumberId: vapiNumberId,
            assistantId,
            customerNumber: phoneNumber.trim(),
            customerName: userName || "Test caller",
            metadata: { agentId: String(agent.id), source: "call-my-phone" },
        });

        // Poll Vapi until the call reaches a terminal/ringing state.
        // Twilio trial rejections typically surface within ~15 s, so we poll
        // for up to 20 s (12 × ~1.7 s) before giving up and returning optimistic.
        let lastStatus = null;
        for (let i = 0; i < 12; i++) {
            await new Promise((r) => setTimeout(r, 1700));
            try {
                lastStatus = await getCallStatus(result.id);
            } catch (statusErr) {
                console.warn("[CALL MY PHONE] getCallStatus failed:", statusErr?.message);
                break;
            }
            if (lastStatus?.status === "in-progress" || lastStatus?.status === "ringing") break;
            if (lastStatus?.status === "ended") break;
        }

        if (lastStatus?.status === "ended") {
            const reason = String(lastStatus.endedReason || "unknown");
            // Twilio rejects unverified numbers on trial accounts with error
            // codes that surface on Vapi as endedReason containing "twilio" or
            // "21219" / "unverified". Also catch the case where endedReason is
            // missing entirely — that usually means a carrier-level rejection.
            const isTwilioTrial =
                reason === "unknown" ||
                /twilio/i.test(reason) ||
                /unverified/i.test(reason) ||
                /not-?a-?verified/i.test(reason) ||
                /21\d{3}/.test(reason);
            const hint = isTwilioTrial
                ? "The call failed to connect. If you're using a Twilio trial account, you can only call numbers that are verified in your Twilio console — go to Twilio → Phone Numbers → Verified Caller IDs and add your number, then try again."
                : `Call ended before connecting (${reason}). Check that the phone number is reachable and your Twilio account is active.`;
            return NextResponse.json(
                {
                    success: false,
                    callId: result.id,
                    endedReason: reason,
                    hint,
                },
                { status: 200 },
            );
        }

        return NextResponse.json({
            success: true,
            callId: result.id,
            status: lastStatus?.status || "queued",
        });
    } catch (e) {
        console.error("[CALL MY PHONE]", e?.message, e?.detail);
        return NextResponse.json(
            { error: e?.message || "Failed to start call" },
            { status: 500 },
        );
    }
}
