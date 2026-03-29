export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { sdkApps, sdkManifests } from "@/lib/db/schemaCharacterAI";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";
import { resolveSdkAppId } from "@/lib/utils/publicId";

function generatePublicKey() {
    return "dw_pub_" + crypto.randomBytes(24).toString("hex");
}

export async function GET(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    const appId = await resolveSdkAppId(params.appid);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!appId) return NextResponse.json({ error: "App not found" }, { status: 404 });

    try {
        const app = await db.query.sdkApps.findFirst({
            where: and(eq(sdkApps.id, appId), eq(sdkApps.creatorId, userId)),
            with: { agent: true },
        });
        if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });

        const latestManifest = await db.query.sdkManifests.findFirst({
            where: eq(sdkManifests.appId, app.id),
            orderBy: [desc(sdkManifests.version)],
        });

        const allManifests = await db.query.sdkManifests.findMany({
            where: eq(sdkManifests.appId, app.id),
            orderBy: [desc(sdkManifests.version)],
            limit: 10,
        });

        return NextResponse.json({ app, latestManifest, history: allManifests }, { status: 200 });
    } catch (error) {
        console.error("[SDK API GET Single] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    const appId = await resolveSdkAppId(params.appid);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!appId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
        const body = await req.json();
        const { name, domainWhitelist, status, agentId, regenerateKey } = body;

        const existingApp = await db.query.sdkApps.findFirst({
            where: and(eq(sdkApps.id, appId), eq(sdkApps.creatorId, userId)),
        });
        if (!existingApp) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const updateData = { updatedAt: new Date() };
        if (name !== undefined) updateData.name = name;
        if (domainWhitelist !== undefined) updateData.domainWhitelist = domainWhitelist;
        if (status !== undefined) updateData.status = status;
        if (agentId !== undefined) updateData.agentId = agentId === null ? null : Number(agentId);
        if (regenerateKey === true) updateData.publicKey = generatePublicKey();

        const [updatedApp] = await db.update(sdkApps)
            .set(updateData)
            .where(eq(sdkApps.id, appId))
            .returning();

        return NextResponse.json(updatedApp, { status: 200 });
    } catch (error) {
        console.error("[SDK API PATCH] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    const appId = await resolveSdkAppId(params.appid);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!appId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
        const existingApp = await db.query.sdkApps.findFirst({
            where: and(eq(sdkApps.id, appId), eq(sdkApps.creatorId, userId)),
        });
        if (!existingApp) return NextResponse.json({ error: "Not found" }, { status: 404 });

        await db.delete(sdkApps).where(eq(sdkApps.id, appId));
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[SDK API DELETE] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
