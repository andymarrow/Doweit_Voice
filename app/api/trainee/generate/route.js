export const dynamic = 'force-dynamic';
// app/api/trainee/generate/route.js
// Single endpoint that generates BOTH the system prompt and the question list
// for a trainee interview. The frontend calls this once on the user's "Generate"
// click; if the user submits a recommendation, it's woven into both prompts so
// the regenerated output reflects their feedback. The generated prompt and
// questions are NOT shown to the trainee.
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/configs/constants";

const apiKey = GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY environment variable not set.");
const ai = new GoogleGenerativeAI(apiKey);

function fallbackQuestions(title, level, count) {
  const base = [
    "Tell me about your background and what drew you to this role.",
    "Describe a challenging project you've worked on and how you handled it.",
    "How do you approach learning something new in this field?",
    "Walk me through a problem you solved that you're proud of.",
    "How do you handle disagreement with a teammate or stakeholder?",
    "What's your process for prioritizing competing tasks?",
    "Describe a mistake you made and what you learned.",
    "Where do you see yourself growing professionally next?",
  ];
  return base.slice(0, count);
}

async function withRetry(fn, max = 3) {
  let last;
  for (let i = 0; i < max; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 2 ** i * 1000));
    }
  }
  throw last;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      department,
      description,
      experienceLevel,
      language = "",
      duration = 30,
      questionCount = 8,
      recommendation,
      evaluationCriteria,
    } = body || {};

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 },
      );
    }

    const criteriaString =
      Array.isArray(evaluationCriteria) && evaluationCriteria.length
        ? evaluationCriteria
            .map((c) => `- ${c.name} (${c.weight}%): ${c.method || ""}`)
            .join("\n")
        : "Use general professional interview rubric (technical, communication, problem solving, culture fit, confidence).";

    const recBlock = recommendation
      ? `\nUSER RECOMMENDATION (apply these adjustments precisely):\n${recommendation}\n`
      : "";

    const promptInstruction = `
You are an expert AI interview system designer. Generate a comprehensive system prompt for an AI interviewer for a TRAINEE practice interview.

Job Details:
- Title: ${title}
- Department: ${department || "Not specified"}
- Experience Level: ${experienceLevel || "Not specified"}
- Language of generate: ${language}
- Duration: ${duration} minutes
- Description: ${description}

Evaluation Criteria:
${criteriaString}
${recBlock}
Instructions:
1. Write the prompt in ${language}.
2. Include interviewer persona, tone, evaluation guidance, and time management.
3. The interviewee is a trainee practicing — be encouraging but realistic.
4. Output ONLY the system prompt, no markdown fences, no commentary.`;

    const timePerQuestion = Math.max(
      1,
      Math.floor(duration / Math.max(1, questionCount)),
    );

    const questionInstruction = `
You are an expert technical interviewer. Generate exactly ${questionCount} interview questions for the following role.

Job Details:
- Title: ${title}
- Department: ${department || "Not specified"}
- Experience Level: ${experienceLevel || "Not specified"}
- Language of generate: ${language}
- Duration: ${duration} minutes (${timePerQuestion} min/question)
- Description: ${description}

Evaluation Criteria:
${criteriaString}
${recBlock}
Rules:
1. Mix technical (40%), behavioral (30%), situational (20%), background (10%).
2. Each question answerable within ${timePerQuestion} minutes at ${experienceLevel || "mid"} level.
3. Output ONLY a JSON array of strings. No markdown, no explanation.
Example: ["Question 1?", "Question 2?"]`;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Run both generations in parallel.
    const [promptText, questionsText] = await Promise.all([
      withRetry(async () => {
        const r = await model.generateContent(promptInstruction);
        return (await r.response).text();
      }),
      withRetry(async () => {
        const r = await model.generateContent(questionInstruction);
        return (await r.response).text();
      }),
    ]);

    const systemPrompt = (promptText || "").trim();

    let questions = [];
    try {
      let cleaned = questionsText || "";
      if (cleaned.includes("```json")) {
        cleaned = cleaned.replace(/```json\s*/, "").replace(/```\s*$/, "");
      } else if (cleaned.includes("```")) {
        cleaned = cleaned.replace(/```\s*/, "").replace(/```\s*$/, "");
      }
      questions = JSON.parse(cleaned);
      if (!Array.isArray(questions)) throw new Error("not an array");
      questions = questions
        .filter((q) => typeof q === "string" && q.trim().length > 0)
        .map((q) => q.trim())
        .slice(0, questionCount);
    } catch {
      questions = [];
    }
    if (questions.length < questionCount) {
      questions = [
        ...questions,
        ...fallbackQuestions(
          title,
          experienceLevel,
          questionCount - questions.length,
        ),
      ];
    }

    return NextResponse.json({ success: true, systemPrompt, questions });
  } catch (error) {
    console.error("Trainee generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate", details: error.message },
      { status: 500 },
    );
  }
}
