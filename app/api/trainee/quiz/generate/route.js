export const dynamic = 'force-dynamic';
// app/api/trainee/quiz/generate/route.js
// Generates a quiz tied to a trainee interview. The quiz reuses the
// interview's description + system prompt + question list as context, so the
// quiz drills the same material the spoken interview covers.
// Body: { interviewId, count? }   ← primary path
//       { topic, count? }         ← legacy path, free-form topic
//       { agentId, count? }       ← legacy path, callAgents-based
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents, traineeInterviews } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { interviewId, agentId, topic, count } = await req.json();

        let context = topic || "General Technical Interview";
        let title = topic || "Quiz";
        let resolvedQuestionCount;
        let language = "English";

        if (interviewId) {
            const [iv] = await db
                .select()
                .from(traineeInterviews)
                .where(and(
                    eq(traineeInterviews.id, interviewId),
                    eq(traineeInterviews.userId, user.id)
                ));
            if (!iv) {
                return NextResponse.json({ error: "Interview not found" }, { status: 404 });
            }
            const qList = Array.isArray(iv.aiQuestions) ? iv.aiQuestions : [];
            context = [
                `Title: ${iv.title}`,
                `Department: ${iv.department || "—"}`,
                `Experience: ${iv.experienceLevel || "—"}`,
                `Description:\n${iv.description || ""}`,
                `System Prompt:\n${iv.systemPrompt || ""}`,
                `Source Questions:\n${qList.map((q, i) => `${i + 1}. ${q}`).join("\n")}`,
            ].join("\n\n");
            title = iv.title;
            resolvedQuestionCount = iv.questionCount || qList.length || 8;
            language = iv.language || "English";
        } else if (agentId) {
            const agent = await db.query.callAgents.findFirst({
                where: eq(callAgents.id, agentId),
            });
            if (agent) {
                context = agent.recruitmentConfig?.jobDescription || agent.prompt || context;
                title = agent.name || title;
            }
        }

        const finalCount = Number(count) > 0 ? Number(count) : (resolvedQuestionCount || 10);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
        });

        const prompt = `
Create a written practice quiz based on this interview context.

LANGUAGE: Write every question, option, and explanation in ${language}. Do not use any other language.

CONTEXT:
${String(context).substring(0, 5000)}

Generate exactly ${finalCount} multiple-choice questions. Each must:
- Have 4 distinct options
- Have one unambiguously correct answer
- Test understanding of material from the context above (not generic filler)

Return ONLY a JSON array using this schema:
[
  {
    "id": 1,
    "type": "choice",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "explanation": "..."
  }
]
`;

        const result = await model.generateContent(prompt);
        let questions;
        try {
            questions = JSON.parse(result.response.text());
        } catch {
            return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
        }
        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: "AI did not return questions" }, { status: 502 });
        }

        questions = questions
            .filter(q => q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length >= 2)
            .map((q, i) => ({
                id: q.id ?? i + 1,
                type: "choice",
                question: q.question,
                options: q.options.slice(0, 4),
                answer: typeof q.answer === "number" ? q.answer : 0,
                explanation: q.explanation || "",
            }));

        return NextResponse.json({ questions, title }, { status: 200 });
    } catch (error) {
        console.error("Quiz Gen Error:", error);
        return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}
