export const dynamic = "force-dynamic";
export const maxDuration = 30;
// app/api/integrations/calcom/tool/route.js
//
// Vapi server-tool webhook. Configured as the `server.url` on Cal.com
// function tools attached to an assistant. Vapi POSTs here every time the
// assistant invokes `check_availability` / `create_booking` / etc. We
// dispatch to the tool handler and return Vapi's expected response shape.

import { NextResponse } from "next/server";
import { handleToolCall } from "@/lib/integrations/calcom/toolHandler";

export async function POST(req) {
    try {
        const body = await req.json();
        const results = await handleToolCall(body);

        // Vapi expects { results: [{ toolCallId, result }] }. If our handler
        // produced plain string results without toolCallIds (e.g. from a
        // legacy single-function-call payload), Vapi will still consume the
        // first one — but match the documented shape when we can.
        return NextResponse.json({ results });
    } catch (e) {
        console.error("[CALCOM TOOL ROUTE]", e);
        return NextResponse.json(
            { results: [{ result: `Sorry, I had a problem: ${e?.message || "unknown"}.` }] },
            { status: 200 }, // 200 so Vapi reads the error message back to the caller
        );
    }
}
