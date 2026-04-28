// lib/uploadthing/server.js
// Server-side UploadThing helpers. Mirrors the API surface of the old
// lib/firebase/upload.js + lib/firebase/storage.js so call-site changes
// stay minimal: uploadFile(file, userId, folderPath) and deleteFileByUrl(url).

import { UTApi, UTFile } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Upload a file to UploadThing.
 * Accepts a browser/Node File, a Blob, a Buffer, or an ArrayBuffer/typed array.
 * userId/folderPath are kept for parity with the previous Firebase signature
 * and are attached as customId metadata so uploads remain attributable.
 *
 * @param {File|Blob|Buffer|ArrayBuffer|Uint8Array} file
 * @param {string} userId
 * @param {string} [folderPath]
 * @returns {Promise<string|null>} Public URL of the uploaded file, or null on failure.
 */
export async function uploadFile(file, userId, folderPath = "uploads") {
	if (!file) {
		console.error("uploadFile: no file provided");
		return null;
	}
	if (!userId) {
		console.error("uploadFile: no userId provided");
		return null;
	}

	let toUpload;
	const baseName = `${folderPath.replace(/[^a-zA-Z0-9_-]/g, "_")}-${Date.now()}`;

	if (typeof File !== "undefined" && file instanceof File) {
		toUpload = file;
	} else if (typeof Blob !== "undefined" && file instanceof Blob) {
		const ext = (file.type || "").split("/")[1] || "bin";
		toUpload = new UTFile([file], `${baseName}.${ext}`, {
			type: file.type || "application/octet-stream",
			customId: `${userId}/${folderPath}/${baseName}`,
		});
	} else if (
		Buffer.isBuffer(file) ||
		file instanceof ArrayBuffer ||
		ArrayBuffer.isView(file)
	) {
		const data = Buffer.isBuffer(file) ? file : Buffer.from(file);
		toUpload = new UTFile([data], `${baseName}.bin`, {
			customId: `${userId}/${folderPath}/${baseName}`,
		});
	} else {
		console.error("uploadFile: unsupported file type", typeof file);
		return null;
	}

	try {
		const result = await utapi.uploadFiles(toUpload);
		if (result?.error) {
			console.error("UploadThing upload error:", result.error);
			return null;
		}
		return result?.data?.ufsUrl || result?.data?.url || null;
	} catch (e) {
		console.error("UploadThing upload exception:", e);
		return null;
	}
}

/**
 * Delete a file by its public URL.
 * Legacy Firebase URLs are silently ignored (hybrid state — old assets stay).
 *
 * @param {string} fileUrl
 */
export async function deleteFileByUrl(fileUrl) {
	if (!fileUrl) return;

	// UploadThing URLs always contain "/f/<key>". Anything else (e.g. legacy
	// firebasestorage.googleapis.com) is left alone.
	if (!fileUrl.includes("/f/")) return;

	const key = fileUrl.split("/f/").pop()?.split("?")[0];
	if (!key) return;

	try {
		await utapi.deleteFiles([key]);
	} catch (e) {
		console.warn(`UploadThing delete failed for ${fileUrl}:`, e);
	}
}
