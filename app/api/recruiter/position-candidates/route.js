export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { desc, eq, and } from 'drizzle-orm';
import { candidateApplications, jobPositions } from '@/lib/db/schemaCharacterAI';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('positionId');
    if (!positionId) {
      return NextResponse.json({ error: 'positionId is required' }, { status: 400 });
    }

    const [position] = await db
      .select({ id: jobPositions.id })
      .from(jobPositions)
      .where(and(eq(jobPositions.id, positionId), eq(jobPositions.userId, userId)));

    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    const candidates = await db
      .select({
        id: candidateApplications.id,
        publicId: candidateApplications.publicId,
        candidateName: candidateApplications.candidateName,
        candidateEmail: candidateApplications.candidateEmail,
        candidatePhone: candidateApplications.candidatePhone,
        portfolioUrl: candidateApplications.portfolioUrl,
        linkedinUrl: candidateApplications.linkedinUrl,
        experience: candidateApplications.experience,
        country: candidateApplications.country,
        address: candidateApplications.address,
        cv: candidateApplications.cv,
        isRejected: candidateApplications.isRejected,
        rejectReason: candidateApplications.rejectReason,
        status: candidateApplications.status,
        result: candidateApplications.result,
        reasonResult: candidateApplications.reasonResult,
        interviewTaken: candidateApplications.interviewTaken,
        createdAt: candidateApplications.createdAt,
        positionId: candidateApplications.positionId,
      })
      .from(candidateApplications)
      .where(eq(candidateApplications.positionId, positionId))
      .orderBy(desc(candidateApplications.createdAt));

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('Error fetching position candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
