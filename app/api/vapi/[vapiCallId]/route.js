// app/api/vapi/[vapiCallId]/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";

// This route acts as a secure proxy to the Vapi API.
export async function GET(req, { params }) {
	const { user } = await getSession(await headers());
	const userId = user?.id;
	// const { userId } = auth();
	const { vapiCallId } = params;

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!vapiCallId) {
		return NextResponse.json(
			{ error: "Vapi Call ID is required" },
			{ status: 400 },
		);
	}

	// Ensure you have your VAPI Private Key in environment variables
	const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
	if (!VAPI_PRIVATE_KEY) {
		console.error("VAPI_PRIVATE_KEY is not set.");
		return NextResponse.json(
			{ error: "Server configuration error" },
			{ status: 500 },
		);
	}

	try {
		const response = await fetch(`https://api.vapi.ai/call/${vapiCallId}`, {
			headers: {
				Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error(
				`Failed to fetch call details from Vapi for ID ${vapiCallId}:`,
				errorData,
			);
			throw new Error(errorData.message || "Failed to fetch call from Vapi.");
		}

		const data = await response.json();

		// Return the full Vapi call object
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error(`[API VAPI PROXY] Error for call ${vapiCallId}:`, error);
		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
