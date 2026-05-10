// app/api/trainee/sessions/route.js
// Lists the current trainee's interviews with attempt counts and best scores
// derived from the JSONB result column. Powers the MySessions page.
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/database";
import { traineeInterviews } from "@/lib/db/schemaCharacterAI";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const rows = await db
            .select()
            .from(traineeInterviews)
            .where(eq(traineeInterviews.userId, user.id))
            .orderBy(desc(traineeInterviews.updatedAt));

        const list = rows.map((r) => {
            const results = r.results || {};
            const attemptIds = Object.keys(results);
            const scores = attemptIds
                .map((k) => results[k]?.general?.fitScore)
                .filter((n) => typeof n === "number");
            const bestScore = scores.length ? Math.max(...scores) : null;
            const lastAttemptId = attemptIds.length ? attemptIds[attemptIds.length - 1] : null;
            // Brief list of attempts so the UI can let trainees re-open any
            // past attempt, not just the most recent one.
            const attemptList = attemptIds.map((k) => ({
                attemptId: k,
                fitScore: results[k]?.general?.fitScore ?? null,
                takenAt: r.transcripts?.[k]?.endedAt || r.transcripts?.[k]?.startedAt || null,
            }));
            return {
                id: r.id,
                title: r.title,
                department: r.department,
                experienceLevel: r.experienceLevel,
                language: r.language,
                duration: r.duration,
                questionCount: r.questionCount,
                status: r.status,
                attempts: attemptIds.length,
                attemptList,
                bestScore,
                lastAttemptId,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
            };
        });

        return NextResponse.json({ success: true, data: list });
    } catch (error) {
        console.error("Trainee sessions error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
