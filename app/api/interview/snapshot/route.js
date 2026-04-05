export const dynamic = "force-dynamic";
// app/api/interview/snapshot/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { interviews } from "@/lib/db/schemaCharacterAI";
import { uploadFileToFirebase } from "@/lib/firebase/upload";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("image");
        const sessionId = formData.get("sessionId");
        const agentId = formData.get("agentId");

        if (!file || !sessionId) {
            return NextResponse.json({ error: "Missing file or session ID" }, { status: 400 });
        }

        // 1. Upload to Firebase
        // Path: interviews/{agentId}/{sessionId}/{timestamp}.jpg
        // Note: passing 'sessionId' as userId param to group folders
        const downloadUrl = await uploadFileToFirebase(
            file, 
            `interview_proofs/${agentId}`, 
            sessionId.toString()
        );

        if (!downloadUrl) {
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        // 2. Append URL to the 'screenshots' JSONB array in DB
        // We use PostgreSQL's jsonb_set or a simple append logic if using raw SQL, 
        // but with Drizzle/ORM, fetching and updating is often safer for complex JSON arrays
        
        // Fetch current screenshots
        const currentRecord = await db.query.interviews.findFirst({
            where: eq(interviews.id, parseInt(sessionId)),
            columns: { screenshots: true }
        });

        if (!currentRecord) {
             return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const currentScreenshots = Array.isArray(currentRecord.screenshots) 
            ? currentRecord.screenshots 
            : [];
        
        const updatedScreenshots = [...currentScreenshots, downloadUrl];

        // Update DB
        await db.update(interviews)
            .set({ screenshots: updatedScreenshots })
            .where(eq(interviews.id, parseInt(sessionId)));

        return NextResponse.json({ success: true, url: downloadUrl }, { status: 200 });

    } catch (error) {
        console.error("[Anti-Cheat Upload] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
