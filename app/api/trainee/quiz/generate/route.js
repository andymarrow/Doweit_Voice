export const dynamic = "force-dynamic";
// app/api/trainee/quiz/generate/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents } from "@/lib/db/schemaCharacterAI";
import { eq } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { agentId, count = 10 } = await req.json();

        // 1. Fetch Agent to get the Knowledge Base / Recruitment Config
        const agent = await db.query.callAgents.findFirst({
            where: eq(callAgents.id, agentId)
        });

        if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

        // Extract context
        const context = agent.recruitmentConfig?.jobDescription || agent.prompt || "General Technical Interview";

        // 2. Generate Questions via Gemini
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        Create a training quiz based on the following job context:
        "${context.substring(0, 3000)}"

        Generate exactly ${count} questions.
        Mix the types: 'choice' (Multiple Choice), 'true_false', and 'flashcard'.

        JSON Output Format:
        [
            {
                "id": 1,
                "type": "choice",
                "question": "...",
                "options": ["A", "B", "C", "D"],
                "answer": 0, // Index of correct option
                "explanation": "..."
            },
            {
                "id": 2,
                "type": "flashcard",
                "question": "Define X",
                "answer": "Definition of X...",
                "explanation": "Self-assessed"
            }
        ]
        `;

        const result = await model.generateContent(prompt);
        const questions = JSON.parse(result.response.text());

        return NextResponse.json({ questions }, { status: 200 });

    } catch (error) {
        console.error("Quiz Gen Error:", error);
        return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}
