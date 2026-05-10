export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { desc, eq, inArray } from 'drizzle-orm';
import { jobPositions, interviewLinks } from '@/lib/db/schemaCharacterAI';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch all positions for the current user
    const positions = await db
      .select({
        id: jobPositions.id,
        title: jobPositions.title,
        department: jobPositions.department,
        description: jobPositions.description,
        location: jobPositions.location,
        employmentType: jobPositions.employmentType,
        language: jobPositions.language,
        duration: jobPositions.duration,
        questionCount: jobPositions.questionCount,
        status: jobPositions.status,
        accessType: jobPositions.accessType,
        requiredExperience: jobPositions.requiredExperience,
        jobPosition: jobPositions.jobPosition,
        voiceProvider: jobPositions.voiceProvider,
        tone: jobPositions.tone,
        antiCheatEnabled: jobPositions.antiCheatEnabled,
        evaluationCriteria: jobPositions.evaluationCriteria,
        startDate: jobPositions.startDate,
        endDate: jobPositions.endDate,
        registrationStartDate: jobPositions.registrationStartDate,
        registrationEndDate: jobPositions.registrationEndDate,
        price: jobPositions.price,
        createdAt: jobPositions.createdAt,
      })
      .from(jobPositions)
      .where(eq(jobPositions.userId, userId))
      .orderBy(desc(jobPositions.createdAt));

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
