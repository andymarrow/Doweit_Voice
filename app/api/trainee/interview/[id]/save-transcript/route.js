// app/api/trainee/interview/[id]/save-transcript/route.js
// Persists the transcript for a single attempt without running AI analysis.
// Used as the mid-call save-on-every-turn endpoint by the interview UI.
// Body: { attemptId, transcript: [...] }
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/database";
import { traineeInterviews } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { attemptId, transcript = [] } = (await request.json()) || {};
    if (!attemptId) {
        return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
    }

    const [row] = await db
        .select()
        .from(traineeInterviews)
        .where(and(eq(traineeInterviews.id, id), eq(traineeInterviews.userId, user.id)));
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const prev = row.transcripts || {};
    const startedAt = prev[attemptId]?.startedAt || new Date().toISOString();
    const transcripts = {
        ...prev,
        [attemptId]: { transcript, startedAt, updatedAt: new Date().toISOString() },
    };

    await db
        .update(traineeInterviews)
        .set({ transcripts })
        .where(eq(traineeInterviews.id, id));

    return NextResponse.json({ success: true });
}
