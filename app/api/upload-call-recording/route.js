import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadFile } from "@/lib/uploadthing/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
	const { user } = await getSession(await headers());
	const userId = user?.id;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await req.formData();
		const file = formData.get("file");
		if (!file || typeof file === "string") {
			return NextResponse.json(
				{ error: "No valid file uploaded" },
				{ status: 400 },
			);
		}

		const url = await uploadFile(file, userId, "calls");
		if (!url) {
			return NextResponse.json(
				{ error: "Failed to upload recording" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ url }, { status: 200 });
	} catch (error) {
		console.error("API Error /api/upload-call-recording:", error);
		return NextResponse.json(
			{ error: "Internal server error during upload" },
			{ status: 500 },
		);
	}
}
