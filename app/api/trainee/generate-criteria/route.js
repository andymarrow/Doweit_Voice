// app/api/trainee/generate-criteria/route.js
// Generates evaluation criteria from the AI-prepared system prompt + questions.
// Count of criteria = questionCount + 2 (per spec). Returns weights summing
// to 100. Called from CreateSession step 3 (Evaluation), AFTER AI Prepare
// has produced systemPrompt + aiQuestions.
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/configs/constants";

const apiKey = GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Methodology pool we use as fallback / hint to the AI.
const METHODS = [
  "AI Semantic Analysis",
  "Tone & Sentiment",
  "Logic Evaluation",
  "Behavioral Analysis",
  "Scenario Assessment",
  "Value Alignment",
  "Implementation Review",
  "Architecture Evaluation",
  "STAR Method Scoring",
  "Depth Assessment",
];

function normalizeWeights(items) {
  const n = items.length;
  if (!n) return items;
  const base = Math.floor(100 / n);
  const rem = 100 - base * n;
  return items.map((c, i) => ({
    ...c,
    weight: i === 0 ? base + rem : base,
    range: c.range || "0-100",
  }));
}

function fallback(count) {
  const pool = [
    { name: "Technical Knowledge", method: "AI Semantic Analysis" },
  ];
  return normalizeWeights(pool.slice(0, count));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      systemPrompt,
      aiQuestions = [],
      questionCount,
      language,
      experienceLevel,
      recommendation,
    } = body || {};

    const targetCount =
      Number(questionCount) > 0
        ? Number(questionCount) + 2
        : Math.max(5, (aiQuestions?.length || 5) + 2);

    if (!ai) {
      return NextResponse.json({
        success: true,
        criteria: fallback(targetCount),
      });
    }

    const recBlock = recommendation
      ? `\nUSER RECOMMENDATION (apply when picking criteria):\n${recommendation}\n`
      : "";

    const prompt = `
You are an expert HR assessment designer. Build an evaluation rubric for the
following interview. The rubric should be specific to the actual prompt and
questions — not a generic template.

Title: ${title || "Practice interview"}
Experience Level: ${experienceLevel || "Not specified"}
Language of generate: ${language}

Description:
${(description || "").substring(0, 2500)}

System Prompt (interviewer instructions):
${(systemPrompt || "").substring(0, 2500)}

Interview Questions:
${(aiQuestions || [])
  .map((q, i) => `${i + 1}. ${q}`)
  .join("\n")
  .substring(0, 3000)}
${recBlock}
Rules:
1. Output EXACTLY ${targetCount} criteria.
2. Each criterion must be tailored to what these specific questions actually
   test. Avoid generic filler.
3. weight values must be POSITIVE INTEGERS that sum to exactly 100.
4. Return ONLY a JSON array, no markdown.

Schema:
[
  {"name": "string", "method": "string", "weight": <int>, "range": "0-100"}
]

Allowed methods (or invent a similar one): ${METHODS.join(", ")}.
`;

    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });

    let parsed;
    try {
      const r = await model.generateContent(prompt);
      const text = (await r.response).text();
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("generate-criteria parse:", e);
      return NextResponse.json({
        success: true,
        criteria: fallback(targetCount),
      });
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json({
        success: true,
        criteria: fallback(targetCount),
      });
    }

    // Clean + cap to targetCount, then renormalize weights to ensure sum = 100.
    let cleaned = parsed
      .filter((c) => c && typeof c.name === "string" && c.name.trim())
      .slice(0, targetCount)
      .map((c) => ({
        name: c.name.trim(),
        method:
          typeof c.method === "string" && c.method.trim()
            ? c.method.trim()
            : "AI Semantic Analysis",
        weight: Number(c.weight) > 0 ? Math.round(Number(c.weight)) : 0,
        range: "0-100",
      }));

    if (cleaned.length < targetCount) {
      cleaned = cleaned.concat(fallback(targetCount - cleaned.length));
    }

    const sum = cleaned.reduce((s, c) => s + (c.weight || 0), 0);
    if (sum !== 100) cleaned = normalizeWeights(cleaned);

    return NextResponse.json({ success: true, criteria: cleaned });
  } catch (error) {
    console.error("generate-criteria error:", error);
    return NextResponse.json(
      { error: "Failed to generate criteria", details: error.message },
      { status: 500 },
    );
  }
}
