export const dynamic = "force-dynamic";
// app/api/integrations/slack/channels/route.js
//
// Returns the list of Slack channels the connected workspace's bot can post
// to. Used by the per-agent rule editor's channel picker. The bot has to be
// invited into private channels to appear in this list (Slack security
// model — we surface that to the user in the help text).

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { getConnection } from "@/lib/integrations/connections";
import { listSlackChannels } from "@/lib/integrations/adapters/slack";

export async function GET() {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conn = await getConnection(userId, "slack");
    if (!conn?.accessToken) {
        return NextResponse.json(
            { error: "Slack not connected", channels: [] },
            { status: 400 },
        );
    }

    try {
        // Paginate fully — Slack returns up to 200 per page.
        let cursor;
        const all = [];
        do {
            const res = await listSlackChannels(conn.accessToken, cursor);
            for (const c of res.channels || []) {
                all.push({
                    id: c.id,
                    name: c.name,
                    isPrivate: !!c.is_private,
                    isMember: !!c.is_member,
                });
            }
            cursor = res.response_metadata?.next_cursor || "";
        } while (cursor);

        // Sort: member channels first, then alphabetical.
        all.sort((a, b) => {
            if (a.isMember !== b.isMember) return a.isMember ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return NextResponse.json({ channels: all, team: conn.teamName });
    } catch (e) {
        console.error("[SLACK CHANNELS] list failed:", e?.message);
        return NextResponse.json(
            { error: e?.message || "Failed to fetch channels" },
            { status: 500 },
        );
    }
}
