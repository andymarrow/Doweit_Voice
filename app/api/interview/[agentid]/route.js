// app/api/interview/[agentid]/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { callAgents, users } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
    const agentId = parseInt(params.agentid, 10);
    
    if (isNaN(agentId)) {
        return NextResponse.json({ error: "Invalid Link" }, { status: 400 });
    }

    try {
        // Fetch agent details
        // We join with 'users' to get the Recruiter's name
        const agent = await db.select({
            id: callAgents.id,
            name: callAgents.name,
            avatarUrl: callAgents.avatarUrl,
            greetingMessage: callAgents.greetingMessage,
            voiceConfig: callAgents.voiceConfig,
            recruitmentConfig: callAgents.recruitmentConfig,
            recruiterName: users.name,
            status: callAgents.status
        })
        .from(callAgents)
        .leftJoin(users, eq(callAgents.creatorId, users.id))
        .where(and(
            eq(callAgents.id, agentId),
            // Only allow 'recruiter' or 'trainee_clone' types
            // eq(callAgents.type, 'recruiter') // Optional: enforce type check
        ))
        .limit(1);

        if (!agent || agent.length === 0) {
            return NextResponse.json({ error: "Interview not found or expired." }, { status: 404 });
        }

        const agentData = agent[0];

        // Security check: Is the interview active?
        if (agentData.status !== 'active') {
            return NextResponse.json({ error: "This interview is currently closed." }, { status: 403 });
        }

        return NextResponse.json(agentData, { status: 200 });

    } catch (error) {
        console.error("[API Public Interview] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}