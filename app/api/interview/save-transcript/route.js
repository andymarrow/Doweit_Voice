export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { eq } from 'drizzle-orm';
import { candidateApplications, jobPositions } from '@/lib/db/schemaCharacterAI';
import { logRecruiterActivity } from '@/lib/recruitment/activityLog';

export async function POST(request) {
  try {
    const body = await request.json();
    const { candidateId, interviewData, transcript, callData } = body;

    console.log('Saving interview transcript:', { candidateId, transcriptLength: transcript?.length });

    if (!candidateId || !interviewData) {
      return NextResponse.json(
        { error: 'Candidate ID and interview data are required' },
        { status: 400 }
      );
    }

    // Update the candidate's interview data and mark interview as taken
    const updatedCandidate = await db
      .update(candidateApplications)
      .set({
        candidateInterview: interviewData,
        interviewTaken: true, // Mark interview as taken
        updatedAt: new Date(),
      })
      .where(eq(candidateApplications.publicId, candidateId)) // Use publicId to find candidate
      .returning();

    if (updatedCandidate.length === 0) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Fire-and-forget: log "interview_taken" for the recruiter feed.
    const cand = updatedCandidate[0];
    if (cand?.positionId) {
      (async () => {
        try {
          const [position] = await db
            .select({ userId: jobPositions.userId, title: jobPositions.title })
            .from(jobPositions)
            .where(eq(jobPositions.id, cand.positionId))
            .limit(1);
          if (position?.userId) {
            await logRecruiterActivity({
              recruiterId: position.userId,
              type: 'interview_taken',
              positionId: cand.positionId,
              applicationId: cand.id,
              candidateName: cand.candidateName,
              candidateEmail: cand.candidateEmail,
              positionTitle: position.title,
            });
          }
        } catch (e) {
          console.error('[activityLog] interview_taken:', e);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: 'Interview transcript saved successfully',
      candidateId,
      transcriptLength: interviewData.length,
      updatedCandidate: updatedCandidate[0]
    });

  } catch (error) {
    console.error('Error saving interview transcript:', error);
    return NextResponse.json(
      { error: 'Failed to save interview transcript' },
      { status: 500 }
    );
  }
}
