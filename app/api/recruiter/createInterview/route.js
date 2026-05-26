export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { jobPositions, interviewSessions, interviewQuestions, interviewLinks } from '@/lib/db/schemaCharacterAI';
import { auth } from '@/lib/auth';
import { nanoid } from 'nanoid';

// Secure ID generation function
function generateSecureId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
import { eq, and, desc, inArray, sql } from 'drizzle-orm';

// Build the public-facing app URL the candidate's interview link points at.
// Same logic as send-interview-emails: try known env vars, fall back to the
// request's own origin, only use localhost as a last resort. Strip trailing
// slashes so we don't end up with "https://example.com//interview/…".
function getAppBaseUrl(request) {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.BASE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ];
  let base = candidates.find((v) => typeof v === 'string' && v.trim());
  if (!base) {
    const origin = request?.headers?.get?.('origin');
    const host = request?.headers?.get?.('host');
    const proto = request?.headers?.get?.('x-forwarded-proto') || 'https';
    base = origin || (host ? `${proto}://${host}` : null);
  }
  if (!base) base = 'http://localhost:3000';
  return base.trim().replace(/\/+$/, '');
}

// POST - Create new interview position
export async function POST(request) {
  try {
    // Get user session first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    const {
      // Registration Setup Fields
      registrationStartDate,
      registrationEndDate,
      jobPosition,
      requiredExperience,
      language,
      
      // Job Info Fields
      title,
      department,
      description,
      evaluationDescription,
      location,
      employmentType,
      startDate,
      endDate,
      duration,
      questionCount,
      voiceProvider,
      voiceId,
      antiCheatEnabled,
      aiQuestions,
      systemPrompt,
      recruiterId,
      tone,
      agentName,
      price,
      accessType,
      evaluationCriteria,
      candidateEvaluation
    } = body;

    if (!title || !jobPosition || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, jobPosition, description' },
        { status: 400 }
      );
    }

    // For testing purposes, handle recruiterId properly
    // In production, you should validate that the recruiterId exists in the users table
    let finalRecruiterId = recruiterId;
    
    if (!finalRecruiterId || finalRecruiterId === 'test-recruiter' || finalRecruiterId === 'default-recruiter') {
      // Generate a temporary UUID for testing purposes
      // In production, you should create a proper user or validate the recruiterId exists
      finalRecruiterId = 'temp-recruiter-' + Date.now();
    }

    // Create job position
    const [position] = await db.insert(jobPositions).values({
      id: generateSecureId(), // Generate secure 13-character ID
      recruiterId: finalRecruiterId,
      userId: userId || 'default-user',
      title: title, // Use title from form
      department: department || 'Engineering',
      description,
      evaluationDescription: evaluationDescription || '',
      location: location || 'Remote',
      employmentType: employmentType || 'full-time',
      language: language || 'English',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      questionCount: questionCount || 8,
      duration: duration || 30,
      antiCheatEnabled: antiCheatEnabled !== false,
      aiQuestions: aiQuestions || [],
      voiceProvider: voiceProvider || 'vapi',
      voiceId: voiceId || 'monitor',
      systemPrompt: systemPrompt || '',
      agentName: agentName || 'viktor',
      tone: tone || 'Friendly',
      evaluationCriteria: evaluationCriteria || [],
      candidateEvaluation: candidateEvaluation || '',
      price: price || 50,
      accessType: accessType || 'Public (Anyone)',
      status: 'draft',
      // Registration Setup Fields
      registrationStartDate: registrationStartDate ? new Date(registrationStartDate) : null,
      registrationEndDate: registrationEndDate ? new Date(registrationEndDate) : null,
      jobPosition: jobPosition,
      requiredExperience: requiredExperience || 'mid'
    }).returning();

    // Generate interview magic link
    const interviewLinkId = nanoid(12);
    const appBaseUrl = getAppBaseUrl(request);
    const interviewMagicLink = `${appBaseUrl}/interview/${interviewLinkId}`;

    // Create interview link
    const [interviewLink] = await db.insert(interviewLinks).values({
      positionId: position.id,
      linkId: interviewLinkId,
      maxUses: 100, // Default max uses
      currentUses: 0,
      status: 'active'
    }).returning();

    // Generate registration magic link (uses same ID as interview link)
    const registrationMagicLink = `${appBaseUrl}/candidate/${interviewLinkId}`;

    // Return success response with all data needed for frontend
    return NextResponse.json({
      success: true,
      data: {
        position,
        link: interviewLink,
        magicLink: interviewMagicLink,
        linkId: interviewLinkId,
        // Additional fields for frontend
        interviewLink: interviewMagicLink,
        registrationLink: registrationMagicLink,
        positionId: position.id
      }
    });

  } catch (error) {
    console.error('Create Interview Error:', error);
    return NextResponse.json(
      { error: 'Failed to create interview', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch interview positions
//
// Uses raw SQL (sql`…`) instead of Drizzle's column-projection builder. The
// neon-http driver silently returns [] for a many-column projection chained
// with .where() + .orderBy(), which was the root cause of the recruiter
// dashboard showing zero positions even when rows existed.
//
// Ownership predicate matches the recruiter dashboard route: `user_id = X
// OR recruiter_id = X`. Some older rows have attribution split across the
// two columns; filtering on user_id alone hid them from the recruiter that
// actually owns them.

function rowsOf(r) { return r?.rows ?? r ?? []; }

export async function GET(request) {
  try {
    // Get user session first
    const session = await auth.api.getSession({
      headers: request.headers
    });

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const recruiterId = searchParams.get('recruiterId');
    const status = searchParams.get('status');
    const positionId = searchParams.get('positionId');

    const POSITION_COLUMNS = sql`
      id,
      title,
      department,
      description,
      evaluation_description    AS "evaluationDescription",
      location,
      employment_type           AS "employmentType",
      start_date                AS "startDate",
      end_date                  AS "endDate",
      registration_start_date   AS "registrationStartDate",
      registration_end_date     AS "registrationEndDate",
      job_position              AS "jobPosition",
      required_experience       AS "requiredExperience",
      question_count            AS "questionCount",
      duration,
      anti_cheat_enabled        AS "antiCheatEnabled",
      ai_questions              AS "aiQuestions",
      voice_provider            AS "voiceProvider",
      voice_id                  AS "voiceId",
      system_prompt             AS "systemPrompt",
      agent_name                AS "agentName",
      tone,
      price,
      access_type               AS "accessType",
      status,
      evaluation_criteria       AS "evaluationCriteria",
      candidate_evaluation      AS "candidateEvaluation",
      language,
      created_at                AS "createdAt",
      updated_at                AS "updatedAt",
      recruiter_id              AS "recruiterId",
      user_id                   AS "userId"
    `;

    // If positionId is provided, fetch specific position
    if (positionId) {
      const result = await db.execute(sql`
        SELECT ${POSITION_COLUMNS}
        FROM job_positions
        WHERE id = ${positionId}
          AND (user_id = ${userId} OR recruiter_id = ${userId})
        LIMIT 1
      `);
      const position = rowsOf(result)[0];

      if (!position) {
        return NextResponse.json(
          { error: 'Position not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: position
      });
    }

    // Fetch all positions owned by the current user (via either attribution
    // column), optionally narrowed by recruiterId / status filter.
    const ownership = sql`(user_id = ${userId} OR recruiter_id = ${userId})`;
    const recruiterFilter = recruiterId
      ? sql`AND recruiter_id = ${recruiterId}`
      : sql``;
    const statusFilter = status
      ? sql`AND status = ${status}`
      : sql``;

    const result = await db.execute(sql`
      SELECT ${POSITION_COLUMNS}
      FROM job_positions
      WHERE ${ownership}
      ${recruiterFilter}
      ${statusFilter}
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rowsOf(result)
    });

  } catch (error) {
    console.error('Fetch Interviews Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete an interview position
export async function DELETE(request) {
  try {
    // Get user session first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('positionId');

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    // Delete the interview position. Accept either attribution column —
    // some legacy rows have user_id null but recruiter_id set, and the
    // strict user_id-only check was rejecting the rightful owner.
    const deletedPosition = await db
      .delete(jobPositions)
      .where(
        and(
          eq(jobPositions.id, positionId),
          sql`(user_id = ${userId} OR recruiter_id = ${userId})`,
        ),
      )
      .returning();

    if (deletedPosition.length === 0) {
      return NextResponse.json(
        { error: 'Interview position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interview position deleted successfully',
      deletedPosition: deletedPosition[0]
    });

  } catch (error) {
    console.error('Delete Interview Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update editable fields on a position. Used by the Configuration tab
// in the recruiter's per-interview workspace. Only fields the user is allowed
// to edit are accepted; everything else (aiQuestions, evaluationCriteria,
// systemPrompt, etc.) has dedicated routes.
const EDITABLE_FIELDS = new Set([
  'title',
  'department',
  'description',
  'evaluationDescription',
  'location',
  'employmentType',
  'requiredExperience',
  'language',
  'duration',
  'questionCount',
  'antiCheatEnabled',
  'startDate',
  'endDate',
  'registrationStartDate',
  'registrationEndDate',
  'price',
  'accessType',
  'status',
  'tone',
  'candidateEvaluation',
  // Recruiter-editable AI behavior
  'systemPrompt',
  'agentName',
  'voiceProvider',
  'voiceId',
]);

export async function PATCH(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { positionId, ...rest } = body || {};
    if (!positionId) {
      return NextResponse.json({ error: 'positionId is required' }, { status: 400 });
    }

    // Filter to the whitelist + coerce date strings to Date objects
    const dateFields = new Set(['startDate', 'endDate', 'registrationStartDate', 'registrationEndDate']);
    const updates = {};
    for (const [k, v] of Object.entries(rest)) {
      if (!EDITABLE_FIELDS.has(k)) continue;
      if (v === '' || v === undefined) continue;
      if (dateFields.has(k)) {
        updates[k] = v === null ? null : new Date(v);
      } else {
        updates[k] = v;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
    }

    const [updated] = await db
      .update(jobPositions)
      .set(updates)
      .where(
        and(
          eq(jobPositions.id, positionId),
          // Same widened ownership check as GET / DELETE — accept either
          // attribution column so legacy rows still patch correctly.
          sql`(user_id = ${userId} OR recruiter_id = ${userId})`,
        ),
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update Interview Error:', error);
    return NextResponse.json(
      { error: 'Failed to update interview', details: error.message },
      { status: 500 }
    );
  }
}
