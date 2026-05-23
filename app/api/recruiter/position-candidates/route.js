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

    // NOTE: must project 2+ columns. Drizzle's neon-http driver silently
    // returns [] for single-column projections.
    const [position] = await db
      .select({ id: jobPositions.id, userId: jobPositions.userId })
      .from(jobPositions)
      .where(and(eq(jobPositions.id, positionId), eq(jobPositions.userId, userId)));

    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    // NOTE: must use db.select() (no projection) here. Drizzle's neon-http
    // driver has a bug where a many-column projection + .orderBy() + .where()
    // silently returns []. Using select-all sidesteps that.
    const candidates = await db
      .select()
      .from(candidateApplications)
      .where(eq(candidateApplications.positionId, positionId))
      .orderBy(desc(candidateApplications.createdAt));

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('Error fetching position candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
