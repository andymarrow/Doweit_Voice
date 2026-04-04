export const dynamic = "force-dynamic";
// app/api/sdk/site-assistant/bootstrap/route.js
//
// One-shot setup endpoint for the global Doweit Voice site-assistant widget.
// Idempotent: if the user already has a "Doweit Voice Site Assistant" SDK
// app it's reused; otherwise we create it. We always upsert the latest
// manifest so updates to lib/siteAssistant/manifest.js take effect on the
// next bootstrap call without manual SQL.
//
// Returns the publicKey, which the user then drops into .env.local as
// NEXT_PUBLIC_DOWEIT_SITE_PUBLIC_KEY.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import {
    sdkApps,
    sdkManifests,
    callAgents,
} from "@/lib/db/schemaCharacterAI";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

import {
    SITE_ASSISTANT_ACTIONS,
    buildSiteAssistantSystemPrompt,
} from "@/lib/siteAssistant/manifest";

const APP_NAME = "Doweit Voice Site Assistant";

function generatePublicKey() {
    return "dw_pub_" + crypto.randomBytes(24).toString("hex");
}

async function findOrCreateAgent(userId) {
    // Reuse any existing site-assistant agent if present so multiple bootstraps
    // don't pile up. We tag it with a stable name + the user.
    const existing = await db.query.callAgents.findFirst({
        where: and(
            eq(callAgents.creatorId, userId),
            eq(callAgents.name, APP_NAME),
        ),
    });
    if (existing) {
        // Refresh the prompt every time so we pick up manifest updates.
        await db
            .update(callAgents)
            .set({
                prompt: buildSiteAssistantSystemPrompt(),
                updatedAt: new Date(),
            })
            .where(eq(callAgents.id, existing.id));
        return existing;
    }

    const [created] = await db
        .insert(callAgents)
        .values({
            creatorId: userId,
            name: APP_NAME,
            type: "inbound",
            prompt: buildSiteAssistantSystemPrompt(),
            greetingMessage:
                "Hi! Tell me where you want to go and I'll take you there.",
            voiceConfig: {
                voiceProvider: "vapi",
                voiceId: "Aoede",
            },
            callConfig: {},
            status: "active",
        })
        .returning();
    return created;
}

async function findOrCreateApp(userId, agentId) {
    const existing = await db.query.sdkApps.findFirst({
        where: and(eq(sdkApps.creatorId, userId), eq(sdkApps.name, APP_NAME)),
    });
    if (existing) {
        return existing;
    }
    const [created] = await db
        .insert(sdkApps)
        .values({
            creatorId: userId,
            agentId,
            name: APP_NAME,
            publicKey: generatePublicKey(),
            domainWhitelist: [],
            status: "active",
        })
        .returning();
    return created;
}

async function upsertManifest(appId) {
    // Find the latest version, bump it. Versioning lets us roll back if a
    // manifest update breaks production.
    const latest = await db.query.sdkManifests.findFirst({
        where: eq(sdkManifests.appId, appId),
        orderBy: [desc(sdkManifests.version)],
    });
    const nextVersion = latest ? (latest.version || 0) + 1 : 1;

    const [created] = await db
        .insert(sdkManifests)
        .values({
            appId,
            version: nextVersion,
            environment: "production",
            actions: SITE_ASSISTANT_ACTIONS,
            stateSchema: { currentPath: "string" },
            publishedAt: new Date(),
        })
        .returning();
    return created;
}

export async function POST() {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const agent = await findOrCreateAgent(userId);
        const app = await findOrCreateApp(userId, agent.id);
        const manifest = await upsertManifest(app.id);

        return NextResponse.json({
            success: true,
            publicKey: app.publicKey,
            agentId: agent.id,
            appId: app.id,
            manifestVersion: manifest.version,
            envHint:
                "Add this to .env.local then restart `npm run dev`:\n" +
                `NEXT_PUBLIC_DOWEIT_SITE_PUBLIC_KEY=${app.publicKey}`,
        });
    } catch (e) {
        console.error("[SITE ASSISTANT BOOTSTRAP]", e);
        return NextResponse.json(
            { error: e?.message || "Bootstrap failed" },
            { status: 500 },
        );
    }
}

export async function GET() {
    // Convenience for clicking the URL in a browser — same behaviour as POST.
    return POST();
}
