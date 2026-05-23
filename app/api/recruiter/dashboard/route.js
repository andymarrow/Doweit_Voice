export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

// NOTE: this route uses raw db.execute(sql`...`) instead of the typed
// query builder because drizzle-orm's neon-http driver has a bug where
// single-column projections (e.g. .select({ count: count() })) silently
// return [] from the database. See diag work in commit history.
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

    // 1. Total positions
    const totalPositionsR = await db.execute(
      sql`SELECT COUNT(*)::int AS c FROM job_positions WHERE user_id = ${userId}`,
    );
    const totalPositions = Number(firstRow(totalPositionsR).c || 0);

    // 2. Total applications (joined to positions owned by user)
    const totalApplicationsR = await db.execute(
      sql`SELECT COUNT(*)::int AS c
          FROM candidate_applications a
          LEFT JOIN job_positions p ON a.position_id = p.id
          WHERE p.user_id = ${userId}`,
    );
    const totalApplications = Number(firstRow(totalApplicationsR).c || 0);

    // 3. Total interviews on this user's positions
    const totalInterviewsR = await db.execute(
      sql`SELECT COUNT(*)::int AS c FROM interviews
          WHERE position_id IN (SELECT id FROM job_positions WHERE user_id = ${userId})`,
    );
    const totalInterviews = Number(firstRow(totalInterviewsR).c || 0);

    // 4. Active positions count
    const activePositionsR = await db.execute(
      sql`SELECT COUNT(*)::int AS c FROM job_positions
          WHERE user_id = ${userId} AND status = 'active'`,
    );
    const activePositions = Number(firstRow(activePositionsR).c || 0);

    // 5. Candidates by status
    const candidatesByStatusR = await db.execute(
      sql`SELECT a.status, COUNT(*)::int AS c
          FROM candidate_applications a
          LEFT JOIN job_positions p ON a.position_id = p.id
          WHERE p.user_id = ${userId}
          GROUP BY a.status`,
    );
    const candidatesByStatus = rows(candidatesByStatusR).reduce((acc, r) => {
      if (r.status) acc[r.status] = Number(r.c || 0);
      return acc;
    }, {});

    // 6. Interview status counts
    const interviewsByStatusR = await db.execute(
      sql`SELECT i.status, COUNT(*)::int AS c
          FROM interviews i
          WHERE i.position_id IN (SELECT id FROM job_positions WHERE user_id = ${userId})
          GROUP BY i.status`,
    );
    const interviewsByStatus = rows(interviewsByStatusR).reduce((acc, r) => {
      if (r.status) acc[r.status] = Number(r.c || 0);
      return acc;
    }, {});

    // 7. Average fit score
    const avgFitScoreR = await db.execute(
      sql`SELECT AVG(fit_score)::float AS avg
          FROM interviews
          WHERE fit_score IS NOT NULL
            AND position_id IN (SELECT id FROM job_positions WHERE user_id = ${userId})`,
    );
    const avgFitScore = Math.round(firstRow(avgFitScoreR).avg || 0);

    // 8. Recent activity (last 7 days, interview rows)
    const recentActivityR = await db.execute(
      sql`SELECT created_at
          FROM interviews
          WHERE position_id IN (SELECT id FROM job_positions WHERE user_id = ${userId})
            AND created_at >= NOW() - INTERVAL '7 days'
          ORDER BY created_at ASC
          LIMIT 50`,
    );
    const recentActivity = rows(recentActivityR).map((r) => ({
      createdAt: r.created_at,
    }));

    // 9. Top positions by average score
    const topPositionsR = await db.execute(
      sql`SELECT p.title, AVG(i.fit_score)::float AS avg_score
          FROM job_positions p
          LEFT JOIN interviews i ON p.id = i.position_id
          WHERE p.user_id = ${userId} AND i.fit_score IS NOT NULL
          GROUP BY p.id, p.title
          ORDER BY AVG(i.fit_score) DESC
          LIMIT 5`,
    );
    const topPositions = rows(topPositionsR).map((r) => ({
      title: r.title,
      averageScore: Math.round(r.avg_score || 0),
    }));

    // 10. Candidates who are not rejected
    const activeCandidatesR = await db.execute(
      sql`SELECT COUNT(*)::int AS c
          FROM candidate_applications a
          LEFT JOIN job_positions p ON a.position_id = p.id
          WHERE p.user_id = ${userId} AND a.is_rejected = false`,
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
      interviews: {
        completed: interviewsByStatus.completed || 0,
        ongoing: interviewsByStatus.ongoing || 0,
        pending: interviewsByStatus.pending || 0,
      },
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

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
