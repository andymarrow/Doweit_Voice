import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadFileToFirebase } from "@/lib/firebase/upload";

// App Router uses formData natively, so no bodyParser config needed
export const dynamic = "force-dynamic"; // allow streaming requests
export const runtime = "nodejs"; // ensure Node runtime

export async function POST(req) {
	// const { userId } = auth();
	const { user } = await getSession(await headers());
	const userId = user?.id;

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Parse FormData directly (App Router supports this natively)
		const formData = await req.formData();
		const avatarFile = formData.get("avatar"); // expects <input name="avatar" />

		if (!avatarFile || typeof avatarFile === "string") {
			return NextResponse.json(
				{ error: "No valid file uploaded" },
				{ status: 400 },
			);
		}

		// Upload to Firebase
		const downloadUrl = await uploadFileToFirebase(
			avatarFile,
			userId,
			"character-avatars",
		);

		if (!downloadUrl) {
			return NextResponse.json(
				{ error: "Failed to upload image to storage" },
				{ status: 500 },
			);
		}

		// Success
		return NextResponse.json({ url: downloadUrl }, { status: 200 });
	} catch (error) {
		console.error("API Error /api/upload-avatar:", error);
		return NextResponse.json(
			{ error: "Internal server error during upload" },
			{ status: 500 },
		);
	}
}
