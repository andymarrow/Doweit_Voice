export const dynamic = "force-dynamic";
export const maxDuration = 60;
// app/api/callagents/[agentid]/integrations/rules/[ruleid]/send-to-calls/route.js
//
// Manually fires a rule for each selected past call. Reuses the dispatcher's
// per-rule "send" path so the message is rendered with REAL data (not the
// fake test-call sample) and a row is written to integration_dispatch_log
// just like an automatic post-call send. Great for demos: a real call's
// extracted data lands in Slack/Telegram/Email on demand.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import {
    callAgents,
    calls,
    agentIntegrations,
    callActionValues,
} from "@/lib/db/schemaCharacterAI";
import { eq, and, inArray } from "drizzle-orm";
import { resolveCallAgentId } from "@/lib/utils/publicId";
import { getConnection } from "@/lib/integrations/connections";
import { buildContext, renderTemplate, shouldDispatch } from "@/lib/integrations/templateRenderer";
import { getDefaultTemplate } from "@/lib/integrations/defaultTemplates";
import { postSlackMessage, renderSlackBlocks } from "@/lib/integrations/adapters/slack";
import { sendTelegramMessage } from "@/lib/integrations/adapters/telegram";
import { sendEmail } from "@/lib/integrations/adapters/email";
import { integrationDispatchLog } from "@/lib/db/schemaCharacterAI";

function getBaseUrl() {
    return (
        process.env.BASE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "http://localhost:3000"
    );
}

async function logDispatch(agentIntegrationId, callId, status, detail, payload) {
    try {
        await db.insert(integrationDispatchLog).values({
            agentIntegrationId,
            callId,
            status,
            detail: detail ? String(detail).slice(0, 2000) : null,
            payload: payload || null,
        });
    } catch {
        /* logging is best-effort */
    }
}

// One-shot send for a single call against a specific rule. Mirrors the
// per-rule logic in lib/integrations/dispatcher.js but without re-loading the
// rule list (caller already has it).
async function sendOneCall({ rule, callRecord, userId, agent }) {
    if (rule.provider === "calcom") {
        // calcom is a mid-call capability, not a destination — skip silently.
        return { status: "skipped", detail: "calcom rules do not send messages" };
    }

    // Pull values + agent action metadata for the context.
    const valuesRows = await db.query.callActionValues.findMany({
        where: eq(callActionValues.callId, callRecord.id),
        with: {
            agentAction: { with: { action: true } },
        },
    });
    const actionValues = valuesRows
        .filter((v) => v.agentAction?.action)
        .map((v) => ({
            name: v.agentAction.action.name,
            displayName: v.agentAction.action.displayName,
            value: v.value,
            rawValue: v.rawValue,
        }));

    const ctx = buildContext({
        call: callRecord,
        agent,
        actionValues,
        baseUrl: getBaseUrl(),
    });

    if (!shouldDispatch(rule.filter, ctx)) {
        return { status: "skipped", detail: "filter_did_not_match" };
    }

    const template = rule.template?.body || getDefaultTemplate(rule.provider).body;
    const subject =
        rule.template?.subject ||
        getDefaultTemplate(rule.provider).subject ||
        `Call summary — ${agent.name}`;
    const renderedBody = renderTemplate(template, ctx);
    const renderedSubject = renderTemplate(subject, ctx);

    if (rule.provider === "slack") {
        const conn = await getConnection(userId, "slack");
        if (!conn?.accessToken) throw new Error("Slack not connected");
        const channelId = rule.destinationConfig?.channelId;
        if (!channelId) throw new Error("No Slack channel configured");
        const blocks = renderSlackBlocks({ body: renderedBody, ctx, agentName: agent.name });
        const r = await postSlackMessage({
            token: conn.accessToken,
            channelId,
            text: renderedBody.slice(0, 200),
            blocks,
        });
        return { status: "success", detail: `ts=${r.ts}` };
    }

    if (rule.provider === "telegram") {
        const token = await getConnection(userId, "telegram");
        if (!token) throw new Error("Telegram not connected");
        const chatId = rule.destinationConfig?.chatId;
        if (!chatId) throw new Error("No Telegram chat ID configured");
        const includeActions = !/\{\{#each\s+actions\s*\}\}/.test(template);
        const r = await sendTelegramMessage({
            token: typeof token === "string" ? token : token.botToken,
            chatId,
            text: renderedBody,
            includeActions,
            ctx,
            agentName: agent.name,
        });
        return { status: "success", detail: `msg=${r.message_id}` };
    }

    if (rule.provider === "email") {
        const conn = await getConnection(userId, "email");
        if (!conn) throw new Error("Email (SMTP) not connected");
        const to = rule.destinationConfig?.to;
        if (!to) throw new Error("No recipients");
        const r = await sendEmail({
            config: conn,
            to,
            cc: rule.destinationConfig?.cc,
            bcc: rule.destinationConfig?.bcc,
            subject: renderedSubject,
            body: renderedBody,
            ctx,
            agentName: agent.name,
        });
        return { status: "success", detail: `id=${r.messageId}` };
    }

    return { status: "failed", detail: `unknown_provider=${rule.provider}` };
}

export async function POST(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    const ruleId = parseInt(params.ruleid, 10);
    if (!agentId || Number.isNaN(ruleId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const callIds = Array.isArray(body?.callIds)
        ? body.callIds.map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n))
        : [];
    if (callIds.length === 0) {
        return NextResponse.json({ error: "Pick at least one call" }, { status: 400 });
    }
    if (callIds.length > 50) {
        return NextResponse.json({ error: "Pick at most 50 calls per batch" }, { status: 400 });
    }

    const rule = await db.query.agentIntegrations.findFirst({
        where: and(
            eq(agentIntegrations.id, ruleId),
            eq(agentIntegrations.agentId, agentId),
        ),
        with: { template: true },
    });
    if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });

    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, agentId),
        columns: { id: true, creatorId: true, name: true },
    });
    if (!agent || agent.creatorId !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Load the calls (only if owned by this agent).
    const callRows = await db.query.calls.findMany({
        where: and(eq(calls.agentId, agentId), inArray(calls.id, callIds)),
    });

    const results = [];
    for (const callRecord of callRows) {
        try {
            const r = await sendOneCall({ rule, callRecord, userId, agent });
            await logDispatch(rule.id, callRecord.id, r.status, r.detail, null);
            results.push({ callId: callRecord.id, ...r });
        } catch (e) {
            console.error(`[SEND-TO-CALLS] call ${callRecord.id} failed:`, e?.message);
            await logDispatch(rule.id, callRecord.id, "failed", e?.message, null);
            results.push({ callId: callRecord.id, status: "failed", detail: e?.message });
        }
    }

    const sent = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    return NextResponse.json({ sent, failed, skipped, results });
}
