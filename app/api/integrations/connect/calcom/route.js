export const dynamic = "force-dynamic";
// app/api/integrations/connect/calcom/route.js
//
// Stores a user's Cal.com API key. Validates by calling /me before persisting.
// Optional baseUrl lets self-hosted Cal.com users point at their own host.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { saveConnection } from "@/lib/integrations/connections";
import { validateApiKey } from "@/lib/integrations/adapters/calcom";

export async function POST(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey, baseUrl } = await req.json();
    if (!apiKey || typeof apiKey !== "string") {
        return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const conn = {
        apiKey: apiKey.trim(),
        baseUrl: baseUrl ? String(baseUrl).trim() : undefined,
    };

    try {
        const me = await validateApiKey(conn);
        await saveConnection(userId, "calcom", conn);
        return NextResponse.json({
            success: true,
            account: {
                username: me.user?.username || me.username,
                email: me.user?.email || me.email,
            },
        });
    } catch (e) {
        console.error("[CALCOM CONNECT] validation failed:", e?.message, e?.detail);
        return NextResponse.json(
            {
                error:
                    "Could not connect to Cal.com with that API key. " +
                    "Double-check the key and (for self-hosted) the base URL.",
            },
            { status: 400 },
        );
    }
}
