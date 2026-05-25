// app/api/admin/recruiter/route.js
// Dedicated admin metrics for the Recruiter surface. Pulls real numbers from
// job_positions + candidate_applications (NOT the legacy interviews table,
// which is empty for the magic-link flow).
//
// Returns:
//   totals: { positions, activePositions, draftPositions, recruiters,
//             applications, interviewsTaken, avgFitScore }
//   topRecruiters: [{ userId, name, email, positionCount, applicationCount,
//                     interviewCount }]
//   recentPositions: [{ id, title, department, status, sellerName,
//                       createdAt, applicationCount }]
//   recentApplications: [{ id, candidateName, candidateEmail, jobTitle,
//                          status, fitScore, createdAt }]
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const firstRow = (r) => (r?.rows ?? r)[0] || {};
const rowsOf = (r) => r?.rows ?? r ?? [];

export async function GET() {
  try {
    // ── Totals ────────────────────────────────────────────────────────────
    const positionsR = await db.execute(
      sql`SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'active')::int AS active,
            COUNT(*) FILTER (WHERE status = 'draft')::int  AS draft,
            COUNT(DISTINCT COALESCE(user_id, recruiter_id))::int AS recruiters
          FROM job_positions`,
    );
    const pT = firstRow(positionsR);

    const appsR = await db.execute(
      sql`SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE interview_taken = true)::int AS taken
          FROM candidate_applications`,
    );
    const aT = firstRow(appsR);

    // Avg fit score across every scored application (sum of result[*].score)
    const scoreR = await db.execute(
      sql`SELECT result FROM candidate_applications
          WHERE interview_taken = true AND result IS NOT NULL`,
    );
    const scoreTotals = rowsOf(scoreR)
      .map((row) => {
        const arr = Array.isArray(row.result) ? row.result : [];
        return arr.reduce((s, c) => s + (Number(c?.score) || 0), 0);
      })
      .filter((n) => n > 0);
    const avgFitScore = scoreTotals.length
      ? Math.round(scoreTotals.reduce((s, n) => s + n, 0) / scoreTotals.length)
      : 0;

    // ── Top recruiters ────────────────────────────────────────────────────
    const topR = await db.execute(
      sql`SELECT
            COALESCE(p.user_id, p.recruiter_id) AS user_id,
            u.name,
            u.email,
            COUNT(DISTINCT p.id)::int AS position_count,
            COUNT(a.id)::int          AS application_count,
            COUNT(*) FILTER (WHERE a.interview_taken = true)::int AS interview_count
          FROM job_positions p
          LEFT JOIN candidate_applications a ON a.position_id = p.id
          LEFT JOIN users u ON u.id = COALESCE(p.user_id, p.recruiter_id)
          WHERE COALESCE(p.user_id, p.recruiter_id) IS NOT NULL
          GROUP BY COALESCE(p.user_id, p.recruiter_id), u.name, u.email
          ORDER BY position_count DESC
          LIMIT 10`,
    );
    const topRecruiters = rowsOf(topR).map((r) => ({
      userId: r.user_id,
      name: r.name || 'Unknown',
      email: r.email || r.user_id,
      positionCount: Number(r.position_count || 0),
      applicationCount: Number(r.application_count || 0),
      interviewCount: Number(r.interview_count || 0),
    }));

    // ── Recent positions ──────────────────────────────────────────────────
    const recentPR = await db.execute(
      sql`SELECT
            p.id,
            p.title,
            p.department,
            p.status,
            p.created_at,
            u.name AS seller_name,
            COUNT(a.id)::int AS application_count
          FROM job_positions p
          LEFT JOIN users u ON u.id = COALESCE(p.user_id, p.recruiter_id)
          LEFT JOIN candidate_applications a ON a.position_id = p.id
          GROUP BY p.id, p.title, p.department, p.status, p.created_at, u.name
          ORDER BY p.created_at DESC
          LIMIT 20`,
    );
    const recentPositions = rowsOf(recentPR).map((r) => ({
      id: r.id,
      title: r.title,
      department: r.department,
      status: r.status,
      sellerName: r.seller_name || 'Unknown',
      applicationCount: Number(r.application_count || 0),
      createdAt: r.created_at,
    }));

    // ── Recent applications ───────────────────────────────────────────────
    const recentAR = await db.execute(
      sql`SELECT
            a.id,
            a.candidate_name,
            a.candidate_email,
            a.status,
            a.is_rejected,
            a.interview_taken,
            a.result,
            a.created_at,
            p.title AS job_title
          FROM candidate_applications a
          LEFT JOIN job_positions p ON p.id = a.position_id
          ORDER BY a.created_at DESC
          LIMIT 25`,
    );
    const recentApplications = rowsOf(recentAR).map((r) => {
      const arr = Array.isArray(r.result) ? r.result : [];
      const fitScore = arr.reduce((s, c) => s + (Number(c?.score) || 0), 0);
      return {
        id: r.id,
        candidateName: r.candidate_name,
        candidateEmail: r.candidate_email,
        jobTitle: r.job_title || 'Unknown',
        status: r.is_rejected ? 'rejected' : r.status,
        interviewTaken: !!r.interview_taken,
        fitScore: fitScore || null,
        createdAt: r.created_at,
      };
    });

    return NextResponse.json({
      totals: {
        positions: Number(pT.total || 0),
        activePositions: Number(pT.active || 0),
        draftPositions: Number(pT.draft || 0),
        recruiters: Number(pT.recruiters || 0),
        applications: Number(aT.total || 0),
        interviewsTaken: Number(aT.taken || 0),
        avgFitScore,
      },
      topRecruiters,
      recentPositions,
      recentApplications,
    });
  } catch (error) {
    console.error('Admin recruiter metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to load recruiter metrics', details: error.message },
      { status: 500 },
    );
  }
}
