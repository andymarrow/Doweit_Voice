// app/api/trainee/interview/[id]/result/[attemptId]/route.js
// Returns transcript + general result + specific result + reasons for a
// specific attempt. The id key ties all three JSONB stores together.
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/database";
import { traineeInterviews } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, attemptId } = await params;
    const [row] = await db
        .select()
        .from(traineeInterviews)
        .where(and(eq(traineeInterviews.id, id), eq(traineeInterviews.userId, user.id)));

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const transcript = row.transcripts?.[attemptId] || null;
    const result = row.results?.[attemptId] || null;
    const reasons = row.resultReasons?.[attemptId] || null;

    if (!result) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    return NextResponse.json({
        success: true,
        data: {
            interview: {
                id: row.id,
                title: row.title,
                department: row.department,
                language: row.language,
                experienceLevel: row.experienceLevel,
                duration: row.duration,
                evaluationCriteria: row.evaluationCriteria,
            },
            attemptId,
            transcript,
            general: result.general,
            specific: result.specific,
            reasons,
        },
    });
}
