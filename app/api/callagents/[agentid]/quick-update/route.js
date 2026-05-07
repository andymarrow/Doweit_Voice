// app/api/callagents/[agentid]/quick-update/route.js
//
// Used by the Doweit Voice site assistant to apply a single field change
// to the current agent. The site assistant calls `update_agent` with a
// friendly field name (e.g. "enableRecording") and a string value; this
// route translates that into the right DB column / JSONB merge and
// performs an ownership-checked UPDATE.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents } from "@/lib/db/schemaCharacterAI";
import { and, eq } from "drizzle-orm";
import { resolveCallAgentId } from "@/lib/utils/publicId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set(["draft", "active", "paused", "archived"]);

// Coerce the string value the model passed into the right JS type for the
// destination column. Returns { ok: true, value } or { ok: false, error }.
function coerceValue(field, raw) {
    const s = (raw ?? "").toString();
    switch (field) {
        case "name":
        case "prompt":
        case "greetingMessage":
        case "timezone":
            return { ok: true, value: s.trim() };
        case "voiceId":
        case "aiModel":
            return { ok: true, value: s.trim() };
        case "status": {
            const v = s.trim().toLowerCase();
            if (!ALLOWED_STATUSES.has(v)) {
                return { ok: false, error: `Invalid status (must be one of ${[...ALLOWED_STATUSES].join(", ")})` };
            }
            return { ok: true, value: v };
        }
        case "useFillerWords":
        case "enableRecording": {
            const v = s.trim().toLowerCase();
            if (["true", "yes", "on", "1"].includes(v)) return { ok: true, value: true };
            if (["false", "no", "off", "0"].includes(v)) return { ok: true, value: false };
            return { ok: false, error: "Value must be true or false" };
        }
        default:
            return { ok: false, error: `Unknown field '${field}'` };
    }
}

export async function POST(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const { field, value } = body || {};
    if (!field) return NextResponse.json({ error: "field is required" }, { status: 400 });

    const coerced = coerceValue(field, value);
    if (!coerced.ok) {
        return NextResponse.json({ error: coerced.error }, { status: 400 });
    }

    // Ownership + load existing for JSONB merging.
    const existing = await db.query.callAgents.findFirst({
        where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)),
    });
    if (!existing) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Build the update patch.
    const patch = { updatedAt: new Date() };
    let humanLabel = field;
    let humanValue = String(coerced.value);

    switch (field) {
        case "name":
            patch.name = coerced.value;
            humanLabel = "name";
            break;
        case "prompt":
            patch.prompt = coerced.value;
            humanLabel = "system prompt";
            humanValue = coerced.value.length > 60 ? coerced.value.slice(0, 57) + "…" : coerced.value;
            break;
        case "greetingMessage":
            patch.greetingMessage = coerced.value;
            humanLabel = "greeting";
            humanValue = coerced.value;
            break;
        case "voiceId":
            patch.voiceConfig = { ...(existing.voiceConfig || {}), voiceId: coerced.value };
            humanLabel = "voice";
            break;
        case "aiModel":
            patch.aiModel = coerced.value;
            humanLabel = "AI model";
            break;
        case "status":
            patch.status = coerced.value;
            humanLabel = "status";
            break;
        case "useFillerWords":
            patch.useFillerWords = coerced.value;
            humanLabel = "filler words";
            humanValue = coerced.value ? "on" : "off";
            break;
        case "enableRecording":
            patch.callConfig = { ...(existing.callConfig || {}), recordingEnabled: coerced.value };
            humanLabel = "recording";
            humanValue = coerced.value ? "on" : "off";
            break;
        case "timezone":
            patch.timezone = coerced.value;
            humanLabel = "timezone";
            break;
    }

    await db
        .update(callAgents)
        .set(patch)
        .where(and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)));

    return NextResponse.json({
        success: true,
        field,
        label: humanLabel,
        value: humanValue,
    });
}
