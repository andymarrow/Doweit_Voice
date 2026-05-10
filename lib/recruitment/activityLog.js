// lib/recruitment/activityLog.js
// Records recruiter-facing events ("registered" + "interview_taken") into the
// recruiter_activities table. Self-heals by creating the table on first use
// if `npm run db:push` hasn't been run yet, mirroring the pattern in
// app/api/trainee/quiz/route.js.
import { db } from "@/lib/database";
import { recruiterActivities } from "@/lib/db/schemaCharacterAI";
import { sql } from "drizzle-orm";

const UNDEFINED_TABLE = "42P01";

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
    await db.execute(sql`
        CREATE INDEX IF NOT EXISTS "recruiter_activities_recruiter_idx"
            ON "recruiter_activities" ("recruiter_id", "created_at" DESC)
    `);
}

export async function logRecruiterActivity({
    recruiterId,
    type,
    positionId = null,
    applicationId = null,
    candidateName = null,
    candidateEmail = null,
    positionTitle = null,
}) {
    if (!recruiterId || !type) return null;

    const values = {
        recruiterId,
        type,
        positionId,
        applicationId,
        candidateName,
        candidateEmail,
        positionTitle,
    };

    const insert = () => db.insert(recruiterActivities).values(values).returning();

    try {
        const [row] = await insert();
        return row;
    } catch (err) {
        const code = err?.code || err?.cause?.code;
        if (code !== UNDEFINED_TABLE) {
            console.error("[activityLog] insert failed:", err);
            return null;
        }
        try {
            await ensureTable();
            const [row] = await insert();
            return row;
        } catch (e) {
            console.error("[activityLog] retry failed:", e);
            return null;
        }
    }
}
