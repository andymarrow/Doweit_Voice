export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

// NOTE: this route uses raw db.execute(sql`...`) because drizzle-orm's neon-http
// driver silently returns [] for single-column projections like .select({ count: count() }).
//
// The dashboard's interview-related stats come from `candidate_applications`
// (the table that actually fills up when candidates take a magic-link
// interview). The legacy `interviews` table is only populated by the
// call-agents/Vapi webhook flow and was returning zeros for recruiters who use
// magic links — that's the breakage the recruiter dashboard was hitting.
const firstRow = (r) => (r?.rows ?? r)[0] || {};
const rows = (r) => r?.rows ?? r ?? [];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 1. Total positions owned by this recruiter. Match on either user_id or
    // recruiter_id — older rows have inconsistent attribution and would
    // otherwise look like 0 even when the recruiter clearly has positions.
    const totalPositionsR = await db.execute(
      sql`SELECT COUNT(*)::int AS c FROM job_positions
          WHERE user_id = ${userId} OR recruiter_id = ${userId}`,
    );
    const totalPositions = Number(firstRow(totalPositionsR).c || 0);

    // 2. Total candidate applications across all of this recruiter's positions
    const totalApplicationsR = await db.execute(
      sql`SELECT COUNT(*)::int AS c
          FROM candidate_applications a
          INNER JOIN job_positions p ON a.position_id = p.id
          WHERE (p.user_id = ${userId} OR p.recruiter_id = ${userId})`,
    );
    const totalApplications = Number(firstRow(totalApplicationsR).c || 0);

    // 3. Total interviews actually taken (applications with interview_taken = true)
    const totalInterviewsR = await db.execute(
      sql`SELECT COUNT(*)::int AS c
          FROM candidate_applications a
          INNER JOIN job_positions p ON a.position_id = p.id
          WHERE (p.user_id = ${userId} OR p.recruiter_id = ${userId}) AND a.interview_taken = true`,
    );
    const totalInterviews = Number(firstRow(totalInterviewsR).c || 0);

    // 4. Active positions count
    const activePositionsR = await db.execute(
      sql`SELECT COUNT(*)::int AS c FROM job_positions
          WHERE (user_id = ${userId} OR recruiter_id = ${userId}) AND status = 'active'`,
    );
    const activePositions = Number(firstRow(activePositionsR).c || 0);

    // 5. Applications grouped by status
    const candidatesByStatusR = await db.execute(
      sql`SELECT a.status, COUNT(*)::int AS c
          FROM candidate_applications a
          INNER JOIN job_positions p ON a.position_id = p.id
          WHERE (p.user_id = ${userId} OR p.recruiter_id = ${userId})
          GROUP BY a.status`,
    );
    const candidatesByStatus = rows(candidatesByStatusR).reduce((acc, r) => {
      if (r.status) acc[r.status] = Number(r.c || 0);
      return acc;
    }, {});

    // 6. Interview status counts (derived from interview_taken + pass)
    const completedR = await db.execute(
      sql`SELECT COUNT(*)::int AS c
          FROM candidate_applications a
          INNER JOIN job_positions p ON a.position_id = p.id
          WHERE (p.user_id = ${userId} OR p.recruiter_id = ${userId}) AND a.interview_taken = true`,
    );
    const ongoingR = await db.execute(
      sql`SELECT COUNT(*)::int AS c
          FROM candidate_applications a
          INNER JOIN job_positions p ON a.position_id = p.id
          WHERE (p.user_id = ${userId} OR p.recruiter_id = ${userId}) AND a.status = 'interviewing'`,
    );
    const interviewsByStatus = {
      completed: Number(firstRow(completedR).c || 0),
      ongoing: Number(firstRow(ongoingR).c || 0),
      pending: 0,
    };

    // 7. Average fit score — pull from candidate_applications.result JSONB.
    // result is an array of { criterion, score, ... }; sum scores per row.
    const scoreRowsR = await db.execute(
      sql`SELECT a.result
          FROM candidate_applications a
          INNER JOIN job_positions p ON a.position_id = p.id
          WHERE (p.user_id = ${userId} OR p.recruiter_id = ${userId})
            AND a.interview_taken = true
            AND a.result IS NOT NULL`,
    );
    const scores = rows(scoreRowsR)
      .map((row) => {
        const arr = Array.isArray(row.result) ? row.result : [];
        return arr.reduce((sum, c) => sum + (Number(c?.score) || 0), 0);
      })
      .filter((s) => s > 0);
    const avgFitScore = scores.length
      ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
      : 0;

    // 8. Recent activity (last 7 days) — interview-taken applications
    const recentActivityR = await db.execute(
      sql`SELECT a.created_at
          FROM candidate_applications a
          INNER JOIN job_positions p ON a.position_id = p.id
          WHERE (p.user_id = ${userId} OR p.recruiter_id = ${userId})
            AND a.created_at >= NOW() - INTERVAL '7 days'
          ORDER BY a.created_at ASC
          LIMIT 50`,
    );
    const recentActivity = rows(recentActivityR).map((r) => ({
      createdAt: r.created_at,
    }));

    // 9. Top positions by average score — aggregate from result JSONB
    const topRowsR = await db.execute(
      sql`SELECT p.id, p.title, a.result
          FROM candidate_applications a
          INNER JOIN job_positions p ON a.position_id = p.id
          WHERE (p.user_id = ${userId} OR p.recruiter_id = ${userId})
            AND a.interview_taken = true
            AND a.result IS NOT NULL`,
    );
    const grouped = {};
    rows(topRowsR).forEach((row) => {
      const arr = Array.isArray(row.result) ? row.result : [];
      const total = arr.reduce((s, c) => s + (Number(c?.score) || 0), 0);
      if (total <= 0) return;
      if (!grouped[row.id]) grouped[row.id] = { title: row.title, scores: [] };
      grouped[row.id].scores.push(total);
    });
    const topPositions = Object.values(grouped)
      .map((g) => ({
        title: g.title,
        averageScore: Math.round(g.scores.reduce((s, n) => s + n, 0) / g.scores.length),
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    // 10. Non-rejected candidates
    const activeCandidatesR = await db.execute(
      sql`SELECT COUNT(*)::int AS c
          FROM candidate_applications a
          INNER JOIN job_positions p ON a.position_id = p.id
          WHERE (p.user_id = ${userId} OR p.recruiter_id = ${userId}) AND a.is_rejected = false`,
    );
    const activeCandidates = Number(firstRow(activeCandidatesR).c || 0);

    const dashboardData = {
      overview: {
        totalPositions,
        totalApplications,
        averageFitScore: avgFitScore,
        totalInterviews,
      },
      positions: {
        active: activePositions,
      },
      applications: {
        interviewing: candidatesByStatus.interviewing || 0,
        hired: candidatesByStatus.hired || 0,
        offered: candidatesByStatus.offered || 0,
        screening: candidatesByStatus.screening || 0,
        applied: candidatesByStatus.applied || 0,
        rejected: candidatesByStatus.rejected || 0,
      },
      interviews: interviewsByStatus,
      activeCandidates,
      conversionRates: {
        applicationToInterview:
          totalApplications > 0
            ? Math.round((totalInterviews / totalApplications) * 100)
            : 0,
        interviewToHire:
          totalInterviews > 0
            ? Math.round(((candidatesByStatus.hired || 0) / totalInterviews) * 100)
            : 0,
      },
      recentActivity,
      topPositions,
    };

    // Explicit no-store header: dynamic = 'force-dynamic' keeps Next.js from
    // caching the route handler, but it does NOT add response headers that
    // tell the browser to skip its own HTTP cache. Without these the recruiter
    // saw a stale "Total Positions: N" after deleting rows.
    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
