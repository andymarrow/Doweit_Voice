export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { jobPositions, interviewLinks } from '@/lib/db/schemaCharacterAI';
import { auth } from '@/lib/auth';

const rowsOf = (r) => r?.rows ?? r ?? [];

export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Raw SQL (same fix pattern as the dashboard / createInterview / applications
    // routes). Drizzle's neon-http driver silently returns [] for many-column
    // projection + .where() + .orderBy(). Ownership predicate also widened to
    // accept either user_id or recruiter_id for legacy rows.
    const positionsResult = await db.execute(sql`
      SELECT
        id,
        title,
        department,
        description,
        location,
        employment_type           AS "employmentType",
        language,
        duration,
        question_count            AS "questionCount",
        status,
        access_type               AS "accessType",
        required_experience       AS "requiredExperience",
        job_position              AS "jobPosition",
        voice_provider            AS "voiceProvider",
        tone,
        anti_cheat_enabled        AS "antiCheatEnabled",
        evaluation_criteria       AS "evaluationCriteria",
        start_date                AS "startDate",
        end_date                  AS "endDate",
        registration_start_date   AS "registrationStartDate",
        registration_end_date     AS "registrationEndDate",
        price,
        created_at                AS "createdAt"
      FROM job_positions
      WHERE user_id = ${userId} OR recruiter_id = ${userId}
      ORDER BY created_at DESC
    `);
    const positions = rowsOf(positionsResult);

    if (positions.length === 0) {
      return NextResponse.json({ positions: [] });
    }

    // Get interview counts per position
    const positionIds = positions.map(p => p.id);

    // Get interview links for each position
    const links = await db
      .select({
        positionId: interviewLinks.positionId,
        linkId: interviewLinks.linkId,
      })
      .from(interviewLinks)
      .where(inArray(interviewLinks.positionId, positionIds));

    const linkMap = links.reduce((acc, l) => {
      if (!acc[l.positionId]) acc[l.positionId] = l.linkId;
      return acc;
    }, {});

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const enriched = positions.map(p => ({
      ...p,
      magicLink: linkMap[p.id] ? `${appUrl}/interview/${linkMap[p.id]}` : null,
      linkId: linkMap[p.id] || null,
    }));

    return NextResponse.json({ positions: enriched });
  } catch (error) {
    console.error('Library route error:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}
