// app/api/trainee/quiz/route.js
// GET  → list the trainee's past quiz attempts
// POST → submit a finished attempt; computes score from answers and persists
//
// Self-healing: if the trainee_quiz_attempts table is missing the
// interview_id column (migration 0013 not applied), the POST handler
// transparently adds the column and retries. The GET handler uses an
// explicit column-select so it works regardless.
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/database";
import { traineeQuizAttempts } from "@/lib/db/schemaCharacterAI";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Postgres error code for "undefined_column".
const UNDEFINED_COLUMN = "42703";

async function ensureInterviewIdColumn() {
    await db.execute(sql`
        ALTER TABLE "trainee_quiz_attempts"
            ADD COLUMN IF NOT EXISTS "interview_id" varchar(12)
    `);
    await db.execute(sql`
        CREATE INDEX IF NOT EXISTS "trainee_quiz_attempts_interview_idx"
            ON "trainee_quiz_attempts" ("interview_id")
    `);
}

export async function GET(request) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("interviewId");

    // Try with interview_id first; if the column is missing, retry without
    // the filter (treating it as "all attempts for this user").
    const baseSelect = {
        id: traineeQuizAttempts.id,
        title: traineeQuizAttempts.title,
        score: traineeQuizAttempts.score,
        total: traineeQuizAttempts.total,
        createdAt: traineeQuizAttempts.createdAt,
    };

    try {
        let q = db
            .select({ ...baseSelect, interviewId: traineeQuizAttempts.interviewId })
            .from(traineeQuizAttempts);

        const where = interviewId
            ? sql`${traineeQuizAttempts.userId} = ${user.id} AND ${traineeQuizAttempts.interviewId} = ${interviewId}`
            : sql`${traineeQuizAttempts.userId} = ${user.id}`;

        const rows = await q
            .where(where)
            .orderBy(desc(traineeQuizAttempts.createdAt));
        return NextResponse.json({ success: true, data: rows });
    } catch (err) {
        const code = err?.code || err?.cause?.code;
        const msg = String(err?.message || "");
        if (code === UNDEFINED_COLUMN && msg.includes("interview_id")) {
            await ensureInterviewIdColumn();
            const rows = await db
                .select(baseSelect)
                .from(traineeQuizAttempts)
                .where(eq(traineeQuizAttempts.userId, user.id))
                .orderBy(desc(traineeQuizAttempts.createdAt));
            return NextResponse.json({ success: true, data: rows });
        }
        throw err;
    }
}

export async function POST(request) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { title, interviewId, agentId, questions = [], answers = [] } = body || {};
        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: "questions required" }, { status: 400 });
        }

        let score = 0;
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const a = answers[i];
            if (a && a.selectedIdx === q.answer) score += 1;
        }

        const values = {
            userId: user.id,
            interviewId: interviewId || null,
            agentId: agentId || null,
            title: title || "Quiz",
            score,
            total: questions.length,
            questions,
            answers,
        };

        const insert = () =>
            db.insert(traineeQuizAttempts).values(values).returning();

        let row;
        try {
            [row] = await insert();
        } catch (err) {
            const code = err?.code || err?.cause?.code;
            const msg = String(err?.message || "");
            const missingInterviewId =
                code === UNDEFINED_COLUMN && msg.includes("interview_id");
            if (!missingInterviewId) throw err;

            console.warn(
                "[trainee/quiz] interview_id column missing — adding it and retrying. " +
                    "Run drizzle/0013_quiz_interview_id.sql to make this permanent."
            );
            await ensureInterviewIdColumn();
            [row] = await insert();
        }

        return NextResponse.json({ success: true, data: row });
    } catch (e) {
        console.error("Quiz submit error:", e);
        return NextResponse.json(
            { error: "Server Error", details: e.message },
            { status: 500 }
        );
    }
}
