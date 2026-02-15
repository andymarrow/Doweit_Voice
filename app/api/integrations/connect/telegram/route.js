export const dynamic = "force-dynamic";
// app/api/integrations/connect/telegram/route.js
//
// Stores a user's Telegram bot token. Validates by calling Telegram's getMe
// before persisting so we never save broken credentials.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { saveConnection } from "@/lib/integrations/connections";
import { validateBotToken } from "@/lib/integrations/adapters/telegram";

export async function POST(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { botToken } = await req.json();
    if (!botToken || typeof botToken !== "string") {
        return NextResponse.json(
            { error: "Bot token is required" },
            { status: 400 },
        );
    }

    try {
        const me = await validateBotToken(botToken.trim());
        await saveConnection(userId, "telegram", botToken.trim());
        return NextResponse.json({
            success: true,
            bot: { username: me.username, name: me.first_name, id: me.id },
        });
    } catch (e) {
        console.error("[TELEGRAM CONNECT] validation failed:", e?.message);
        return NextResponse.json(
            { error: "Invalid Telegram bot token. Double-check it with @BotFather." },
            { status: 400 },
        );
    }
}
