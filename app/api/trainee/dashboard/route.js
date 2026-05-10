// app/api/trainee/dashboard/route.js
// Aggregates the trainee's real data for the dashboard view: total interviews,
// total attempts, average best score, recent attempts, and skill breakdown
// computed from the latest results' specific.skillRadar values.
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/database";
import { traineeInterviews, traineeQuizAttempts } from "@/lib/db/schemaCharacterAI";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Explicit column-select on quizzes — the interview_id column was
        // added in migration 0013; old DBs may still be missing it. Only
        // pulling what the dashboard actually uses keeps this resilient.
        const [interviews, quizzes] = await Promise.all([
            db
                .select()
                .from(traineeInterviews)
                .where(eq(traineeInterviews.userId, user.id))
                .orderBy(desc(traineeInterviews.updatedAt)),
            db
                .select({
                    id: traineeQuizAttempts.id,
                    score: traineeQuizAttempts.score,
                    total: traineeQuizAttempts.total,
                    createdAt: traineeQuizAttempts.createdAt,
                })
                .from(traineeQuizAttempts)
                .where(eq(traineeQuizAttempts.userId, user.id))
                .orderBy(desc(traineeQuizAttempts.createdAt)),
        ]);

        // Flatten all interview attempts so we can compute averages / recents.
        const allAttempts = [];
        for (const iv of interviews) {
            const results = iv.results || {};
            for (const [attemptId, res] of Object.entries(results)) {
                const fit = res?.general?.fitScore;
                if (typeof fit === "number") {
                    allAttempts.push({
                        attemptId,
                        interviewId: iv.id,
                        title: iv.title,
                        score: fit,
                        completedAt: res?.general?.completedAt || iv.updatedAt,
                        skillRadar: res?.specific?.skillRadar || [],
                    });
                }
            }
        }
        allAttempts.sort(
            (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );

        const totalInterviews = interviews.length;
        const totalAttempts = allAttempts.length;
        const avgScore = totalAttempts
            ? Math.round(allAttempts.reduce((s, a) => s + a.score, 0) / totalAttempts)
            : 0;

        // Average each radar subject across all attempts.
        const skillTotals = new Map();
        for (const a of allAttempts) {
            for (const s of a.skillRadar) {
                if (!s?.subject || typeof s?.A !== "number") continue;
                const cur = skillTotals.get(s.subject) || { sum: 0, n: 0 };
                cur.sum += s.A;
                cur.n += 1;
                skillTotals.set(s.subject, cur);
            }
        }
        const skillData = Array.from(skillTotals.entries()).map(([subject, v]) => ({
            subject,
            score: Math.round(v.sum / v.n),
        }));

        const recent = allAttempts.slice(0, 8).map((a) => ({
            interviewId: a.interviewId,
            attemptId: a.attemptId,
            title: a.title,
            score: a.score,
            date: a.completedAt,
        }));

        const quizCount = quizzes.length;
        const quizAvg = quizCount
            ? Math.round(
                  quizzes.reduce(
                      (s, q) => s + (q.total ? (q.score / q.total) * 100 : 0),
                      0
                  ) / quizCount
              )
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                totals: {
                    interviews: totalInterviews,
                    attempts: totalAttempts,
                    avgScore,
                    quizzes: quizCount,
                    quizAvg,
                },
                recent,
                skillData,
            },
        });
    } catch (error) {
        console.error("Trainee dashboard error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
