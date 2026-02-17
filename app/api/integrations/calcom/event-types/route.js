export const dynamic = "force-dynamic";
// app/api/integrations/calcom/event-types/route.js
//
// Lists the user's Cal.com event types so the per-agent config picker can
// show them. Cached only for the duration of one request — Cal.com's API
// is fast enough that we don't need a CDN-level cache here.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { getConnection } from "@/lib/integrations/connections";
import { listEventTypes } from "@/lib/integrations/adapters/calcom";

export async function GET() {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conn = await getConnection(userId, "calcom");
    if (!conn?.apiKey) {
        return NextResponse.json(
            { error: "Cal.com not connected", eventTypes: [] },
            { status: 400 },
        );
    }

    try {
        const list = await listEventTypes(conn);
        const minimal = list.map((e) => ({
            id: e.id,
            title: e.title,
            slug: e.slug,
            length: e.length, // minutes
            hidden: !!e.hidden,
            description: e.description,
        }));
        return NextResponse.json({ eventTypes: minimal });
    } catch (e) {
        console.error("[CALCOM EVENT-TYPES] failed:", e?.message);
        return NextResponse.json(
            { error: e?.message || "Failed to fetch event types" },
            { status: 500 },
        );
    }
}
