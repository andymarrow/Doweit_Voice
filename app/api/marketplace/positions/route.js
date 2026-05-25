// app/api/marketplace/positions/route.js
// Lists every job position whose access_type starts with "Public" — these are
// the rows visible to both recruiters (in /recruiter, where Library has been
// rebranded to Marketplace) and trainees (in /trainee/marketplace).
//
// The route is self-healing: if the position_ratings table doesn't exist yet
// (schema hasn't been pushed), it creates it on first request so the user
// doesn't need to run `npm run db:push` manually.
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const UNDEFINED_TABLE = '42P01';

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

const rowsOf = (r) => r?.rows ?? r ?? [];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    const run = () =>
      db.execute(sql`
        SELECT
          p.id,
          p.title,
          p.department,
          p.description,
          p.location,
          p.employment_type,
          p.language,
          p.required_experience,
          p.duration,
          p.question_count,
          p.price,
          p.access_type,
          p.status,
          p.user_id,
          p.created_at,
          u.name  AS seller_name,
          u.email AS seller_email,
          COALESCE(r.avg_rating, 0)   AS avg_rating,
          COALESCE(r.rating_count, 0) AS rating_count
        FROM job_positions p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN (
          SELECT position_id,
                 AVG(rating)::float AS avg_rating,
                 COUNT(*)::int      AS rating_count
            FROM position_ratings
           GROUP BY position_id
        ) r ON r.position_id = p.id
        WHERE p.access_type ILIKE 'public%'
        ORDER BY p.created_at DESC
      `);

    let result;
    try {
      result = await run();
    } catch (err) {
      const code = err?.code || err?.cause?.code;
      if (code !== UNDEFINED_TABLE) throw err;
      await ensureRatingsTable();
      result = await run();
    }

    const all = rowsOf(result).map((r) => ({
      id: r.id,
      title: r.title,
      department: r.department,
      description: r.description,
      location: r.location,
      employmentType: r.employment_type,
      language: r.language,
      requiredExperience: r.required_experience,
      duration: r.duration,
      questionCount: r.question_count,
      price: r.price,
      accessType: r.access_type,
      status: r.status,
      sellerId: r.user_id,
      sellerName: r.seller_name,
      sellerEmail: r.seller_email,
      averageRating: Number(r.avg_rating || 0),
      ratingCount: Number(r.rating_count || 0),
      createdAt: r.created_at,
    }));

    const filtered = q
      ? all.filter((p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.department || '').toLowerCase().includes(q)
        )
      : all;

    return NextResponse.json({ positions: filtered });
  } catch (error) {
    console.error('Marketplace positions error:', error);
    return NextResponse.json(
      { error: 'Failed to load marketplace', details: error.message },
      { status: 500 }
    );
  }
}
