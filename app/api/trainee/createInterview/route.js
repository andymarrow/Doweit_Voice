// app/api/trainee/createInterview/route.js
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/database";
import { traineeInterviews } from "@/lib/db/schemaCharacterAI";
import { generateId } from "@/lib/utils/generateId";

export const dynamic = "force-dynamic";

export async function POST(request) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const {
            title,
            duration,
            questionCount,
            department,
            language,
            experienceLevel,
            description,
            systemPrompt,
            aiQuestions,
            recommendation,
            evaluationCriteria,
            voiceProvider,
            voiceId,
            agentName,
            tone,
            interviewer,
            status,
        } = body || {};

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const id = generateId(12);

        const [row] = await db
            .insert(traineeInterviews)
            .values({
                id,
                userId: user.id,
                title,
                duration: duration ?? 30,
                questionCount: questionCount ?? 8,
                department: department || null,
                language: language || "English",
                experienceLevel: experienceLevel || null,
                description: description || null,
                systemPrompt: systemPrompt || null,
                aiQuestions: aiQuestions || [],
                recommendation: recommendation || null,
                evaluationCriteria: evaluationCriteria || [],
                voiceProvider: voiceProvider || "vapi",
                voiceId: voiceId || "monitor",
                agentName: agentName || "Viktor",
                tone: tone || "Friendly",
                interviewer: interviewer || "vapi",
                status: status || "active",
            })
            .returning();

        return NextResponse.json({ success: true, data: row }, { status: 201 });
    } catch (error) {
        console.error("Trainee createInterview error:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}
