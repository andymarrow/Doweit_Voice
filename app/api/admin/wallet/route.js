// app/api/admin/wallet/route.js
// Unified data feed for the admin Wallet page (replaces the older
// /api/admin/transactions + parts of /api/admin/metrics splits).
//
// Returns:
//   summary       — system-wide KPI totals
//   transactions  — paginated transaction stream with user info attached
//                   (?page=N&limit=50, default 50)
//   users         — every user with computed lifetime stats:
//                     balance, txCount, totalPurchased, totalSpent,
//                     totalBonus, lastActivityAt
//   topSpenders   — 10 users with the largest negative outflow
//   topEarners    — 10 users with the largest positive inflow (bonuses +
//                   marketplace sale credits + purchases)
//
// Tracks every token movement: purchase top-ups, marketplace buys,
// platform bonuses, usage deductions, marketplace sale credits to sellers.
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const firstRow = (r) => (r?.rows ?? r)[0] || {};
const rowsOf = (r) => r?.rows ?? r ?? [];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, parseInt(searchParams.get('limit') || '50', 10));
    const offset = (page - 1) * limit;

    // ── Summary ───────────────────────────────────────────────────────────
    const usersR = await db.execute(
      sql`SELECT
            COUNT(*)::int           AS total,
            COALESCE(SUM(token_balance), 0)::int AS in_system,
            COUNT(*) FILTER (WHERE token_balance > 0)::int AS active_wallets
          FROM users`,
    );
    const u = firstRow(usersR);

    const txTotalsR = await db.execute(
      sql`SELECT
            COUNT(*)::int AS tx_count,
            COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0)::int AS total_spent,
            COALESCE(SUM(CASE WHEN amount > 0 AND type = 'purchase' THEN amount ELSE 0 END), 0)::int AS total_purchased,
            COALESCE(SUM(CASE WHEN amount > 0 AND type = 'bonus' THEN amount ELSE 0 END), 0)::int AS total_bonus
          FROM token_transactions`,
    );
    const t = firstRow(txTotalsR);

    const totalUsers = Number(u.total || 0);
    const summary = {
      totalUsers,
      activeWallets: Number(u.active_wallets || 0),
      tokensInSystem: Number(u.in_system || 0),
      totalSpent:     Number(t.total_spent || 0),
      totalPurchased: Number(t.total_purchased || 0),
      totalBonus:     Number(t.total_bonus || 0),
      totalTransactions: Number(t.tx_count || 0),
      avgBalance: totalUsers > 0 ? Math.round(Number(u.in_system || 0) / totalUsers) : 0,
    };

    // ── Paginated transactions ────────────────────────────────────────────
    const txR = await db.execute(
      sql`SELECT
            tx.id, tx.user_id, tx.type, tx.amount, tx.description,
            tx.duration_minutes, tx.interview_type, tx.created_at,
            u.name  AS user_name,
            u.email AS user_email,
            u.token_balance AS user_balance
          FROM token_transactions tx
          LEFT JOIN users u ON u.id = tx.user_id
          ORDER BY tx.created_at DESC
          LIMIT ${limit} OFFSET ${offset}`,
    );
    const transactions = rowsOf(txR).map((r) => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      amount: Number(r.amount || 0),
      description: r.description,
      durationMinutes: r.duration_minutes,
      interviewType: r.interview_type,
      createdAt: r.created_at,
      userName: r.user_name,
      userEmail: r.user_email,
      userBalance: r.user_balance,
    }));

    // ── Per-user stats (one row per user, joined with transaction aggregates)
    const usersDetailR = await db.execute(
      sql`SELECT
            u.id, u.name, u.email, u.token_balance, u.created_at,
            COALESCE(stats.tx_count, 0)::int          AS tx_count,
            COALESCE(stats.total_purchased, 0)::int   AS total_purchased,
            COALESCE(stats.total_spent, 0)::int       AS total_spent,
            COALESCE(stats.total_bonus, 0)::int       AS total_bonus,
            stats.last_activity_at                     AS last_activity_at
          FROM users u
          LEFT JOIN (
            SELECT
              user_id,
              COUNT(*)::int AS tx_count,
              SUM(CASE WHEN amount > 0 AND type = 'purchase' THEN amount ELSE 0 END)::int AS total_purchased,
              SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END)::int AS total_spent,
              SUM(CASE WHEN amount > 0 AND type = 'bonus' THEN amount ELSE 0 END)::int AS total_bonus,
              MAX(created_at) AS last_activity_at
            FROM token_transactions
            GROUP BY user_id
          ) stats ON stats.user_id = u.id
          ORDER BY u.token_balance DESC`,
    );
    const users = rowsOf(usersDetailR).map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      balance: Number(r.token_balance || 0),
      txCount: Number(r.tx_count || 0),
      totalPurchased: Number(r.total_purchased || 0),
      totalSpent: Number(r.total_spent || 0),
      totalBonus: Number(r.total_bonus || 0),
      lastActivityAt: r.last_activity_at,
      joinedAt: r.created_at,
    }));

    // ── Leaderboards ──────────────────────────────────────────────────────
    const topSpenders = users
      .filter((u) => u.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const topEarners = users
      .filter((u) => u.totalPurchased + u.totalBonus > 0)
      .sort((a, b) => (b.totalPurchased + b.totalBonus) - (a.totalPurchased + a.totalBonus))
      .slice(0, 10);

    return NextResponse.json({
      summary,
      page,
      limit,
      hasMore: transactions.length === limit,
      transactions,
      users,
      topSpenders,
      topEarners,
    });
  } catch (error) {
    console.error('Admin wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to load wallet data', details: error.message },
      { status: 500 }
    );
  }
}
