import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { eq, and, count, sum, sql } from 'drizzle-orm';
import { 
  jobPositions, 
  candidateApplications, 
  interviews,
  users 
} from '@/lib/db/schemaCharacterAI';

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

    // 1. Total positions - fetch all job positions by userId
    const totalPositionsResult = await db
      .select({ count: count() })
      .from(jobPositions)
      .where(eq(jobPositions.userId, userId));

    const totalPositions = totalPositionsResult[0]?.count || 0;

    // 2. Total applications - fetch all candidates from candidateApplications table
    const totalApplicationsResult = await db
      .select({ count: count() })
      .from(candidateApplications)
      .leftJoin(jobPositions, eq(candidateApplications.positionId, jobPositions.id))
      .where(eq(jobPositions.userId, userId));

    const totalApplications = totalApplicationsResult[0]?.count || 0;

    // 3. Total interviews - fetch interviews related to candidate applications
    // First get all position IDs for this user
    const userPositionsResult = await db
      .select({ id: jobPositions.id })
      .from(jobPositions)
      .where(eq(jobPositions.userId, userId));

    const userPositionIds = userPositionsResult.map(pos => pos.id);

    let totalInterviews = 0;
    if (userPositionIds.length > 0) {
      // Get interviews that are related to these positions
      const totalInterviewsResult = await db
        .select({ count: count() })
        .from(interviews)
        .where(
          sql`${interviews.positionId} IN (${sql.join(userPositionIds, sql`,`)})`
        );

      totalInterviews = totalInterviewsResult[0]?.count || 0;
    }

    // 4. Active positions count
    const activePositionsResult = await db
      .select({ count: count() })
      .from(jobPositions)
      .where(and(
        eq(jobPositions.userId, userId),
        eq(jobPositions.status, 'active')
      ));

    const activePositions = activePositionsResult[0]?.count || 0;

    // 5. Candidates by status
    const candidatesByStatusResult = await db
      .select({
        status: candidateApplications.status,
        count: count()
      })
      .from(candidateApplications)
      .leftJoin(jobPositions, eq(candidateApplications.positionId, jobPositions.id))
      .where(eq(jobPositions.userId, userId))
      .groupBy(candidateApplications.status);

    const candidatesByStatus = candidatesByStatusResult.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {});

    // 6. Interview status counts
    let interviewsByStatus = {};
    if (userPositionIds.length > 0) {
      const interviewsByStatusResult = await db
        .select({
          status: interviews.status,
          count: count()
        })
        .from(interviews)
        .where(
          sql`${interviews.positionId} IN (${sql.join(userPositionIds, sql`,`)})`
        )
        .groupBy(interviews.status);

      interviewsByStatus = interviewsByStatusResult.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {});
    }

    // 7. Average fit score
    let avgFitScore = 0;
    if (userPositionIds.length > 0) {
      const avgFitScoreResult = await db
        .select({
          avgScore: sql`AVG(${interviews.fitScore})`.mapWith(Number)
        })
        .from(interviews)
        .where(
          sql`${interviews.positionId} IN (${sql.join(userPositionIds, sql`,`)}) AND ${interviews.fitScore} IS NOT NULL`
        );

      avgFitScore = Math.round(avgFitScoreResult[0]?.avgScore || 0);
    }

    // 8. Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let recentActivity = [];
    if (userPositionIds.length > 0) {
      const recentActivityResult = await db
        .select({
          createdAt: interviews.createdAt
        })
        .from(interviews)
        .where(
          sql`${interviews.positionId} IN (${sql.join(userPositionIds, sql`,`)}) AND ${interviews.createdAt} >= ${sevenDaysAgo}`
        )
        .orderBy(interviews.createdAt)
        .limit(50);

      recentActivity = recentActivityResult;
    }

    // 9. Top positions by average score
    let topPositions = [];
    if (userPositionIds.length > 0) {
      const topPositionsResult = await db
        .select({
          title: jobPositions.title,
          avgScore: sql`AVG(${interviews.fitScore})`.mapWith(Number)
        })
        .from(jobPositions)
        .leftJoin(interviews, eq(jobPositions.id, interviews.positionId))
        .where(
          and(
            eq(jobPositions.userId, userId),
            sql`${interviews.fitScore} IS NOT NULL`
          )
        )
        .groupBy(jobPositions.id, jobPositions.title)
        .orderBy(sql`AVG(${interviews.fitScore}) DESC`)
        .limit(5);

      topPositions = topPositionsResult.map(pos => ({
        title: pos.title,
        averageScore: Math.round(pos.avgScore || 0)
      }));
    }

    // 10. Candidates who are not rejected (is_rejected = false)
    const activeCandidatesResult = await db
      .select({ count: count() })
      .from(candidateApplications)
      .leftJoin(jobPositions, eq(candidateApplications.positionId, jobPositions.id))
      .where(
        and(
          eq(jobPositions.userId, userId),
          eq(candidateApplications.isRejected, false)
        )
      );

    const activeCandidates = activeCandidatesResult[0]?.count || 0;

    const dashboardData = {
      overview: {
        totalPositions,
        totalApplications,
        averageFitScore: avgFitScore,
        totalInterviews
      },
      positions: {
        active: activePositions
      },
      applications: {
        interviewing: candidatesByStatus.interviewing || 0,
        hired: candidatesByStatus.hired || 0,
        offered: candidatesByStatus.offered || 0,
        screening: candidatesByStatus.screening || 0,
        applied: candidatesByStatus.applied || 0,
        rejected: candidatesByStatus.rejected || 0
      },
      interviews: {
        completed: interviewsByStatus.completed || 0,
        ongoing: interviewsByStatus.ongoing || 0,
        pending: interviewsByStatus.pending || 0
      },
      activeCandidates, // Non-rejected candidates
      conversionRates: {
        applicationToInterview: totalApplications > 0 ? Math.round((totalInterviews / totalApplications) * 100) : 0,
        interviewToHire: totalInterviews > 0 ? Math.round(((candidatesByStatus.hired || 0) / totalInterviews) * 100) : 0
      },
      recentActivity,
      topPositions
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
