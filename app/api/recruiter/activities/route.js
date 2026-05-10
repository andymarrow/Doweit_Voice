// app/api/recruiter/activities/route.js
// Returns the recruiter's recent activity feed (registrations + interviews
// taken). Self-heals if the table is missing.
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { recruiterActivities } from '@/lib/db/schemaCharacterAI';
import { eq, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const UNDEFINED_TABLE = '42P01';

async function ensureTable() {
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "recruiter_activities" (
            "id" serial PRIMARY KEY,
            "recruiter_id" varchar(256) NOT NULL,
            "position_id" varchar(13),
            "application_id" integer,
            "type" varchar(32) NOT NULL,
            "candidate_name" varchar(256),
            "candidate_email" varchar(256),
            "position_title" varchar(256),
            "created_at" timestamp DEFAULT now() NOT NULL
        )
    `);
}

export async function GET(request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

        const select = () =>
            db
                .select()
                .from(recruiterActivities)
                .where(eq(recruiterActivities.recruiterId, userId))
                .orderBy(desc(recruiterActivities.createdAt))
                .limit(limit);

        let rows;
        try {
            rows = await select();
        } catch (err) {
            const code = err?.code || err?.cause?.code;
            if (code !== UNDEFINED_TABLE) throw err;
            await ensureTable();
            rows = await select();
        }

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching recruiter activities:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
