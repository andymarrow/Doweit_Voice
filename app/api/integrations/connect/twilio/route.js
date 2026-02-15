export const dynamic = "force-dynamic";
// app/api/integrations/connect/twilio/route.js
//
// Stores Twilio Account SID + Auth Token. Validates by fetching the account
// before persisting.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { saveConnection } from "@/lib/integrations/connections";
import { validateCredentials } from "@/lib/integrations/adapters/twilio";

export async function POST(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountSid, authToken } = await req.json();
    if (!accountSid || !authToken) {
        return NextResponse.json(
            { error: "Account SID and Auth Token are both required" },
            { status: 400 },
        );
    }
    if (!/^AC[a-fA-F0-9]{32}$/.test(accountSid.trim())) {
        return NextResponse.json(
            { error: "Account SID should look like ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
            { status: 400 },
        );
    }

    const conn = {
        accountSid: accountSid.trim(),
        authToken: authToken.trim(),
    };

    try {
        const account = await validateCredentials(conn);
        await saveConnection(userId, "twilio", conn);
        return NextResponse.json({
            success: true,
            account: {
                friendlyName: account.friendly_name,
                status: account.status,
            },
        });
    } catch (e) {
        console.error("[TWILIO CONNECT] validation failed:", e?.message);
        return NextResponse.json(
            { error: "Twilio rejected those credentials. Double-check the SID and Auth Token." },
            { status: 400 },
        );
    }
}
