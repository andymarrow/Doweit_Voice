// app/api/interview/snapshot/route.js
// Anti-cheat snapshot uploader. Receives one JPEG frame from the
// interview client (multipart/form-data), pushes it to UploadThing, then
// appends { url, capturedAt } to candidate_applications.snapshot_urls.
//
// Self-healing: if the snapshot_urls column doesn't exist (migration 0014
// not applied), the endpoint adds it on the fly and retries.
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { candidateApplications } from "@/lib/db/schemaCharacterAI";
import { eq, sql } from "drizzle-orm";
import { uploadBufferToUT } from "@/lib/uploadthing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UNDEFINED_COLUMN = "42703";

async function ensureSnapshotUrlsColumn() {
    await db.execute(sql`
        ALTER TABLE "candidate_applications"
            ADD COLUMN IF NOT EXISTS "snapshot_urls" jsonb DEFAULT '[]'::jsonb
    `);
}

export async function POST(request) {
    try {
        const form = await request.formData();
        const file = form.get("image");
        const candidateId = form.get("candidateId"); // candidateApplications.publicId or row id
        const sessionId = form.get("sessionId") || null;

        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "image is required" }, { status: 400 });
        }
        if (!candidateId) {
            return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
        }

        // Upload to UploadThing.
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = `interview_${candidateId}_${Date.now()}.jpg`;

        let url = null;
        try {
            url = await uploadBufferToUT(buffer, filename, "image/jpeg");
        } catch (e) {
            console.error("[snapshot] UploadThing failure:", e);
            return NextResponse.json(
                { error: "Upload failed", details: e.message },
                { status: 502 }
            );
        }
        if (!url) {
            // UploadThing not configured — degrade gracefully.
            return NextResponse.json(
                {
                    success: false,
                    skipped: true,
                    reason: "UPLOADTHING_TOKEN not set",
                },
                { status: 200 }
            );
        }

        // Locate the candidate row. candidateId may be either the integer PK or
        // the public string id, so we try both.
        const idAsInt = Number(candidateId);
        const lookup = Number.isFinite(idAsInt)
            ? eq(candidateApplications.id, idAsInt)
            : eq(candidateApplications.publicId, String(candidateId));

        const [existing] = await db
            .select({ id: candidateApplications.id, snapshotUrls: candidateApplications.snapshotUrls })
            .from(candidateApplications)
            .where(lookup);

        if (!existing) {
            return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
        }

        const entry = { url, capturedAt: new Date().toISOString(), sessionId };
        const next = [...(existing.snapshotUrls || []), entry];

        const update = () =>
            db
                .update(candidateApplications)
                .set({ snapshotUrls: next })
                .where(eq(candidateApplications.id, existing.id));

        try {
            await update();
        } catch (err) {
            const code = err?.code || err?.cause?.code;
            const msg = String(err?.message || "");
            const missingColumn = code === UNDEFINED_COLUMN && msg.includes("snapshot_urls");
            if (!missingColumn) throw err;

            console.warn(
                "[snapshot] snapshot_urls column missing — adding it. " +
                    "Run drizzle/0014_candidate_snapshots.sql to make this permanent."
            );
            await ensureSnapshotUrlsColumn();
            await update();
        }

        return NextResponse.json({ success: true, url, count: next.length });
    } catch (e) {
        console.error("[snapshot] error:", e);
        return NextResponse.json(
            { error: "Server Error", details: e.message },
            { status: 500 }
        );
    }
}
