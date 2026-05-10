// app/api/trainee/interview/[id]/route.js
// GET → fetch full interview row (used by interview taking page + result page)
// DELETE → owner deletes interview
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

    const { id } = await params;
    const [row] = await db
        .select()
        .from(traineeInterviews)
        .where(and(eq(traineeInterviews.id, id), eq(traineeInterviews.userId, user.id)));

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: row });
}

export async function DELETE(_request, { params }) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await db
        .delete(traineeInterviews)
        .where(and(eq(traineeInterviews.id, id), eq(traineeInterviews.userId, user.id)));

    return NextResponse.json({ success: true });
}
