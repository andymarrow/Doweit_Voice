export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { eq, sql } from 'drizzle-orm';
import { candidateApplications } from '@/lib/db/schemaCharacterAI';
import { auth } from '@/lib/auth';

// IMPORTANT: This route used to use Drizzle's projection + leftJoin + where +
// orderBy chain. The neon-http driver has a known bug where that combination
// silently returns []. The recruiter dashboard's own route hit the same trap
// and was fixed by switching to raw SQL — we do the same here.
//
// Ownership predicate also widened to `p.user_id = X OR p.recruiter_id = X`
// (same as /api/recruiter/dashboard). Older rows have attribution split
// across the two columns, so the strict `user_id = X` filter was hiding
// candidates from positions that legitimately belong to the recruiter.

const rowsOf = (r) => r?.rows ?? r ?? [];

export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const result = await db.execute(sql`
      SELECT
        a.id,
        a.public_id           AS "publicId",
        a.candidate_name      AS "candidateName",
        a.candidate_email     AS "candidateEmail",
        a.candidate_phone     AS "candidatePhone",
        a.portfolio_url       AS "portfolioUrl",
        a.linkedin_url        AS "linkedinUrl",
        a.experience,
        a.country,
        a.is_rejected         AS "isRejected",
        a.reject_reason       AS "rejectReason",
        a.status,
        a.result,
        a.reason_result       AS "reasonResult",
        a.interview_taken     AS "interviewTaken",
        a.created_at          AS "createdAt",
        a.position_id         AS "positionId",
        p.title               AS "jobTitle",
        p.department          AS "jobDepartment",
        p.location            AS "jobLocation",
        p.employment_type     AS "jobEmploymentType"
      FROM candidate_applications a
      LEFT JOIN job_positions p ON a.position_id = p.id
      WHERE p.user_id = ${userId} OR p.recruiter_id = ${userId}
      ORDER BY a.created_at DESC
    `);

    return NextResponse.json(rowsOf(result));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('id');
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    await db
      .delete(candidateApplications)
      .where(eq(candidateApplications.id, parseInt(candidateId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
  }
}
