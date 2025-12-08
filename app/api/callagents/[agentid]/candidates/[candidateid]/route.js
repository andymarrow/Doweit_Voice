// app/api/callagents/[agentid]/candidates/[candidateid]/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { interviews, callAgents } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = parseInt(params.agentid, 10);
    const candidateId = parseInt(params.candidateid, 10);

    try {
        // 1. Verify Ownership
        const agentCheck = await db.query.callAgents.findFirst({
            where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, user.id)),
            columns: { id: true }
        });

        if (!agentCheck) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        // 2. Fetch Full Interview Data
        const interviewData = await db.query.interviews.findFirst({
            where: and(
                eq(interviews.id, candidateId),
                eq(interviews.agentId, agentId)
            )
        });

        if (!interviewData) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

        return NextResponse.json(interviewData, { status: 200 });

    } catch (error) {
        console.error("Candidate Detail Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}