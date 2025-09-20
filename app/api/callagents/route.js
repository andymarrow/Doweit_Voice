// app/api/callagents/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents } from "@/lib/db/schemaCharacterAI"; // Import Agent schema
import { eq, desc } from "drizzle-orm";

// --- GET function: Fetch list of user's agents ---
// GET /api/callagents
export async function GET() {
	// const { userId } = auth();
	const { user } = await getSession(await headers());
	const userId = user?.id;

	if (!userId) {
		console.log("[API AGENT LIST GET] Unauthorized: No userId.");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		console.log(`[API AGENT LIST GET] Fetching agents for user ${userId}`);

		// Fetch all agents created by the current user
		const myAgents = await db.query.callAgents.findMany({
			where: eq(callAgents.creatorId, userId),
			orderBy: [desc(callAgents.createdAt)], // Order by creation date, newest first
			// Select specific fields needed for the agent selector dropdown/list
			columns: {
				id: true,
				name: true,
				type: true, // inbound/outbound
				status: true, // active/paused etc.
				// Add other basic fields useful for identifying the agent
			},
		});

		console.log(
			`[API AGENT LIST GET] Found ${myAgents.length} agents for user ${userId}.`,
		);

		// Return the list of agents
		return NextResponse.json(myAgents, { status: 200 });
	} catch (error) {
		console.error("API Error /api/callagents (GET):", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// Note: The POST /api/callagents endpoint for creating new agents would also go in this file,
// but it wasn't explicitly requested in this step. It's implied by your file structure.
// For this workflow page, we only need the GET.
