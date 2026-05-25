// app/api/admin/trainee/route.js
// Dedicated admin metrics for the Trainee surface.
//
// Returns:
//   totals: { interviews, attempts, quizzes, quizAvg, trainees, avgFitScore }
//   topTrainees: [{ userId, name, email, interviewCount, attemptCount,
//                   bestScore }]
//   recentInterviews: [{ id, title, department, userName, attempts,
//                        bestScore, createdAt }]
//   recentQuizzes: [{ id, title, userName, score, total, createdAt }]
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const firstRow = (r) => (r?.rows ?? r)[0] || {};
const rowsOf = (r) => r?.rows ?? r ?? [];

// Walk a trainee_interviews.results JSONB and return the array of
// per-attempt fit scores recorded inside.
function fitScoresFrom(results) {
  if (!results || typeof results !== 'object') return [];
  return Object.values(results)
    .map((r) => r?.general?.fitScore)
    .filter((n) => typeof n === 'number');
}

export async function GET() {
  try {
    // ── All trainee interviews (we'll flatten attempts in JS) ─────────────
    const interviewsR = await db.execute(
      sql`SELECT id, user_id, title, department, results, created_at, updated_at
          FROM trainee_interviews`,
    );
    const interviews = rowsOf(interviewsR);

    let totalAttempts = 0;
    const allScores = [];
    const perUser = new Map(); // userId -> { interviews, attempts, bestScore }

    for (const iv of interviews) {
      const scores = fitScoresFrom(iv.results);
      totalAttempts += scores.length;
      allScores.push(...scores);

      const cur = perUser.get(iv.user_id) || {
        interviews: 0,
        attempts: 0,
        bestScore: null,
      };
      cur.interviews += 1;
      cur.attempts += scores.length;
      const localBest = scores.length ? Math.max(...scores) : null;
      if (localBest != null && (cur.bestScore == null || localBest > cur.bestScore)) {
        cur.bestScore = localBest;
      }
      perUser.set(iv.user_id, cur);
    }

    const avgFitScore = allScores.length
      ? Math.round(allScores.reduce((s, n) => s + n, 0) / allScores.length)
      : 0;

    // Hydrate trainee names + emails for the per-user map
    const userIds = Array.from(perUser.keys()).filter(Boolean);
    let userMap = {};
    if (userIds.length > 0) {
      const ids = userIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(',');
      const usersR = await db.execute(
        sql.raw(`SELECT id, name, email FROM users WHERE id IN (${ids})`),
      );
      userMap = rowsOf(usersR).reduce((m, u) => {
        m[u.id] = { name: u.name, email: u.email };
        return m;
      }, {});
    }

    const topTrainees = Array.from(perUser.entries())
      .map(([userId, v]) => ({
        userId,
        name: userMap[userId]?.name || 'Unknown',
        email: userMap[userId]?.email || userId,
        interviewCount: v.interviews,
        attemptCount: v.attempts,
        bestScore: v.bestScore,
      }))
      .sort((a, b) => (b.attemptCount || 0) - (a.attemptCount || 0))
      .slice(0, 10);

    // ── Quizzes ───────────────────────────────────────────────────────────
    const quizzesR = await db.execute(
      sql`SELECT q.id, q.user_id, q.title, q.score, q.total, q.created_at,
                 u.name AS user_name
          FROM trainee_quiz_attempts q
          LEFT JOIN users u ON u.id = q.user_id
          ORDER BY q.created_at DESC
          LIMIT 50`,
    );
    const allQuizzes = rowsOf(quizzesR);
    const quizzes = allQuizzes.map((q) => ({
      id: q.id,
      title: q.title,
      userName: q.user_name || 'Unknown',
      score: Number(q.score || 0),
      total: Number(q.total || 0),
      createdAt: q.created_at,
    }));

    const quizAvg = quizzes.length
      ? Math.round(
          quizzes.reduce(
            (s, q) => s + (q.total ? (q.score / q.total) * 100 : 0),
            0,
          ) / quizzes.length,
        )
      : 0;

    // ── Recent interviews (latest 20 with attempt counts) ─────────────────
    const recentInterviews = interviews
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 20)
      .map((iv) => {
        const scores = fitScoresFrom(iv.results);
        return {
          id: iv.id,
          title: iv.title,
          department: iv.department,
          userName: userMap[iv.user_id]?.name || 'Unknown',
          userEmail: userMap[iv.user_id]?.email || iv.user_id,
          attempts: scores.length,
          bestScore: scores.length ? Math.max(...scores) : null,
          createdAt: iv.created_at,
        };
      });

    return NextResponse.json({
      totals: {
        interviews: interviews.length,
        attempts: totalAttempts,
        quizzes: allQuizzes.length,
        quizAvg,
        trainees: perUser.size,
        avgFitScore,
      },
      topTrainees,
      recentInterviews,
      recentQuizzes: quizzes.slice(0, 20),
    });
  } catch (error) {
    console.error('Admin trainee metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to load trainee metrics', details: error.message },
      { status: 500 },
    );
  }
}
