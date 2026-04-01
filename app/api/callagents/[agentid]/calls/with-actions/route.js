export const dynamic = "force-dynamic";
// app/api/callagents/[agentid]/calls/with-actions/route.js
//
// Returns the agent's past calls that have at least one extracted
// callActionValue. Used by the "Send to past calls" picker so the user only
// sees calls that actually have data to send.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import {
    callAgents,
    calls,
    callActionValues,
} from "@/lib/db/schemaCharacterAI";
import { eq, and, desc, sql } from "drizzle-orm";
import { resolveCallAgentId } from "@/lib/utils/publicId";

export async function GET(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId)
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, agentId),
        columns: { id: true, creatorId: true },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (agent.creatorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Find call IDs that have at least one extracted action value.
    const withValues = await db
        .selectDistinct({ id: calls.id })
        .from(calls)
        .innerJoin(callActionValues, eq(calls.id, callActionValues.callId))
        .where(eq(calls.agentId, agentId));
    const eligibleIds = withValues.map((r) => r.id);
    if (eligibleIds.length === 0) {
        return NextResponse.json({ calls: [] });
    }

    // Pull the calls with a count of action values so the picker can show
    // "<n> actions extracted" inline.
    const rows = await db.query.calls.findMany({
        where: and(eq(calls.agentId, agentId)),
        orderBy: [desc(calls.startTime)],
        limit: 100,
        with: {
            callActionValues: { columns: { id: true } },
        },
    });
    const result = rows
        .filter((c) => (c.callActionValues || []).length > 0)
        .map((c) => ({
            id: c.id,
            phoneNumber: c.phoneNumber,
            direction: c.direction,
            duration: c.duration,
            status: c.status,
            startTime: c.startTime,
            summary: c.summary,
            actionCount: c.callActionValues.length,
        }));

    return NextResponse.json({ calls: result });
}
