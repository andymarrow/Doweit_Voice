import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database";
import { calls } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';

// Import our Gemini logic
import { extractActionValuesFromTranscript } from "@/lib/gemini/actionExtractor";

// This route will be called by the frontend to trigger analysis for a specific call
export async function POST(req, { params }) {
    const { userId } = auth();
    const callId = parseInt(params.callid, 10);

    if (isNaN(callId)) {
        return NextResponse.json({ error: 'Invalid call ID' }, { status: 400 });
    }

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[ANALYSIS TRIGGER] Received request to analyze call ${callId} for user ${userId}.`);

        // Step 1: Fetch the call record and verify ownership
        const callRecord = await db.query.calls.findFirst({
            where: and(eq(calls.id, callId)),
            with: {
                agent: {
                    // We need the creatorId to verify ownership
                    columns: { creatorId: true },
                    // Fetch all configured agentActions for the prompt
                    with: {
                        agentActions: {
                            with: {
                                action: true
                            }
                        }
                    }
                }
            }
        });

        if (!callRecord) {
            return NextResponse.json({ error: 'Call not found' }, { status: 404 });
        }
        if (callRecord.agent.creatorId !== userId) {
            return NextResponse.json({ error: 'Not authorized to analyze this call' }, { status: 403 });
        }
        if (!callRecord.transcript || callRecord.transcript.length === 0) {
            return NextResponse.json({ error: 'Call has no transcript to analyze' }, { status: 400 });
        }
        if (!callRecord.agent.agentActions || callRecord.agent.agentActions.length === 0) {
            return NextResponse.json({ message: 'No actions configured for this agent, skipping analysis.' }, { status: 200 });
        }

        // Step 2: Trigger the analysis function in the background ("fire and forget")
        extractActionValuesFromTranscript(
            callRecord.id,
            callRecord.agent.agentActions,
            callRecord.transcript
        ).catch(error => {
            console.error(`[ANALYSIS ERROR] for callId ${callRecord.id}:`, error);
        });

        // Step 3: Immediately return a success response to the frontend
        return NextResponse.json({ success: true, message: 'Analysis has been initiated.' }, { status: 202 }); // 202 Accepted is a good status code here

    } catch (error) {
        console.error(`[ANALYSIS TRIGGER] API Error for call ${callId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}