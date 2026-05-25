// app/api/trainee/interview/[id]/route.js
// GET → fetch full interview row (used by interview taking page + result page)
// DELETE → owner deletes interview + any child quiz attempts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/database";
import { traineeInterviews, traineeQuizAttempts } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

const NO_STORE = {
    headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
    },
};

export async function GET(_request, { params }) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const [row] = await db
        .select()
        .from(traineeInterviews)
        .where(and(eq(traineeInterviews.id, id), eq(traineeInterviews.userId, user.id)));

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: row }, NO_STORE);
}

export async function DELETE(_request, { params }) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
        // Cascade-clean child quiz attempts first. trainee_quiz_attempts has
        // an interviewId column that "FK-style" references trainee_interviews.id
        // but with no real FK constraint, so we have to clear it manually or
        // the rows become orphaned (and the user sees the interview "come back"
        // when their child attempts get listed elsewhere).
        await db
            .delete(traineeQuizAttempts)
            .where(
                and(
                    eq(traineeQuizAttempts.userId, user.id),
                    eq(traineeQuizAttempts.interviewId, id),
                ),
            );

        // Delete the parent row. Use .returning() so we can verify a row was
        // actually deleted — otherwise the UI would say "Deleted" even when
        // the WHERE clause matched nothing (e.g. wrong owner or wrong id).
        const deleted = await db
            .delete(traineeInterviews)
            .where(
                and(
                    eq(traineeInterviews.id, id),
                    eq(traineeInterviews.userId, user.id),
                ),
            )
            .returning({ id: traineeInterviews.id });

        if (deleted.length === 0) {
            return NextResponse.json(
                { error: "Interview not found or you don't own it" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { success: true, deletedId: deleted[0].id },
            NO_STORE,
        );
    } catch (error) {
        console.error("Trainee interview DELETE failed:", error);
        return NextResponse.json(
            { error: "Delete failed", details: error.message },
            { status: 500 },
        );
    }
}
