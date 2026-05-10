// app/api/trainee/quiz/attempt/[attemptId]/route.js
// Returns the full saved quiz attempt (questions, answers, score) so the
// trainee can review it any time after submission.
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/database";
import { traineeQuizAttempts } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { attemptId } = await params;
    const id = parseInt(attemptId, 10);
    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid attempt id" }, { status: 400 });
    }

    const [row] = await db
        .select()
        .from(traineeQuizAttempts)
        .where(
            and(
                eq(traineeQuizAttempts.id, id),
                eq(traineeQuizAttempts.userId, user.id),
            ),
        );

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: row });
}
