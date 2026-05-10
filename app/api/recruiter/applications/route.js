export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { desc, eq } from 'drizzle-orm';
import { candidateApplications, jobPositions } from '@/lib/db/schemaCharacterAI';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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
        isRejected: candidateApplications.isRejected,
        rejectReason: candidateApplications.rejectReason,
        status: candidateApplications.status,
        result: candidateApplications.result,
        reasonResult: candidateApplications.reasonResult,
        interviewTaken: candidateApplications.interviewTaken,
        createdAt: candidateApplications.createdAt,
        positionId: candidateApplications.positionId,
        jobTitle: jobPositions.title,
        jobDepartment: jobPositions.department,
        jobLocation: jobPositions.location,
        jobEmploymentType: jobPositions.employmentType,
      })
      .from(candidateApplications)
      .leftJoin(jobPositions, eq(candidateApplications.positionId, jobPositions.id))
      .where(eq(jobPositions.userId, userId))
      .orderBy(desc(candidateApplications.createdAt));

    return NextResponse.json(candidates);
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
