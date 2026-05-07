export const dynamic = "force-dynamic";
// app/api/phone-numbers/[id]/route.js
//
// PATCH — rename / change friendlyName
// DELETE — remove the number from our DB AND release Vapi's claim. For BYO
//          Twilio numbers this does NOT delete the underlying number on Twilio.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { phoneNumbers } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";
import { deleteVapiNumber } from "@/lib/integrations/adapters/vapiNumbers";

async function loadOwn(userId, id) {
    const numericId = parseInt(id, 10);
    if (Number.isNaN(numericId)) return null;
    return db.query.phoneNumbers.findFirst({
        where: and(
            eq(phoneNumbers.id, numericId),
            eq(phoneNumbers.userId, userId),
        ),
    });
}

export async function PATCH(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const row = await loadOwn(userId, params.id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const updates = { updatedAt: new Date() };
    if (typeof body.friendlyName === "string") {
        updates.friendlyName = body.friendlyName.trim();
    }

    const [updated] = await db
        .update(phoneNumbers)
        .set(updates)
        .where(eq(phoneNumbers.id, row.id))
        .returning();
    return NextResponse.json({ phoneNumber: updated });
}

export async function DELETE(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const row = await loadOwn(userId, params.id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Release Vapi claim — best-effort, ignore failures.
    const vapiId = row.providerIds?.vapiNumberId;
    if (vapiId) {
        try {
            await deleteVapiNumber(vapiId);
        } catch (e) {
            console.warn("[PHONE NUMBERS DELETE] Vapi release failed:", e?.message);
        }
    }
    await db.delete(phoneNumbers).where(eq(phoneNumbers.id, row.id));
    return NextResponse.json({ success: true });
}
