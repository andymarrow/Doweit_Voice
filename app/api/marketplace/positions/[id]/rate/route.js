// app/api/marketplace/positions/[id]/rate/route.js
// GET  → { averageRating, ratingCount, userRating }
// POST → submits or updates the caller's rating (1..5). Idempotent thanks to
//        the unique (position_id, user_id) index — second submissions UPSERT
//        to the new value. Returns the recomputed aggregate.
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const UNDEFINED_TABLE = '42P01';
const firstRow = (r) => (r?.rows ?? r)[0] || {};

async function ensureRatingsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "position_ratings" (
      "id" serial PRIMARY KEY,
      "position_id" varchar(13) NOT NULL REFERENCES "job_positions"("id") ON DELETE CASCADE,
      "user_id" varchar(256) NOT NULL,
      "rating" integer NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "position_ratings_user_position_uniq"
    ON "position_ratings" ("position_id", "user_id")
  `);
}

async function fetchAggregate(positionId, userId) {
  const aggR = await db.execute(sql`
    SELECT
      COALESCE(AVG(rating)::float, 0) AS avg_rating,
      COUNT(*)::int                    AS rating_count
    FROM position_ratings
    WHERE position_id = ${positionId}
  `);
  const userR = await db.execute(sql`
    SELECT rating
    FROM position_ratings
    WHERE position_id = ${positionId} AND user_id = ${userId}
    LIMIT 1
  `);
  const agg = firstRow(aggR);
  return {
    averageRating: Number(agg.avg_rating || 0),
    ratingCount: Number(agg.rating_count || 0),
    userRating: Number(firstRow(userR).rating) || null,
  };
}

export async function GET(_request, { params }) {
  try {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: positionId } = await params;
    if (!positionId) {
      return NextResponse.json({ error: 'positionId is required' }, { status: 400 });
    }

    try {
      const agg = await fetchAggregate(positionId, user.id);
      return NextResponse.json(agg);
    } catch (err) {
      const code = err?.code || err?.cause?.code;
      if (code !== UNDEFINED_TABLE) throw err;
      await ensureRatingsTable();
      const agg = await fetchAggregate(positionId, user.id);
      return NextResponse.json(agg);
    }
  } catch (error) {
    console.error('Rating GET error:', error);
    return NextResponse.json({ error: 'Failed to load ratings' }, { status: 500 });
  }
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
    const rating = Math.round(Number(body?.rating));
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be 1..5' }, { status: 400 });
    }

    const upsert = () =>
      db.execute(sql`
        INSERT INTO position_ratings (position_id, user_id, rating, created_at, updated_at)
        VALUES (${positionId}, ${user.id}, ${rating}, NOW(), NOW())
        ON CONFLICT (position_id, user_id)
        DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
      `);

    try {
      await upsert();
    } catch (err) {
      const code = err?.code || err?.cause?.code;
      if (code !== UNDEFINED_TABLE) throw err;
      await ensureRatingsTable();
      await upsert();
    }

    const agg = await fetchAggregate(positionId, user.id);
    return NextResponse.json({ success: true, ...agg });
  } catch (error) {
    console.error('Rating POST error:', error);
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
  }
}
