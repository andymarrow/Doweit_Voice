export const dynamic = "force-dynamic";
// app/api/callagents/[agentid]/integrations/calcom/runtime/route.js
//
// Returns the Cal.com tools + prompt suffix to inject into a Vapi assistant
// at runtime. The in-browser test panel calls this right before vapi.start()
// so the agent gets calendar superpowers during a web test call.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents } from "@/lib/db/schemaCharacterAI";
import { eq } from "drizzle-orm";
import { getCalcomVapiAddons } from "@/lib/integrations/calcom/vapiTools";
import { resolveCallAgentId } from "@/lib/utils/publicId";

export async function GET(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, agentId),
        columns: { id: true, creatorId: true },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (agent.creatorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const addons = await getCalcomVapiAddons(agentId);
    return NextResponse.json(addons || { tools: [], promptSuffix: "" });
}
