// lib/integrations/dispatcher.js
//
// Central fan-out invoked after action values are extracted. For a given
// callId, it:
//   1. Loads the call, its agent, and the per-agent integration rules.
//   2. Loads the connection (encrypted creds) for each rule's provider.
//   3. Builds the variable context.
//   4. For each *enabled* rule whose filter matches, renders the template and
//      sends via the appropriate adapter.
//   5. Logs every attempt to integration_dispatch_log.
//
// Errors in one rule never affect another rule. Errors in the whole pipeline
// are swallowed at the caller (extractor) — they must not break extraction.

import { db } from "@/lib/database";
import {
    calls,
    agentIntegrations,
    messageTemplates,
    callActionValues,
    integrationDispatchLog,
} from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";

import { getConnection } from "./connections";
import {
    buildContext,
    renderTemplate,
    shouldDispatch,
} from "./templateRenderer";
import { getDefaultTemplate } from "./defaultTemplates";

import { postSlackMessage, renderSlackBlocks } from "./adapters/slack";
import { sendTelegramMessage } from "./adapters/telegram";
import { sendEmail } from "./adapters/email";

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
    } catch (e) {
        // Never let logging crash the dispatcher.
        console.error("[DISPATCH] failed to write log:", e?.message);
    }
}

// Public entry point — called by the extractor after callActionValues are
// inserted. Returns nothing; errors are caught and logged.
export async function dispatchIntegrationsForCall(callId) {
    try {
        // 1. Load the call with agent + values + agent's integration rules
        const callRecord = await db.query.calls.findFirst({
            where: eq(calls.id, callId),
            with: {
                agent: { columns: { id: true, name: true, creatorId: true } },
            },
        });
        if (!callRecord || !callRecord.agent) {
            console.warn(`[DISPATCH] call ${callId} not found or missing agent`);
            return;
        }

        const rules = await db.query.agentIntegrations.findMany({
            where: and(
                eq(agentIntegrations.agentId, callRecord.agent.id),
                eq(agentIntegrations.enabled, true),
            ),
            with: { template: true },
        });
        if (rules.length === 0) return;

        // 2. Load extracted action values for this call (with action metadata)
        const valuesRows = await db.query.callActionValues.findMany({
            where: eq(callActionValues.callId, callId),
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

        // 3. Build context once (shared across rules)
        const ctx = buildContext({
            call: callRecord,
            agent: callRecord.agent,
            actionValues,
            baseUrl: getBaseUrl(),
        });

        // 4. Fan out
        for (const rule of rules) {
            await dispatchOneRule({
                rule,
                ctx,
                userId: callRecord.agent.creatorId,
                agentName: callRecord.agent.name,
                callId,
            });
        }
    } catch (e) {
        console.error("[DISPATCH] fatal error:", e?.message, e);
    }
}

// Send to a single configured rule. Each rule failure is isolated.
async function dispatchOneRule({ rule, ctx, userId, agentName, callId }) {
    // Filter
    if (!shouldDispatch(rule.filter, ctx)) {
        await logDispatch(rule.id, callId, "skipped", "filter_did_not_match", null);
        return;
    }

    // Pick template (custom or fallback default for the destination)
    const template =
        rule.template?.body ||
        getDefaultTemplate(rule.provider).body;
    const subject =
        rule.template?.subject ||
        getDefaultTemplate(rule.provider).subject ||
        `Call summary — ${agentName}`;

    const renderedBody = renderTemplate(template, ctx);
    const renderedSubject = renderTemplate(subject, ctx);

    try {
        if (rule.provider === "slack") {
            const conn = await getConnection(userId, "slack");
            if (!conn?.accessToken) throw new Error("Slack not connected");
            const channelId = rule.destinationConfig?.channelId;
            if (!channelId) throw new Error("No Slack channel selected");

            const blocks = renderSlackBlocks({
                body: renderedBody,
                ctx,
                agentName,
            });
            const result = await postSlackMessage({
                token: conn.accessToken,
                channelId,
                text: renderedBody.slice(0, 200),
                blocks,
            });
            await logDispatch(rule.id, callId, "success", `ts=${result.ts}`, {
                channelId,
                renderedBody,
            });
        } else if (rule.provider === "telegram") {
            const token = await getConnection(userId, "telegram");
            if (!token) throw new Error("Telegram not connected");
            const chatId = rule.destinationConfig?.chatId;
            if (!chatId) throw new Error("No Telegram chat ID configured");

            // If user's template already includes {{#each actions}}, the actions
            // list is already in their body — don't double-render it.
            const includeActions = !/\{\{#each\s+actions\s*\}\}/.test(template);

            const result = await sendTelegramMessage({
                token: typeof token === "string" ? token : token.botToken,
                chatId,
                text: renderedBody,
                includeActions,
                ctx,
                agentName,
            });
            await logDispatch(rule.id, callId, "success", `msg=${result.message_id}`, {
                chatId,
                renderedBody,
            });
        } else if (rule.provider === "email") {
            const conn = await getConnection(userId, "email");
            if (!conn) throw new Error("Email (SMTP) not connected");
            const to = rule.destinationConfig?.to;
            if (!to) throw new Error("No email recipients configured");

            const result = await sendEmail({
                config: conn,
                to,
                cc: rule.destinationConfig?.cc,
                bcc: rule.destinationConfig?.bcc,
                subject: renderedSubject,
                body: renderedBody,
                ctx,
                agentName,
            });
            await logDispatch(rule.id, callId, "success", `id=${result.messageId}`, {
                to,
                subject: renderedSubject,
            });
        } else {
            await logDispatch(rule.id, callId, "failed", `unknown_provider=${rule.provider}`, null);
        }
    } catch (e) {
        console.error(`[DISPATCH] rule ${rule.id} (${rule.provider}) failed:`, e?.message);
        await logDispatch(rule.id, callId, "failed", e?.message || "unknown_error", {
            renderedBody,
        });
    }
}

// Public entry point used by the per-rule "Send test" button.
// Builds a fake call context so the rule can be exercised without a real call.
export async function dispatchTestForRule(ruleId, userId) {
    const rule = await db.query.agentIntegrations.findFirst({
        where: eq(agentIntegrations.id, ruleId),
        with: { template: true, agent: true },
    });
    if (!rule) throw new Error("Rule not found");
    if (rule.agent.creatorId !== userId) throw new Error("Not authorized");

    const ctx = buildContext({
        call: {
            id: 0,
            phoneNumber: "+1 555 0100",
            direction: "inbound",
            duration: 124,
            startTime: new Date(),
            summary: "This is a test call summary used to preview your integration.",
        },
        agent: rule.agent,
        actionValues: [
            { name: "customer_name", displayName: "Customer Name", value: "Jane Doe" },
            { name: "order_type", displayName: "Order Type", value: "Pickup" },
            { name: "callback_requested", displayName: "Callback Requested", value: true },
        ],
        baseUrl: getBaseUrl(),
    });

    await dispatchOneRule({
        rule,
        ctx,
        userId,
        agentName: rule.agent.name,
        callId: null,
    });
}
