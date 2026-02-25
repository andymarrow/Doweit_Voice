export const dynamic = "force-dynamic";
// app/api/integrations/templates/route.js
//
// User template library. Templates are reusable across that user's agents.
//   GET  ?destination=slack — list templates filtered by destination
//   POST                    — create a template

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { messageTemplates } from "@/lib/db/schemaCharacterAI";
import { eq, and, desc } from "drizzle-orm";
import { getAllDefaultTemplates } from "@/lib/integrations/defaultTemplates";

export async function GET(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const destination = url.searchParams.get("destination");

    const filters = [eq(messageTemplates.userId, userId)];
    if (destination) {
        filters.push(eq(messageTemplates.destination, destination));
    }

    const userTemplates = await db.query.messageTemplates.findMany({
        where: and(...filters),
        orderBy: [desc(messageTemplates.updatedAt)],
    });

    // Always include the system defaults at the end for clone-ability.
    const defaults = getAllDefaultTemplates()
        .filter((d) => !destination || d.destination === destination)
        .map((d, i) => ({
            id: `default-${d.destination}`, // string id distinguishes from numeric DB ids
            userId: null,
            name: d.name,
            destination: d.destination,
            subject: d.subject,
            body: d.body,
            isDefault: true,
        }));

    return NextResponse.json({ templates: [...userTemplates, ...defaults] });
}

export async function POST(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, destination, subject, body: tplBody } = body || {};
    if (!name || !destination || !tplBody) {
        return NextResponse.json(
            { error: "name, destination and body are required" },
            { status: 400 },
        );
    }
    if (!["slack", "telegram", "email"].includes(destination)) {
        return NextResponse.json({ error: "Unsupported destination" }, { status: 400 });
    }

    const [created] = await db
        .insert(messageTemplates)
        .values({
            userId,
            name: String(name).trim(),
            destination,
            subject: subject ? String(subject) : null,
            body: String(tplBody),
        })
        .returning();

    return NextResponse.json({ template: created }, { status: 201 });
}
