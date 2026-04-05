export const dynamic = "force-dynamic";
// app/api/interview/session/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { interviews } from "@/lib/db/schemaCharacterAI";

export async function POST(req) {
    try {
        const body = await req.json();
        const { agentId, candidateName, candidateEmail } = body;

        if (!agentId || !candidateName || !candidateEmail) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create a new Interview record
        const [newSession] = await db.insert(interviews).values({
            agentId: parseInt(agentId),
            candidateName: candidateName,
            candidateEmail: candidateEmail,
            type: 'real_application', // or 'mock_training' if configured
            status: 'ongoing',
            fitScore: 0, // Initial score
            screenshots: [], // Start with empty array
            analysisData: {},
            createdAt: new Date()
        }).returning({ id: interviews.id });

        console.log(`[Interview Session] Started session ${newSession.id} for ${candidateEmail}`);

        return NextResponse.json({ sessionId: newSession.id }, { status: 201 });

    } catch (error) {
        console.error("[Interview Session] Creation Failed:", error);
        return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
    }
}
