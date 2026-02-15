export const dynamic = "force-dynamic";
// app/api/integrations/connect/email/route.js
//
// Stores a user's SMTP credentials. Verifies the credentials by opening a
// connection (transport.verify()) before persisting.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { saveConnection } from "@/lib/integrations/connections";
import { verifyTransport } from "@/lib/integrations/adapters/email";

export async function POST(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { host, port, secure, smtpUser, password, fromName, fromEmail } = body || {};

    if (!host || !smtpUser || !password) {
        return NextResponse.json(
            { error: "host, smtpUser and password are required" },
            { status: 400 },
        );
    }

    const config = {
        host: String(host).trim(),
        port: Number(port) || 587,
        secure: !!secure,
        user: String(smtpUser).trim(),
        password: String(password),
        fromName: fromName ? String(fromName).trim() : undefined,
        fromEmail: fromEmail ? String(fromEmail).trim() : undefined,
    };

    try {
        await verifyTransport(config);
    } catch (e) {
        console.error("[EMAIL CONNECT] SMTP verify failed:", e?.message);
        return NextResponse.json(
            {
                error:
                    "Could not connect to the SMTP server with those credentials. " +
                    (e?.message || "Check host/port/credentials and try again."),
            },
            { status: 400 },
        );
    }

    await saveConnection(userId, "email", config);
    return NextResponse.json({ success: true });
}
