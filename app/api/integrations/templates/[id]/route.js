export const dynamic = "force-dynamic";
// app/api/integrations/templates/[id]/route.js
//
// PATCH/DELETE a single template. Defaults (id starts with "default-") are
// not editable — clone them to create a custom one.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { messageTemplates } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

async function loadOwn(userId, id) {
    const numericId = parseInt(id, 10);
    if (Number.isNaN(numericId)) return null;
    return db.query.messageTemplates.findFirst({
        where: and(
            eq(messageTemplates.id, numericId),
            eq(messageTemplates.userId, userId),
        ),
    });
}

export async function PATCH(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tpl = await loadOwn(userId, params.id);
    if (!tpl) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    const body = await req.json();
    const updates = {};
    if (typeof body.name === "string") updates.name = body.name.trim();
    if (typeof body.subject === "string" || body.subject === null) updates.subject = body.subject;
    if (typeof body.body === "string") updates.body = body.body;
    updates.updatedAt = new Date();

    const [updated] = await db
        .update(messageTemplates)
        .set(updates)
        .where(eq(messageTemplates.id, tpl.id))
        .returning();

    return NextResponse.json({ template: updated });
}

export async function DELETE(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tpl = await loadOwn(userId, params.id);
    if (!tpl) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    await db.delete(messageTemplates).where(eq(messageTemplates.id, tpl.id));
    return NextResponse.json({ success: true });
}
