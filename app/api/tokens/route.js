import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/database';
import { users, tokenTransactions } from '@/lib/db/schemaCharacterAI';
import { eq, desc, gte, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [userData] = await db
        .select({ tokenBalance: users.tokenBalance })
        .from(users)
        .where(eq(users.id, user.id));

    const transactions = await db
        .select()
        .from(tokenTransactions)
        .where(eq(tokenTransactions.userId, user.id))
        .orderBy(desc(tokenTransactions.createdAt))
        .limit(50);

    // Monthly stats: current calendar month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyTx = await db
        .select()
        .from(tokenTransactions)
        .where(
            and(
                eq(tokenTransactions.userId, user.id),
                gte(tokenTransactions.createdAt, monthStart)
            )
        );

    const monthlyUsed = monthlyTx
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyInterviews = monthlyTx.filter(t => t.type === 'usage').length;

    const avgCost = monthlyInterviews > 0
        ? Math.round(monthlyUsed / monthlyInterviews)
        : 0;

    return NextResponse.json({
        balance: userData?.tokenBalance ?? 1000,
        transactions,
        stats: {
            monthlyUsed,
            monthlyInterviews,
            avgCost,
        },
    });
}
