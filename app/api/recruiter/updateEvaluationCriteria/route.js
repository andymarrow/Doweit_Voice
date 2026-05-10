import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { jobPositions } from '@/lib/db/schemaCharacterAI';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { positionId, evaluationCriteria, evaluationDescription } = await request.json();

    // Validate input
    if (!positionId || !evaluationCriteria || !Array.isArray(evaluationCriteria)) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Update the job position with new evaluation criteria and evaluation description
    const updatedPosition = await db
      .update(jobPositions)
      .set({ 
        evaluationCriteria,
        ...(evaluationDescription !== undefined && { candidateEvaluation: evaluationDescription })
      })
      .where(eq(jobPositions.id, positionId))
      .returning();

    if (updatedPosition.length === 0) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Evaluation criteria updated successfully',
      data: updatedPosition[0]
    });

  } catch (error) {
    console.error('Error updating evaluation criteria:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
