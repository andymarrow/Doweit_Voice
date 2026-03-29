export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { sdkApps } from "@/lib/db/schemaCharacterAI";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

// Utility: Generates a secure, identifiable publishable key
function generatePublicKey() {
    return 'dw_pub_' + crypto.randomBytes(24).toString('hex');
}

// POST: Create a new SDK App connection
export async function POST(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, agentId, domainWhitelist } = body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json({ error: "App name is required" }, { status: 400 });
        }

        // Generate the unique publishable key
        const publicKey = generatePublicKey();

        // Insert into database
        const [newApp] = await db
            .insert(sdkApps)
            .values({
                creatorId: userId,
                name: name.trim(),
                agentId: agentId || null, // Can link to a specific Alan AI agent config
                publicKey: publicKey,
                domainWhitelist: domainWhitelist || [], // e.g. ["localhost", "mywebsite.com"]
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        console.log(`[SDK API] New App created by user ${userId}: ${newApp.name}`);

        return NextResponse.json(newApp, { status: 201 });
    } catch (error) {
        console.error("[SDK API] POST Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET: Fetch all SDK Apps for the logged-in user
export async function GET(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const myApps = await db.query.sdkApps.findMany({
            where: eq(sdkApps.creatorId, userId),
            orderBy: [desc(sdkApps.createdAt)],
        });

        return NextResponse.json(myApps, { status: 200 });
    } catch (error) {
        console.error("[SDK API] GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}