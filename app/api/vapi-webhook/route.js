import { NextResponse } from "next/server";
import { db } from "@/lib/database";
// Import 'interviews' and 'callAgents' for the new flow, keep 'calls' for the old flow
import { calls, interviews, callAgents } from "@/lib/db/schemaCharacterAI";
import { eq, sql } from "drizzle-orm";
// Import the new analysis engine
import { analyzeCandidateInterview } from "@/lib/recruitment/analysisEngine";

// Allow longer timeout for AI analysis if deployed on Vercel Pro/Edge
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

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
            const recordingUrl = body.message?.recordingUrl || callData?.recordingUrl;
            const transcript = body.message?.transcript || callData?.transcript;

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

                    // Trigger the Gemini Analysis
                    const analysisResult = await analyzeCandidateInterview(
                        transcript,
                        session.agent.recruitmentConfig
                    );

                    // Update the Interview Record
                    await db.update(interviews).set({
                        status: 'completed',
                        transcript: transcript, // Save raw transcript
                        audioUrl: recordingUrl,
                        fitScore: analysisResult.fitScore || 0, // Extract score
                        analysisData: analysisResult, // Save the full JSON report from Gemini
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
                    // We still proceed to try and update status if needed, or just log
                }

                console.log(`[VAPI WEBHOOK] Checking for Standard Call ID: ${vapiCallId}`);

                // Find and update the call in the standard 'calls' table
                // Drizzle's ->> operator is used to query inside a JSONB field.
                const result = await db
                    .update(calls)
                    .set({
                        audioUrl: recordingUrl,
                        // Optional: You might want to save the transcript to the standard calls table too if your schema has it
                        transcript: transcript ? { role: 'assistant', message: transcript } : undefined, 
                        updatedAt: new Date()
                    })
                    .where(sql`${calls.rawCallData}->>'vapiCallId' = ${vapiCallId}`)
                    .returning({ id: calls.id });

                if (result.length > 0) {
                    console.log(
                        `[VAPI WEBHOOK] Successfully updated standard call ${result[0].id} with recording URL.`,
                    );
                } else {
                    // Only warn if it wasn't handled by the Interview logic either
                    if (!sessionId) {
                        console.warn(
                            `[VAPI WEBHOOK] Could not find a matching call in 'calls' DB for Vapi Call ID: ${vapiCallId}`,
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