import { db } from '@/lib/database';
import { users, tokenTransactions } from '@/lib/db/schemaCharacterAI';
import { eq, sql } from 'drizzle-orm';

/**
 * Deduct interview tokens from a user and record the transaction.
 * Cost: Math.max(1, ceil(durationMinutes)) * 10 tokens per minute.
 * Balance never goes below 0.
 *
 * @param {object} opts
 * @param {string} opts.userId
 * @param {number} opts.durationMinutes  - actual interview duration in minutes
 * @param {string} opts.description      - human-readable label for the transaction
 * @param {'trainee'|'recruiter'} opts.interviewType
 * @returns {{ cost: number, newBalance: number }}
 */
export async function deductTokens({ userId, durationMinutes, description, interviewType }) {
    const mins = Math.max(1, Math.ceil(durationMinutes || 1));
    const cost = mins * 10;

    await db
        .update(users)
        .set({ tokenBalance: sql`GREATEST(0, ${users.tokenBalance} - ${cost})` })
        .where(eq(users.id, userId));

    await db.insert(tokenTransactions).values({
        userId,
        type: 'usage',
        amount: -cost,
        description: description || 'Interview session',
        durationMinutes: mins,
        interviewType: interviewType || 'trainee',
    });

    const [updated] = await db
        .select({ tokenBalance: users.tokenBalance })
        .from(users)
        .where(eq(users.id, userId));

    return { cost, newBalance: updated?.tokenBalance ?? 0 };
}

/**
 * Credit tokens to a user (purchase, bonus, etc.) and record the transaction.
 */
export async function creditTokens({ userId, amount, description, type = 'purchase' }) {
    await db
        .update(users)
        .set({ tokenBalance: sql`${users.tokenBalance} + ${amount}` })
        .where(eq(users.id, userId));

    await db.insert(tokenTransactions).values({
        userId,
        type,
        amount,
        description: description || 'Token top-up',
    });

    const [updated] = await db
        .select({ tokenBalance: users.tokenBalance })
        .from(users)
        .where(eq(users.id, userId));

    return { newBalance: updated?.tokenBalance ?? 0 };
}
