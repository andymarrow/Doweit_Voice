// lib/uploadthing.js
// Server-side UploadThing client. Used by /api/interview/snapshot to push
// anti-cheat photos to UploadThing storage.
//
// Requires UPLOADTHING_TOKEN in .env.local (V7 token from
// https://uploadthing.com/dashboard).
import { UTApi } from "uploadthing/server";

let _utapi = null;

export function getUTApi() {
    if (!process.env.UPLOADTHING_TOKEN) return null;
    if (!_utapi) {
        _utapi = new UTApi();
    }
    return _utapi;
}

// Upload a single Buffer/Blob to UploadThing and return the public URL.
// Returns null if UploadThing is not configured.
export async function uploadBufferToUT(buffer, filename, mimeType = "image/jpeg") {
    const utapi = getUTApi();
    if (!utapi) {
        console.warn("[uploadthing] UPLOADTHING_TOKEN missing — skipping upload.");
        return null;
    }
    const file = new File([buffer], filename, { type: mimeType });
    const res = await utapi.uploadFiles([file]);
    const first = Array.isArray(res) ? res[0] : res;
    if (first?.error) throw new Error(first.error.message || "UploadThing upload failed");
    return first?.data?.url || first?.data?.ufsUrl || null;
}
