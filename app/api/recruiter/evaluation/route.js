export const dynamic = 'force-dynamic';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/configs/constants";

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

const FALLBACK_POOL = [
  { name: "Technical Knowledge", method: "AI Semantic Analysis" },
  { name: "Communication Skills", method: "Tone & Sentiment" },
  { name: "Problem Solving", method: "Logic Evaluation" },
  { name: "Cultural Fit", method: "Value Alignment" },
  { name: "Confidence", method: "Behavioral Analysis" },
  { name: "Adaptability", method: "Scenario Assessment" },
  { name: "Leadership Potential", method: "Behavioral Analysis" },
  { name: "Creativity", method: "AI Semantic Analysis" },
  { name: "Teamwork", method: "Value Alignment" },
  { name: "Analytical Thinking", method: "Logic Evaluation" },
  { name: "Initiative", method: "Behavioral Analysis" },
  { name: "Domain Expertise", method: "AI Semantic Analysis" },
];

function buildFallback(count) {
  const n = Math.min(count, FALLBACK_POOL.length);
  const base = Math.floor(100 / n);
  const rem = 100 - base * n;
  return FALLBACK_POOL.slice(0, n).map((c, i) => ({
    ...c,
    weight: i === 0 ? base + rem : base,
    range: "0-100",
  }));
}

export async function POST(request) {
  try {
    const { questionCount, language, systemPrompt, criteriaCount } = await request.json();

    const count = criteriaCount || (Number(questionCount) || 8) + 2;

    const prompt = `You are an expert recruiter designing evaluation criteria for an AI interview.

Based on this interview system prompt:
${systemPrompt || 'Professional AI interviewer conducting job interviews'}

Interview language: ${language || 'English'}
Number of interview questions: ${questionCount || 8}

Generate exactly ${count} evaluation criteria as a JSON array. Make the criteria specific to the role described in the system prompt.

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "name": "Criteria Name",
    "method": "Evaluation Method",
    "weight": NUMBER
  }
]

Available methods: "AI Semantic Analysis", "Tone & Sentiment", "Logic Evaluation", "Value Alignment", "Behavioral Analysis", "Scenario Assessment"

Rules:
- Weights must sum to exactly 100
- Use diverse methods across criteria
- First criterion absorbs any rounding remainder to ensure sum = 100
- Criteria names must be specific to the job role`;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    let text = "";
    let retries = 0;
    while (retries < 3) {
      try {
        const result = await model.generateContent(prompt);
        text = result.response.text();
        break;
      } catch (err) {
        retries++;
        if (retries >= 3) throw err;
        await new Promise((r) => setTimeout(r, Math.pow(2, retries - 1) * 1000));
      }
    }

    // Strip markdown wrappers
    let clean = text.trim();
    if (clean.includes("```json")) {
      clean = clean.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    } else if (clean.includes("```")) {
      clean = clean.replace(/```\s*/g, "");
    }

    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array in response");

    let criteria = JSON.parse(match[0]);
    if (!Array.isArray(criteria) || criteria.length === 0) throw new Error("Invalid criteria array");

    // Normalise weights to sum 100
    const total = criteria.reduce((s, c) => s + Number(c.weight || 0), 0);
    if (total !== 100) {
      const base = Math.floor(100 / criteria.length);
      const rem = 100 - base * criteria.length;
      criteria = criteria.map((c, i) => ({
        ...c,
        weight: i === 0 ? base + rem : base,
        range: "0-100",
      }));
    } else {
      criteria = criteria.map((c) => ({ ...c, range: "0-100" }));
    }

    return Response.json({ success: true, criteria });
  } catch (error) {
    console.error("Evaluation generation error:", error);
    return Response.json({ success: true, criteria: buildFallback(10) });
  }
}
