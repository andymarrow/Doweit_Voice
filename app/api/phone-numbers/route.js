export const dynamic = "force-dynamic";
// app/api/phone-numbers/route.js
//
// GET — list the user's saved phone numbers (across providers).
// Each row carries enough metadata to render the phone-numbers page.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { phoneNumbers } from "@/lib/db/schemaCharacterAI";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const numbers = await db.query.phoneNumbers.findMany({
        where: eq(phoneNumbers.userId, userId),
        orderBy: [desc(phoneNumbers.createdAt)],
        with: {
            assignedAgent: { columns: { id: true, name: true } },
        },
    });

    return NextResponse.json({ numbers });
}
