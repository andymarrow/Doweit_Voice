// app/api/callagents/[agentid]/candidates/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { interviews, callAgents } from "@/lib/db/schemaCharacterAI";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    const agentId = parseInt(params.agentid, 10);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Verify Ownership: Ensure the agent belongs to the requesting user
        const agentCheck = await db.query.callAgents.findFirst({
            where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)),
            columns: { id: true }
        });

        if (!agentCheck) {
            return NextResponse.json({ error: "Agent not found or unauthorized" }, { status: 404 });
        }

        // 2. Fetch Interviews for this Agent
        const candidates = await db.query.interviews.findMany({
            where: eq(interviews.agentId, agentId),
            orderBy: [desc(interviews.createdAt)], // Newest first
            // We fetch specific fields to keep the list lightweight
            // The full analysis/transcript is fetched only when opening the modal
            columns: {
                id: true,
                candidateName: true,
                candidateEmail: true,
                fitScore: true,
                status: true,
                createdAt: true,
                // We fetch analysisData to get the summary for the list view if needed, 
                // but usually better to keep list light.
                // analysisData: true 
            }
        });

        return NextResponse.json(candidates, { status: 200 });

    } catch (error) {
        console.error("[API Get Candidates] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}