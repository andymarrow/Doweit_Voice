// app/api/trainee/interview/[id]/analyze/route.js
// Called when a trainee finishes an interview attempt. Body:
//   { transcript: [{role, text, ...}], attemptId? }
// Sends transcript + evaluationCriteria + systemPrompt to Gemini, parses
// general (overall summary) and specific (per-criterion) results, then writes
// all three JSONB stores keyed by attemptId.
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/database";
import { traineeInterviews } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/configs/constants";
import { generateId } from "@/lib/utils/generateId";
import { deductTokens } from "@/lib/tokens/deductTokens";

export const dynamic = "force-dynamic";

const apiKey = GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function transcriptToText(transcript) {
    if (typeof transcript === "string") return transcript;
    if (!Array.isArray(transcript)) return "";
    return transcript
        .map((t) => {
            const role = t.role === "user" ? "Candidate" : "Interviewer";
            const text = t.text ?? t.content ?? "";
            return `${role}: ${text}`;
        })
        .join("\n");
}

function safeJson(text) {
    if (!text) return null;
    let s = text.trim();
    if (s.startsWith("```")) {
        s = s.replace(/```(?:json)?\s*/, "").replace(/```\s*$/, "");
    }
    try {
        return JSON.parse(s);
    } catch {
        const m = s.match(/\{[\s\S]*\}/);
        if (m) {
            try {
                return JSON.parse(m[0]);
            } catch {
                return null;
            }
        }
        return null;
    }
}

export async function POST(request, { params }) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { transcript = [], attemptId: clientAttemptId } = body || {};

    const [row] = await db
        .select()
        .from(traineeInterviews)
        .where(and(eq(traineeInterviews.id, id), eq(traineeInterviews.userId, user.id)));

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const attemptId = clientAttemptId || generateId(12);
    const transcriptText = transcriptToText(transcript);
    const startedAt = new Date().toISOString();

    const criteriaList = Array.isArray(row.evaluationCriteria) ? row.evaluationCriteria : [];
    const criteriaString = criteriaList.length
        ? criteriaList.map((c) => `- ${c.name} (${c.weight}%): ${c.method || ""}`).join("\n")
        : "Use general professional rubric.";

    let general = null;
    let specific = null;
    let reasons = null;

    if (!ai || !transcriptText) {
        general = {
            fitScore: 0,
            summary: transcriptText
                ? "Analysis unavailable: AI not configured."
                : "No transcript was captured for this attempt.",
            hiringRecommendation: "Review",
            completedAt: startedAt,
        };
        specific = { skillRadar: [], perCriterion: [] };
        reasons = { reasons: "AI analysis was not run." };
    } else {
        try {
            const model = ai.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" },
            });

            const prompt = `
You are an Expert HR Analyst evaluating a TRAINEE practice interview.

--- INTERVIEW CONTEXT ---
Title: ${row.title}
Department: ${row.department || "N/A"}
Experience Level: ${row.experienceLevel || "N/A"}
Description: ${(row.description || "").substring(0, 1500)}

--- INTERVIEWER SYSTEM PROMPT ---
${(row.systemPrompt || "Standard professional interview.").substring(0, 1500)}

--- EVALUATION CRITERIA ---
${criteriaString}

--- TRANSCRIPT ---
${transcriptText.substring(0, 18000)}

TASK:
Return a JSON object with EXACTLY this shape:
{
  "general": {
    "fitScore": 0-100,
    "summary": "2-3 sentence executive summary",
    "hiringRecommendation": "Strong Hire" | "Hire" | "Review" | "Reject",
    "strengths": ["..."],
    "weaknesses": ["..."]
  },
  "specific": {
    "skillRadar": [
      {"subject":"Technical","A":0-100,"fullMark":100},
      {"subject":"Communication","A":0-100,"fullMark":100},
      {"subject":"Culture Fit","A":0-100,"fullMark":100},
      {"subject":"Problem Solving","A":0-100,"fullMark":100},
      {"subject":"Confidence","A":0-100,"fullMark":100}
    ],
    "perCriterion": [
      {"name":"<criterion name>","weight":<int>,"score":0-100,"feedback":"..."}
    ]
  },
  "reasons": {
    "overall": "Why this score was given (3-5 sentences).",
    "perCriterion": [
      {"name":"<criterion name>","reason":"..."}
    ]
  }
}
Return ONLY the JSON. No markdown, no commentary.`;

            const r = await model.generateContent(prompt);
            const text = (await r.response).text();
            const parsed = safeJson(text);
            if (parsed && parsed.general && parsed.specific) {
                general = { ...parsed.general, completedAt: startedAt };
                specific = parsed.specific;
                reasons = parsed.reasons || { reasons: "" };
            } else {
                throw new Error("Invalid AI JSON");
            }
        } catch (e) {
            console.error("Trainee analyze AI failure:", e);
            general = {
                fitScore: 0,
                summary: "Automatic analysis failed; please retry.",
                hiringRecommendation: "Review",
                completedAt: startedAt,
            };
            specific = { skillRadar: [], perCriterion: [] };
            reasons = { reasons: e.message };
        }
    }

    const transcripts = { ...(row.transcripts || {}), [attemptId]: { transcript, startedAt } };
    const results = { ...(row.results || {}), [attemptId]: { general, specific } };
    const resultReasons = { ...(row.resultReasons || {}), [attemptId]: reasons };

    await db
        .update(traineeInterviews)
        .set({ transcripts, results, resultReasons })
        .where(eq(traineeInterviews.id, id));

    // Deduct tokens based on interview duration (1 min = 10 tokens)
    let tokenCost = 0;
    try {
        const prevTranscripts = row.transcripts || {};
        const startedAtStr = prevTranscripts[attemptId]?.startedAt || startedAt;
        const durationMinutes = startedAtStr
            ? Math.max(1, Math.ceil((Date.now() - new Date(startedAtStr).getTime()) / 60000))
            : 1;
        const result = await deductTokens({
            userId: user.id,
            durationMinutes,
            description: `Trainee Interview: ${row.title}`,
            interviewType: 'trainee',
        });
        tokenCost = result.cost;
    } catch (e) {
        console.error('[TOKEN] Failed to deduct tokens for trainee interview:', e?.message);
    }

    return NextResponse.json({
        success: true,
        attemptId,
        result: { general, specific, reasons },
        tokenCost,
    });
}
