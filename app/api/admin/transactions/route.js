import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users, tokenTransactions } from '@/lib/db/schemaCharacterAI';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = 50;
    const offset = (page - 1) * limit;

    const transactions = await db
        .select({
            id: tokenTransactions.id,
            userId: tokenTransactions.userId,
            type: tokenTransactions.type,
            amount: tokenTransactions.amount,
            description: tokenTransactions.description,
            durationMinutes: tokenTransactions.durationMinutes,
            interviewType: tokenTransactions.interviewType,
            createdAt: tokenTransactions.createdAt,
            userName: users.name,
            userEmail: users.email,
            userBalance: users.tokenBalance,
        })
        .from(tokenTransactions)
        .leftJoin(users, eq(tokenTransactions.userId, users.id))
        .orderBy(desc(tokenTransactions.createdAt))
        .limit(limit)
        .offset(offset);

    // All users with their current token balance
    const userBalances = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            tokenBalance: users.tokenBalance,
            createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(users.tokenBalance);

    return NextResponse.json({ transactions, userBalances, page });
}
