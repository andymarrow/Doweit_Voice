export const dynamic = "force-dynamic";
// app/api/callagents/[agentid]/integrations/rules/[ruleid]/test/route.js
//
// "Send test" button on the rule editor — fires a fake call through the
// dispatcher so the user can verify Slack/Telegram/Email plumbing without
// having to make a real call.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { dispatchTestForRule } from "@/lib/integrations/dispatcher";

export async function POST(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ruleId = parseInt(params.ruleid, 10);
    if (Number.isNaN(ruleId)) {
        return NextResponse.json({ error: "Invalid rule id" }, { status: 400 });
    }

    try {
        await dispatchTestForRule(ruleId, userId);
        return NextResponse.json({ success: true });
    } catch (e) {
        const status = e?.message === "Not authorized" ? 403 :
                       e?.message === "Rule not found" ? 404 : 500;
        return NextResponse.json({ error: e?.message || "Test failed" }, { status });
    }
}
