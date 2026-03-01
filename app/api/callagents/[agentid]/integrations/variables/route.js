export const dynamic = "force-dynamic";
// app/api/callagents/[agentid]/integrations/variables/route.js
//
// Returns the list of {{variables}} the template editor should suggest for
// this specific agent — call.* fixed list + action.<name>.
//
// Primary source: agent_actions (action definitions formally assigned to the
// agent via the Actions page).  Fallback: unique action definitions found in
// call_action_values extracted from this agent's calls. The fallback means
// the dropdown is populated even when the agent page hasn't been explicitly
// set up, as long as at least one call has had actions extracted.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents, calls, callActionValues } from "@/lib/db/schemaCharacterAI";
import { eq, inArray } from "drizzle-orm";
import { describeVariables } from "@/lib/integrations/defaultTemplates";
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
        with: {
            agentActions: { with: { action: true } },
        },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (agent.creatorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Primary: use the formally configured agent actions.
    let agentActionList = agent.agentActions || [];

    // Fallback: if none are configured, derive unique action definitions from
    // whatever has actually been extracted across this agent's calls. This
    // surfaces the right variable names even when the Actions page was skipped.
    if (agentActionList.length === 0) {
        const callRows = await db.query.calls.findMany({
            where: eq(calls.agentId, agentId),
            columns: { id: true },
        });
        const callIds = callRows.map((c) => c.id);
        if (callIds.length > 0) {
            const valueRows = await db.query.callActionValues.findMany({
                where: inArray(callActionValues.callId, callIds),
                with: { agentAction: { with: { action: true } } },
            });
            const seen = new Set();
            for (const v of valueRows) {
                const action = v.agentAction?.action;
                if (!action || seen.has(action.id)) continue;
                seen.add(action.id);
                // Shape matches what describeVariables expects: { action: { name, displayName } }
                agentActionList.push({ action });
            }
        }
    }

    const variables = describeVariables(agentActionList);
    return NextResponse.json(variables);
}
