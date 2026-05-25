// app/api/marketplace/positions/[id]/buy/route.js
// Marketplace purchase flow for public job positions.
//
//   buyerType=trainee   → clone into trainee_interviews (shows up in
//                         /trainee /sessions, taken via /trainee/interview/[id])
//   buyerType=recruiter → clone into job_positions (shows up in the recruiter's
//                         own Interviews list as a fresh draft they own)
//
// Token transfer: 100% of the position price is debited from the buyer's
// token_balance and credited to the seller's token_balance. Two
// token_transactions rows are written for an auditable trail.
//
// Self-heals the position_ratings table touch (shared with /rate route) on
// cold DB by relying on those routes — buy doesn't touch ratings directly.
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/database';
import {
  users,
  jobPositions,
  traineeInterviews,
  tokenTransactions,
} from '@/lib/db/schemaCharacterAI';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Nanoid-12 generator for trainee_interviews.id (matches existing scheme)
function nano12() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// 13-char id for job_positions clones (same alphabet as the schema default)
function id13() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 13; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(request, { params }) {
  try {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: positionId } = await params;
    if (!positionId) {
      return NextResponse.json({ error: 'positionId is required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const buyerType = body?.buyerType === 'recruiter' ? 'recruiter' : 'trainee';

    // 1. Load source position
    const sourcePosition = await db.query.jobPositions.findFirst({
      where: eq(jobPositions.id, positionId),
    });
    if (!sourcePosition) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }
    if (!(sourcePosition.accessType || '').toLowerCase().startsWith('public')) {
      return NextResponse.json({ error: 'Position is not on the marketplace' }, { status: 403 });
    }
    const sellerId = sourcePosition.userId || sourcePosition.recruiterId;
    if (sellerId && sellerId === user.id) {
      return NextResponse.json({ error: "You can't buy your own position" }, { status: 400 });
    }

    // 2. Load buyer + check balance
    const buyer = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    if (!buyer) return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });

    const price = Number(sourcePosition.price) || 0;
    if (buyer.tokenBalance < price) {
      return NextResponse.json(
        { error: 'Insufficient tokens', required: price, balance: buyer.tokenBalance },
        { status: 402 }
      );
    }

    // 3. Token transfer + ledger entries.
    //    neon-http driver doesn't expose transactions, so we do best-effort
    //    sequential writes with a refund on clone failure below.
    await db.update(users)
      .set({ tokenBalance: sql`${users.tokenBalance} - ${price}` })
      .where(eq(users.id, user.id));

    if (sellerId && sellerId !== user.id) {
      await db.update(users)
        .set({ tokenBalance: sql`${users.tokenBalance} + ${price}` })
        .where(eq(users.id, sellerId));
    }

    await db.insert(tokenTransactions).values({
      userId: user.id,
      type: 'purchase',
      amount: -price,
      description: `Bought marketplace position: ${sourcePosition.title}`,
      interviewType: buyerType,
    });

    if (sellerId && sellerId !== user.id) {
      await db.insert(tokenTransactions).values({
        userId: sellerId,
        type: 'bonus',
        amount: price,
        description: `Marketplace sale: ${sourcePosition.title}`,
        interviewType: buyerType,
      });
    }

    // 4. Clone into the buyer's table
    let cloneId = null;
    try {
      if (buyerType === 'trainee') {
        cloneId = nano12();
        // IMPORTANT: do NOT carry over the recruiter-side voice/engine config.
        // jobPositions defaults interviewer='gemini' but the trainee taking
        // page routes any clone with that value to the Gemini Live engine —
        // which trainees rarely have configured. The first attempt fails and
        // leaves the hook in 'error' state, so subsequent clicks bail with
        // "Interview engine is not ready". Mirroring the trainee CreateSession
        // defaults (vapi everywhere) keeps the bought clone behaving exactly
        // like a self-created session. Only carry over things the trainee
        // hooks actually use: prompt + questions + rubric.
        await db.insert(traineeInterviews).values({
          id: cloneId,
          userId: user.id,
          title: sourcePosition.title,
          duration: sourcePosition.duration ?? 30,
          questionCount: sourcePosition.questionCount ?? 8,
          department: sourcePosition.department,
          language: sourcePosition.language || 'English',
          experienceLevel: sourcePosition.requiredExperience,
          description: sourcePosition.description,
          systemPrompt: sourcePosition.systemPrompt,
          aiQuestions: sourcePosition.aiQuestions || [],
          evaluationCriteria: sourcePosition.evaluationCriteria || [],
          voiceProvider: 'vapi',
          voiceId: 'monitor',
          agentName: sourcePosition.agentName || 'Viktor',
          tone: sourcePosition.tone || 'Friendly',
          interviewer: 'vapi',
          status: 'active',
        });
      } else {
        // recruiter clone — new row in job_positions owned by the buyer.
        // Default to private and draft so the cloned row is NOT automatically
        // re-listed on the marketplace.
        cloneId = id13();
        await db.insert(jobPositions).values({
          id: cloneId,
          recruiterId: user.id,
          userId: user.id,
          title: `${sourcePosition.title} (Purchased)`,
          department: sourcePosition.department,
          description: sourcePosition.description,
          evaluationDescription: sourcePosition.evaluationDescription,
          location: sourcePosition.location,
          employmentType: sourcePosition.employmentType,
          language: sourcePosition.language || 'English',
          jobPosition: sourcePosition.jobPosition,
          requiredExperience: sourcePosition.requiredExperience,
          questionCount: sourcePosition.questionCount ?? 8,
          duration: sourcePosition.duration ?? 30,
          antiCheatEnabled: sourcePosition.antiCheatEnabled ?? true,
          aiQuestions: sourcePosition.aiQuestions || [],
          interviewer: sourcePosition.interviewer || 'gemini',
          voiceProvider: sourcePosition.voiceProvider || 'vapi',
          voiceId: sourcePosition.voiceId || 'monitor',
          systemPrompt: sourcePosition.systemPrompt,
          agentName: sourcePosition.agentName || 'Viktor',
          tone: sourcePosition.tone || 'Friendly',
          evaluationCriteria: sourcePosition.evaluationCriteria || [],
          price: sourcePosition.price || 50,
          accessType: 'Private (Invite Only)',
          status: 'draft',
        });
      }
    } catch (cloneErr) {
      console.error('Clone failed, refunding buyer:', cloneErr);
      // Refund the buyer + claw back the seller credit so accounts stay even
      await db.update(users)
        .set({ tokenBalance: sql`${users.tokenBalance} + ${price}` })
        .where(eq(users.id, user.id));
      if (sellerId && sellerId !== user.id) {
        await db.update(users)
          .set({ tokenBalance: sql`${users.tokenBalance} - ${price}` })
          .where(eq(users.id, sellerId));
      }
      await db.insert(tokenTransactions).values({
        userId: user.id,
        type: 'bonus',
        amount: price,
        description: `Refund: failed purchase of ${sourcePosition.title}`,
        interviewType: buyerType,
      });
      throw cloneErr;
    }

    return NextResponse.json({
      success: true,
      buyerType,
      cloneId,
      tokensSpent: price,
    });
  } catch (error) {
    console.error('Marketplace buy error:', error);
    return NextResponse.json(
      { error: 'Purchase failed', details: error.message },
      { status: 500 }
    );
  }
}
