export const dynamic = "force-dynamic";
export const maxDuration = 30;
// app/api/callagents/[agentid]/integrations/calcom/execute/route.js
//
// Executes one Cal.com tool call for an agent and returns a plain-text result.
// Used by runtimes that don't speak Vapi's webhook envelope — specifically the
// in-browser Gemini Live test panel, which gets a `toolCall` from Gemini and
// needs the server to actually hit Cal.com (the browser has no credentials).

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { resolveCallAgentId } from "@/lib/utils/publicId";
import { runCalcomToolForAgent } from "@/lib/integrations/calcom/toolHandler";

export async function POST(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, args } = body || {};
    if (!name) {
        return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
    }

    // runCalcomToolForAgent verifies ownership against userId and always
    // resolves to a readable string (it never throws).
    const result = await runCalcomToolForAgent(agentId, name, args || {}, userId);
    return NextResponse.json({ result });
}
