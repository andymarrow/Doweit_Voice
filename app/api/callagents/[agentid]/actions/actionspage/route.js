// app/api/callagents/[agentid]/actionspage/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { actions } from "@/lib/db/schemaCharacterAI"; // Import the actions schema
import { eq, or, isNull } from "drizzle-orm";

// --- GET function: Fetch available global actions ---
export async function GET(req) {
	// const { userId } = auth();
	const {
		user,
	} = await getSession(await headers());
	const userId = user?.id;

	if (!userId) {
		// If not authenticated, maybe only return public/system actions?
		// Or return 401 Unauthorized if all actions require auth.
		// Let's assume all actions require auth for now, or at least need userId for filtering.
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		console.log(
			`[API ACTIONS GET] Fetching available actions for user ${userId}`,
		);

		// Fetch actions that are either owned by the user OR are system/template actions
		// Adjust the WHERE clause based on how you identify system/template actions in your `actions` table.
		// Assuming `creatorId = null` for system/template actions:
		const availableActions = await db.query.actions.findMany({
			where: or(
				isNull(actions.creatorId), // System/Template actions
				eq(actions.creatorId, userId), // Actions created by the current user
			),
			// Select relevant fields for displaying in the modal
			columns: {
				id: true,
				name: true,
				displayName: true, // Might use display name in UI
				description: true, // Useful for modal details
				type: true, // 'Information Extractor', 'Action Type'
				config: true, // Might need config to show details like options for Choice
				source: true, // 'custom', 'template', 'system'
				// Add other relevant fields
			},
			orderBy: [actions.name], // Order alphabetically
		});

		console.log(
			`[API ACTIONS GET] Found ${availableActions.length} available actions for user ${userId}`,
		);

		return NextResponse.json(availableActions, { status: 200 });
	} catch (error) {
		console.error(
			`[API ACTIONS GET] Database error fetching available actions for user ${userId}:`,
			error,
		);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// Note: You might add POST/PATCH/DELETE methods here later if users can create/edit/delete global actions.
