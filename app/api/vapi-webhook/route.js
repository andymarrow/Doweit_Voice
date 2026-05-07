import { NextResponse } from "next/server";
import { db } from "@/lib/database";
// Import 'interviews' and 'callAgents' for the new flow, keep 'calls' for the old flow
import { calls, interviews, callAgents } from "@/lib/db/schemaCharacterAI";
import { eq, sql } from "drizzle-orm";
// Import the new analysis engine
import { analyzeCandidateInterview } from "@/lib/recruitment/analysisEngine";
// Auto-extract action values from the transcript as soon as it lands —
// avoids the user having to open every call and press "Analyze".
import { extractActionValuesFromTranscript } from "@/lib/gemini/actionExtractor";

// Allow longer timeout for AI analysis if deployed on Vercel Pro/Edge
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Look up the agent for a freshly-saved call and run the action extractor.
// Skips silently when the call has no transcript yet, when the agent has no
// actions configured, or when extraction has already populated values for
// this call (idempotent: avoids dupes if Vapi re-delivers the webhook).
async function triggerAutoExtraction(callId, transcriptArray) {
    if (!callId) return;
    if (!Array.isArray(transcriptArray) || transcriptArray.length === 0) {
        console.log(`[AUTO-EXTRACT] Skipping call ${callId}: no transcript array.`);
        return;
    }

    const callRow = await db.query.calls.findFirst({
        where: eq(calls.id, callId),
        columns: { id: true, agentId: true },
    });
    if (!callRow?.agentId) return;

    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, callRow.agentId),
        with: { agentActions: { with: { action: true } } },
    });
    const agentActions = agent?.agentActions || [];
    if (agentActions.length === 0) {
        console.log(`[AUTO-EXTRACT] Agent ${callRow.agentId} has no actions configured — skipping.`);
        return;
    }

    console.log(`[AUTO-EXTRACT] Running extractor for call ${callId} (${agentActions.length} actions)…`);
    await extractActionValuesFromTranscript(callId, agentActions, transcriptArray);
}

export async function POST(req) {
    try {
        const body = await req.json();

        // Log the entire incoming webhook payload for debugging
        console.log(
            "[VAPI WEBHOOK] Received webhook:",
            JSON.stringify(body, null, 2),
        );

        // Check for the specific message type for a ready recording
        if (body.message?.type === "end-of-call-report") {
            const callData = body.message.call;

            // Extract core data
            const vapiCallId = callData?.id;
            const recordingUrl =
                body.message?.recordingUrl ||
                body.message?.stereoRecordingUrl ||
                callData?.recordingUrl ||
                null;
            const transcriptText = body.message?.transcript || callData?.transcript || null;
            // Vapi delivers the structured role/message array under artifact.messages.
            const artifactMessages =
                body.message?.artifact?.messages ||
                body.message?.messages ||
                callData?.artifact?.messages ||
                null;
            const summary = body.message?.summary || callData?.summary || null;
            const startedAt = body.message?.startedAt || callData?.startedAt || null;
            const endedAt = body.message?.endedAt || callData?.endedAt || null;
            const duration =
                startedAt && endedAt
                    ? Math.max(
                          0,
                          Math.floor(
                              (new Date(endedAt).getTime() -
                                  new Date(startedAt).getTime()) /
                                  1000,
                          ),
                      )
                    : null;

            // Map Vapi's artifact messages into the shape the UI expects: { role, message, time }.
            const transcriptArray = Array.isArray(artifactMessages)
                ? artifactMessages
                      .filter(
                          (m) =>
                              m && (m.role === "user" || m.role === "assistant" || m.role === "bot"),
                      )
                      .map((m, i) => ({
                          role: m.role === "bot" ? "assistant" : m.role,
                          message: m.message || m.content || "",
                          time:
                              typeof m.time === "number"
                                  ? m.time
                                  : typeof m.secondsFromStart === "number"
                                    ? m.secondsFromStart
                                    : i,
                      }))
                : null;

            // --- 1. NEW LOGIC: Check for Recruitment Interview Session ---
            // We pass 'sessionId' in the metadata when starting an interview via the Magic Link
            const sessionId = callData?.metadata?.sessionId;

            if (sessionId) {
                console.log(`[VAPI WEBHOOK] Detected Recruitment Session ID: ${sessionId}`);

                // Fetch the session and the linked agent to get the Rubric/JD
                const session = await db.query.interviews.findFirst({
                    where: eq(interviews.id, parseInt(sessionId)),
                    with: {
                        agent: true // Needed to access recruitmentConfig for analysis
                    }
                });

                if (session && session.agent) {
                    console.log(`[VAPI WEBHOOK] Running Analysis Engine for Session ${sessionId}...`);

                    // Prefer the structured array for analysis; fall back to the flat transcript string.
                    const transcriptForAnalysis =
                        transcriptArray && transcriptArray.length > 0
                            ? transcriptArray
                            : transcriptText;

                    const analysisResult = await analyzeCandidateInterview(
                        transcriptForAnalysis,
                        session.agent.recruitmentConfig
                    );

                    await db.update(interviews).set({
                        status: 'completed',
                        transcript: transcriptArray || transcriptText,
                        audioUrl: recordingUrl,
                        fitScore: analysisResult.fitScore || 0,
                        analysisData: analysisResult,
                    }).where(eq(interviews.id, parseInt(sessionId)));

                    console.log(`[VAPI WEBHOOK] Interview ${sessionId} analysis complete. Score: ${analysisResult.fitScore}`);
                } else {
                    console.warn(`[VAPI WEBHOOK] Session ${sessionId} found in metadata but not in DB.`);
                }
            }

            // --- 2. EXISTING LOGIC: Standard Call Agent Updates ---
            // This preserves your current functionality for non-recruitment agents.
            // It tries to find a call in the 'calls' table by the vapiCallId.
            
            if (vapiCallId) {
                if (!recordingUrl) {
                    console.warn(`[VAPI WEBHOOK] Call ${vapiCallId} ended, but no recordingUrl was provided.`);
                }

                console.log(`[VAPI WEBHOOK] Checking for Standard Call ID: ${vapiCallId}`);

                // Build a partial update so we never overwrite with null/undefined what the
                // browser already saved (status: in_progress fix from before).
                const updatePayload = { updatedAt: new Date() };
                if (recordingUrl) updatePayload.audioUrl = recordingUrl;
                if (transcriptArray && transcriptArray.length > 0) {
                    updatePayload.transcript = transcriptArray;
                }
                if (typeof duration === "number") updatePayload.duration = duration;
                if (endedAt) updatePayload.endTime = new Date(endedAt);
                if (summary) updatePayload.summary = summary;

                const result = await db
                    .update(calls)
                    .set(updatePayload)
                    .where(sql`${calls.rawCallData}->>'vapiCallId' = ${vapiCallId}`)
                    .returning({ id: calls.id });

                if (result.length > 0) {
                    console.log(
                        `[VAPI WEBHOOK] Updated standard call ${result[0].id} (audio=${!!recordingUrl}, transcript=${transcriptArray?.length || 0} entries).`,
                    );
                    // Kick off action extraction immediately — fire-and-forget so we
                    // still respond to Vapi quickly. Skips silently if the agent has
                    // no actions configured or no transcript landed.
                    triggerAutoExtraction(result[0].id, transcriptArray).catch((e) =>
                        console.error("[VAPI WEBHOOK] Auto-extraction failed:", e?.message),
                    );
                } else if (!sessionId) {
                    // No row exists yet — the browser save lost the race or never fired (e.g. phone call).
                    // Insert a new call row so the agent's call history reflects this run.
                    const agentId = callData?.assistantOverrides?.metadata?.agentId
                        ? parseInt(callData.assistantOverrides.metadata.agentId, 10)
                        : callData?.metadata?.agentId
                          ? parseInt(callData.metadata.agentId, 10)
                          : null;

                    if (agentId && !Number.isNaN(agentId)) {
                        const startTime = startedAt ? new Date(startedAt) : new Date();
                        const endTime = endedAt ? new Date(endedAt) : new Date();
                        const customer = callData?.customer || {};
                        const [inserted] = await db
                            .insert(calls)
                            .values({
                                agentId,
                                phoneNumber: customer.number || "Phone Call",
                                direction: callData?.type === "outboundPhoneCall" ? "outbound" : "inbound",
                                status: "Completed",
                                transcript: transcriptArray || [],
                                duration: duration || 0,
                                startTime,
                                endTime,
                                audioUrl: recordingUrl || null,
                                summary: summary || null,
                                rawCallData: {
                                    customerName: customer.name || null,
                                    provider: "vapi",
                                    vapiCallId,
                                },
                            })
                            .returning({ id: calls.id });
                        console.log(
                            `[VAPI WEBHOOK] No existing row matched; inserted call ${inserted.id} for agent ${agentId}.`,
                        );
                        triggerAutoExtraction(inserted.id, transcriptArray).catch((e) =>
                            console.error("[VAPI WEBHOOK] Auto-extraction failed:", e?.message),
                        );
                    } else {
                        console.warn(
                            `[VAPI WEBHOOK] Could not find a matching call in 'calls' DB for Vapi Call ID: ${vapiCallId}; agentId not in metadata so cannot insert.`,
                        );
                    }
                }
            } else {
                 console.warn("[VAPI WEBHOOK] Webhook received without a Vapi call ID.");
            }
        }

        // Always return a 200 OK to Vapi to acknowledge receipt
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("[VAPI WEBHOOK] Error processing webhook:", error);
        // Return a server error, but Vapi might retry
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}