import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users, tokenTransactions, traineeInterviews, candidateApplications, callAgents } from '@/lib/db/schemaCharacterAI';
import { sql, count, sum, gte, and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    const [
        userCountResult,
        tokenSumResult,
        spentResult,
        txCountResult,
        traineeInterviewCountResult,
        recruiterInterviewCountResult,
        agentCountResult,
    ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ total: sum(users.tokenBalance) }).from(users),
        db.select({ total: sum(tokenTransactions.amount) })
            .from(tokenTransactions)
            .where(sql`${tokenTransactions.amount} < 0`),
        db.select({ count: count() }).from(tokenTransactions),
        db.select({ count: count() }).from(traineeInterviews),
        db.select({ count: count() }).from(candidateApplications)
            .where(eq(candidateApplications.interviewTaken, true)),
        db.select({ count: count() }).from(callAgents),
    ]);

    // Monthly stats
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [monthlySpentResult, monthlyInterviewsResult] = await Promise.all([
        db.select({ total: sum(tokenTransactions.amount) })
            .from(tokenTransactions)
            .where(and(
                sql`${tokenTransactions.amount} < 0`,
                gte(tokenTransactions.createdAt, monthStart)
            )),
        db.select({ count: count() })
            .from(tokenTransactions)
            .where(and(
                eq(tokenTransactions.type, 'usage'),
                gte(tokenTransactions.createdAt, monthStart)
            )),
    ]);

    // Breakdown by interviewType
    const typeBreakdown = await db
        .select({
            interviewType: tokenTransactions.interviewType,
            count: count(),
            totalSpent: sum(tokenTransactions.amount),
        })
        .from(tokenTransactions)
        .where(eq(tokenTransactions.type, 'usage'))
        .groupBy(tokenTransactions.interviewType);

    // Top spenders (users who spent the most tokens)
    const topSpenders = await db
        .select({
            userId: tokenTransactions.userId,
            totalSpent: sum(tokenTransactions.amount),
            txCount: count(),
        })
        .from(tokenTransactions)
        .where(sql`${tokenTransactions.amount} < 0`)
        .groupBy(tokenTransactions.userId)
        .orderBy(sql`sum(${tokenTransactions.amount}) ASC`)
        .limit(5);

    // Get user emails for top spenders
    const spenderIds = topSpenders.map(s => s.userId);
    let spenderUsers = [];
    if (spenderIds.length > 0) {
        spenderUsers = await db
            .select({ id: users.id, name: users.name, email: users.email, tokenBalance: users.tokenBalance })
            .from(users)
            .where(sql`${users.id} = ANY(${sql.raw(`ARRAY[${spenderIds.map(id => `'${id}'`).join(',')}]`)})`)
            .catch(() => []);
    }

    const topSpendersWithInfo = topSpenders.map(s => ({
        ...s,
        totalSpent: Math.abs(Number(s.totalSpent || 0)),
        user: spenderUsers.find(u => u.id === s.userId) || { email: s.userId, name: 'Unknown' },
    }));

    return NextResponse.json({
        totalUsers: Number(userCountResult[0]?.count || 0),
        totalTokensInCirculation: Number(tokenSumResult[0]?.total || 0),
        totalTokensSpent: Math.abs(Number(spentResult[0]?.total || 0)),
        totalTransactions: Number(txCountResult[0]?.count || 0),
        totalTraineeInterviews: Number(traineeInterviewCountResult[0]?.count || 0),
        totalRecruiterInterviews: Number(recruiterInterviewCountResult[0]?.count || 0),
        totalAgents: Number(agentCountResult[0]?.count || 0),
        monthlyTokensSpent: Math.abs(Number(monthlySpentResult[0]?.total || 0)),
        monthlyInterviews: Number(monthlyInterviewsResult[0]?.count || 0),
        typeBreakdown,
        topSpenders: topSpendersWithInfo,
    });
}
