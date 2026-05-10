import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { eq } from 'drizzle-orm';
import { jobPositions } from '@/lib/db/schemaCharacterAI';

export async function POST(request) {
  try {
    const body = await request.json();
    const { positionId, evaluationMethod, selectedCandidates } = body;

    console.log('Shortlist API called with:', { positionId, evaluationMethod, selectedCandidates });

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    if (!evaluationMethod || !evaluationMethod.trim()) {
      return NextResponse.json(
        { error: 'Evaluation method is required' },
        { status: 400 }
      );
    }

    // Check if position exists
    const position = await db
      .select({
        id: jobPositions.id,
        title: jobPositions.title,
        candidateEvaluation: jobPositions.candidateEvaluation,
      })
      .from(jobPositions)
      .where(eq(jobPositions.id, positionId))
      .limit(1);

    if (position.length === 0) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Store only the plain text evaluation method
    const updatedPosition = await db
      .update(jobPositions)
      .set({
        candidateEvaluation: evaluationMethod.trim(),
        updatedAt: new Date(),
      })
      .where(eq(jobPositions.id, positionId))
      .returning();

    console.log('Evaluation data saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Evaluation method saved successfully',
      evaluationData: evaluationMethod.trim(),
      position: updatedPosition[0],
    });

  } catch (error) {
    console.error('Error saving evaluation data:', error);
    return NextResponse.json(
      { error: 'Failed to save evaluation data' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('positionId');

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    // Get position with evaluation data
    const position = await db
      .select({
        id: jobPositions.id,
        title: jobPositions.title,
        candidateEvaluation: jobPositions.candidateEvaluation,
      })
      .from(jobPositions)
      .where(eq(jobPositions.id, positionId))
      .limit(1);

    if (position.length === 0) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Return plain text evaluation data
    return NextResponse.json({
      success: true,
      position: position[0],
      evaluationData: position[0].candidateEvaluation,
    });

  } catch (error) {
    console.error('Error fetching evaluation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation data' },
      { status: 500 }
    );
  }
}
