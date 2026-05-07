// app/api/callagents/[agentid]/avatar/route.js
// Accepts a multipart/form-data POST with a single `file` field.
// Uploads to UploadThing, persists the URL on the agent row, and returns it.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents } from "@/lib/db/schemaCharacterAI";
import { and, eq } from "drizzle-orm";
import { uploadFile } from "@/lib/uploadthing/server";
import { resolveCallAgentId } from "@/lib/utils/publicId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    const agentId = await resolveCallAgentId(params.agentid);

    if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!agentId)
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    let formData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!file || typeof file === "string")
        return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Verify the agent belongs to this user
    const agent = await db.query.callAgents.findFirst({
        where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)),
        columns: { id: true },
    });
    if (!agent)
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const avatarUrl = await uploadFile(file, userId, "agent-avatars");
    if (!avatarUrl)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });

    await db
        .update(callAgents)
        .set({ avatarUrl, updatedAt: new Date() })
        .where(and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)));

    return NextResponse.json({ avatarUrl });
}
