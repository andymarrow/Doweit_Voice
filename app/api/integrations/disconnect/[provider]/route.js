export const dynamic = "force-dynamic";
// app/api/integrations/disconnect/[provider]/route.js
//
// Removes the user's connection to a provider. Per-agent rules that depend
// on this provider remain in the DB but will fail at dispatch time with a
// "not connected" message in the log — easier UX than cascading delete.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { deleteConnection } from "@/lib/integrations/connections";

const ALLOWED = new Set([
    "slack",
    "telegram",
    "email",
    "google",
    "elevenlabs",
    "calcom",
    "twilio",
]);

export async function DELETE(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = params.provider;
    if (!ALLOWED.has(provider)) {
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    await deleteConnection(userId, provider);
    return NextResponse.json({ success: true });
}
