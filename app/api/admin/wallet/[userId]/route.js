// app/api/admin/wallet/[userId]/route.js
// Per-user drill-down for the admin Wallet page. Click a row → modal opens →
// this fires once to surface that user's complete token history + computed
// lifetime stats so admins can audit any account in seconds.
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const firstRow = (r) => (r?.rows ?? r)[0] || {};
const rowsOf = (r) => r?.rows ?? r ?? [];

export async function GET(_request, { params }) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // User profile
    const userR = await db.execute(
      sql`SELECT id, name, email, token_balance, created_at
          FROM users WHERE id = ${userId} LIMIT 1`,
    );
    const u = firstRow(userR);
    if (!u.id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Lifetime stats from token_transactions
    const statsR = await db.execute(
      sql`SELECT
            COUNT(*)::int AS tx_count,
            COALESCE(SUM(CASE WHEN amount > 0 AND type = 'purchase' THEN amount ELSE 0 END), 0)::int AS total_purchased,
            COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0)::int AS total_spent,
            COALESCE(SUM(CASE WHEN amount > 0 AND type = 'bonus' THEN amount ELSE 0 END), 0)::int AS total_bonus,
            COALESCE(SUM(CASE WHEN amount < 0 AND interview_type = 'trainee' THEN -amount ELSE 0 END), 0)::int AS spent_trainee,
            COALESCE(SUM(CASE WHEN amount < 0 AND interview_type = 'recruiter' THEN -amount ELSE 0 END), 0)::int AS spent_recruiter,
            MIN(created_at) AS first_activity_at,
            MAX(created_at) AS last_activity_at
          FROM token_transactions
          WHERE user_id = ${userId}`,
    );
    const s = firstRow(statsR);

    // Type breakdown
    const typeR = await db.execute(
      sql`SELECT type, COUNT(*)::int AS c,
                 COALESCE(SUM(amount), 0)::int AS amount
          FROM token_transactions
          WHERE user_id = ${userId}
          GROUP BY type`,
    );
    const typeBreakdown = rowsOf(typeR).map((r) => ({
      type: r.type,
      count: Number(r.c || 0),
      amount: Number(r.amount || 0),
    }));

    // Full transaction history (cap at 200 most-recent to keep the modal fast)
    const txR = await db.execute(
      sql`SELECT id, type, amount, description, duration_minutes,
                 interview_type, created_at
          FROM token_transactions
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT 200`,
    );
    const transactions = rowsOf(txR).map((r) => ({
      id: r.id,
      type: r.type,
      amount: Number(r.amount || 0),
      description: r.description,
      durationMinutes: r.duration_minutes,
      interviewType: r.interview_type,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        balance: Number(u.token_balance || 0),
        joinedAt: u.created_at,
      },
      stats: {
        txCount: Number(s.tx_count || 0),
        totalPurchased: Number(s.total_purchased || 0),
        totalSpent: Number(s.total_spent || 0),
        totalBonus: Number(s.total_bonus || 0),
        spentTrainee: Number(s.spent_trainee || 0),
        spentRecruiter: Number(s.spent_recruiter || 0),
        firstActivityAt: s.first_activity_at,
        lastActivityAt: s.last_activity_at,
      },
      typeBreakdown,
      transactions,
    });
  } catch (error) {
    console.error('Admin wallet user detail error:', error);
    return NextResponse.json(
      { error: 'Failed to load user detail', details: error.message },
      { status: 500 }
    );
  }
}
