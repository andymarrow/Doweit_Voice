export const dynamic = "force-dynamic";
export const maxDuration = 30;
// app/api/callagents/[agentid]/integrations/generate-template/route.js
//
// Uses Gemini to write a destination-specific message template that's actually
// useful for THIS agent — by feeding the model the agent's prompt, knowledge
// base, and configured actions. The user clicks a "Refresh / Generate from
// agent context" button on the rule editor and gets a body that already
// references the right `{{action.<name>}}` variables.

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents } from "@/lib/db/schemaCharacterAI";
import { eq } from "drizzle-orm";
import { resolveCallAgentId } from "@/lib/utils/publicId";

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GEMNI_API_KEY;
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

const DESTINATION_GUIDE = {
    slack:
        "Slack mrkdwn (single asterisks for *bold*, single underscores for _italic_, " +
        "backticks for `code`). Be concise — Slack messages are scanned in under 3 seconds. " +
        "Use a short headline + 1–2 bullet lines + the action variables.",
    telegram:
        "Telegram MarkdownV2. CRITICAL: literal characters . - + = | ( ) { } # ! must be " +
        "backslash-escaped (e.g. write '\\.' not '.'). Use *bold*, _italic_, `code`. " +
        "Keep under 8 lines.",
    email:
        "Markdown-ish: **bold**, *italic*, [link](url), and blank lines for paragraphs. " +
        "Write a friendly business email, 2–4 short paragraphs. Don't include a subject — " +
        "that's a separate field. Don't manually list every action; the platform appends a " +
        "table automatically. Just reference the most important 1-2 actions inline.",
};

function fallbackTemplate(destination, actionNames) {
    const firstAction = actionNames[0];
    const actionLine = firstAction
        ? `Caller details: {{action.${firstAction}}} — phone {{call.phoneNumber}}.`
        : `From: {{call.phoneNumber}} ({{call.direction}}, {{call.duration}})`;

    if (destination === "slack") {
        return {
            body:
                `*New ${actionNames.length ? "lead" : "call"} from your agent*\n` +
                `${actionLine}\n\n` +
                `{{#if call.summary}}> {{call.summary}}{{/if}}`,
            subject: null,
        };
    }
    if (destination === "telegram") {
        return {
            body:
                `*New call wrapped up*\n` +
                actionLine.replace(/\./g, "\\.") +
                `\n\n{{#if call.summary}}{{call.summary}}{{/if}}`,
            subject: null,
        };
    }
    return {
        body:
            `Hi,\n\n` +
            `**{{call.agentName}}** just finished a {{call.direction}} call ({{call.duration}}).\n\n` +
            (firstAction
                ? `Key info: {{action.${firstAction}}}\n\n`
                : `From {{call.phoneNumber}}.\n\n`) +
            `{{#if call.summary}}**Summary:** {{call.summary}}{{/if}}\n`,
        subject: `Call summary — {{call.agentName}}`,
    };
}

export async function POST(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agentId = await resolveCallAgentId(params.agentid);
    if (!agentId)
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const { destination } = await req.json();
    if (!["slack", "telegram", "email"].includes(destination)) {
        return NextResponse.json(
            { error: "destination must be slack | telegram | email" },
            { status: 400 },
        );
    }

    const agent = await db.query.callAgents.findFirst({
        where: eq(callAgents.id, agentId),
        with: {
            agentActions: { with: { action: true } },
            knowledgeBase: true,
        },
    });
    if (!agent)
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (agent.creatorId !== userId)
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const actionList = (agent.agentActions || [])
        .filter((aa) => aa?.action)
        .map((aa) => ({
            name: aa.action.name,
            displayName: aa.action.displayName || aa.action.name,
            description: aa.action.description || "",
            type: aa.action?.config?.type || "text",
        }));
    const actionNames = actionList.map((a) => a.name);

    // Without Gemini, fall back to a sensible static template that already
    // uses the agent's first action variable.
    if (!genAI) {
        return NextResponse.json({
            ...fallbackTemplate(destination, actionNames),
            generatedBy: "fallback",
        });
    }

    const kbExcerpt = (() => {
        const c = agent.knowledgeBase?.content;
        if (!Array.isArray(c)) return "";
        return c
            .map((item) => (typeof item === "string" ? item : item?.value || ""))
            .filter(Boolean)
            .join("\n")
            .slice(0, 2000);
    })();

    const prompt = `You are writing a post-call notification template for an AI voice agent built on the Doweit Voice platform. The user wants the message that gets sent every time this agent finishes a call.

Write a concise, professional template body for the destination: **${destination.toUpperCase()}**.

Format rules for this destination:
${DESTINATION_GUIDE[destination]}

The template body uses **mustache-style placeholders** that the renderer substitutes at send time:
- {{call.agentName}}, {{call.phoneNumber}}, {{call.direction}}, {{call.duration}}, {{call.startedAt}}, {{call.summary}}, {{call.transcriptUrl}}
- {{action.<name>}} for each extracted action — list below
- {{#if action.<name>}}…{{/if}} for conditional blocks
- {{#each actions}}{{name}}: {{value}}{{/each}} to loop over all actions

**The agent's purpose (from its system prompt):**
"""
${(agent.prompt || "(no prompt set)").slice(0, 1500)}
"""

${kbExcerpt ? `**Knowledge base excerpt** (use ONLY for tone/domain context, not as content):\n"""\n${kbExcerpt}\n"""\n` : ""}

**Configured actions for this agent** (use the EXACT \`name\` values when referencing them):
${
    actionList.length
        ? actionList
              .map(
                  (a) =>
                      `- name=\`${a.name}\` · "${a.displayName}" · ${a.description || "no description"} · type=${a.type}`,
              )
              .join("\n")
        : "(no actions configured yet — write a generic call-summary template)"
}

Write a template that:
1. References the most relevant 2–4 actions inline using {{action.<name>}}
2. Uses {{#if action.<name>}} blocks for actions that may be missing on some calls
3. Reads naturally for the recipient (a teammate getting notified, NOT the caller)
4. Fits the destination format guidance above
${destination === "email" ? '5. Also write a short subject line — return it as `subject` separately.\n' : ""}

Respond with **valid JSON only** in this shape:
${
    destination === "email"
        ? '{ "body": "<the email body markdown>", "subject": "<short subject with optional {{vars}}>" }'
        : '{ "body": "<the message body>" }'
}

Do not wrap in code fences. Do not include any prose before or after the JSON.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const raw = result.response.text();

        // Strip markdown code-fence if Gemini added one anyway.
        const cleaned = raw
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();

        let json;
        try {
            json = JSON.parse(cleaned);
        } catch {
            console.error("[GENERATE TEMPLATE] Gemini returned non-JSON:", raw);
            return NextResponse.json({
                ...fallbackTemplate(destination, actionNames),
                generatedBy: "fallback_after_parse_failure",
            });
        }

        if (!json.body || typeof json.body !== "string") {
            return NextResponse.json({
                ...fallbackTemplate(destination, actionNames),
                generatedBy: "fallback_missing_body",
            });
        }

        return NextResponse.json({
            body: json.body,
            subject: typeof json.subject === "string" ? json.subject : null,
            generatedBy: "gemini",
        });
    } catch (e) {
        console.error("[GENERATE TEMPLATE] Gemini call failed:", e?.message);
        return NextResponse.json({
            ...fallbackTemplate(destination, actionNames),
            generatedBy: "fallback_after_error",
        });
    }
}
