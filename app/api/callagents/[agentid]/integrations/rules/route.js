export const dynamic = "force-dynamic";
// app/api/callagents/[agentid]/integrations/rules/route.js
//
// CRUD for per-agent integration rules.
//   GET    — list all rules for this agent (with template + recent log entries)
//   POST   — create a new rule

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import {
    callAgents,
    agentIntegrations,
    integrationDispatchLog,
} from "@/lib/db/schemaCharacterAI";
import { eq, and, desc } from "drizzle-orm";
import { resolveCallAgentId } from "@/lib/utils/publicId";

async function authorizeAgent(userId, agentId) {
    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, agentId),
        columns: { id: true, creatorId: true },
    });
    if (!agent) return { error: "Agent not found", status: 404 };
    if (agent.creatorId !== userId) return { error: "Not authorized", status: 403 };
    return { agent };
}

export async function GET(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    const authz = await authorizeAgent(userId, agentId);
    if (authz.error) return NextResponse.json({ error: authz.error }, { status: authz.status });

    const rules = await db.query.agentIntegrations.findMany({
        where: eq(agentIntegrations.agentId, agentId),
        with: { template: true },
        orderBy: [desc(agentIntegrations.createdAt)],
    });

    // Attach the most recent dispatch attempt per rule for at-a-glance health.
    const ruleIds = rules.map((r) => r.id);
    const lastByRule = {};
    if (ruleIds.length > 0) {
        const recent = await db.query.integrationDispatchLog.findMany({
            orderBy: [desc(integrationDispatchLog.createdAt)],
            limit: 200,
        });
        for (const log of recent) {
            if (!lastByRule[log.agentIntegrationId]) {
                lastByRule[log.agentIntegrationId] = log;
            }
        }
    }

    return NextResponse.json({
        rules: rules.map((r) => ({
            ...r,
            lastDispatch: lastByRule[r.id] || null,
        })),
    });
}

export async function POST(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    const authz = await authorizeAgent(userId, agentId);
    if (authz.error) return NextResponse.json({ error: authz.error }, { status: authz.status });

    const body = await req.json();
    const { provider, name, destinationConfig, templateId, filter, enabled } = body || {};

    if (!["slack", "telegram", "email", "calcom"].includes(provider)) {
        return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }
    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [created] = await db
        .insert(agentIntegrations)
        .values({
            agentId,
            provider,
            name: name.trim(),
            destinationConfig: destinationConfig || {},
            templateId: templateId || null,
            filter: filter || { mode: "all_calls" },
            enabled: enabled !== false,
        })
        .returning();

    return NextResponse.json({ rule: created }, { status: 201 });
}
