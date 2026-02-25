export const dynamic = "force-dynamic";
// app/api/callagents/[agentid]/integrations/rules/[ruleid]/route.js
//
// PATCH — update a rule (name, destinationConfig, templateId, filter, enabled)
// DELETE — remove a rule

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import {
    callAgents,
    agentIntegrations,
} from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";
import { resolveCallAgentId } from "@/lib/utils/publicId";

async function loadRuleAuthorized(userId, agentId, ruleId) {
    const rule = await db.query.agentIntegrations.findFirst({
        where: and(
            eq(agentIntegrations.id, ruleId),
            eq(agentIntegrations.agentId, agentId),
        ),
    });
    if (!rule) return { error: "Rule not found", status: 404 };
    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, agentId),
        columns: { creatorId: true },
    });
    if (!agent || agent.creatorId !== userId) {
        return { error: "Not authorized", status: 403 };
    }
    return { rule };
}

export async function PATCH(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    const ruleId = parseInt(params.ruleid, 10);
    if (!agentId || Number.isNaN(ruleId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const authz = await loadRuleAuthorized(userId, agentId, ruleId);
    if (authz.error) return NextResponse.json({ error: authz.error }, { status: authz.status });

    const body = await req.json();
    const updates = {};
    if (typeof body.name === "string") updates.name = body.name.trim();
    if (typeof body.enabled === "boolean") updates.enabled = body.enabled;
    if (body.destinationConfig && typeof body.destinationConfig === "object") {
        updates.destinationConfig = body.destinationConfig;
    }
    if (body.filter && typeof body.filter === "object") {
        updates.filter = body.filter;
    }
    if (body.templateId === null || typeof body.templateId === "number") {
        updates.templateId = body.templateId;
    }
    updates.updatedAt = new Date();

    const [updated] = await db
        .update(agentIntegrations)
        .set(updates)
        .where(eq(agentIntegrations.id, ruleId))
        .returning();

    return NextResponse.json({ rule: updated });
}

export async function DELETE(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    const ruleId = parseInt(params.ruleid, 10);
    if (!agentId || Number.isNaN(ruleId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const authz = await loadRuleAuthorized(userId, agentId, ruleId);
    if (authz.error) return NextResponse.json({ error: authz.error }, { status: authz.status });

    await db.delete(agentIntegrations).where(eq(agentIntegrations.id, ruleId));
    return NextResponse.json({ success: true });
}
