// app/api/callagents/[agentid]/workflow/route.js

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents, agentActions } from "@/lib/db/schemaCharacterAI"; // Import necessary schemas
import { eq, and, or, isNull } from "drizzle-orm";

export async function GET(req, { params }) {
	// const { userId } = auth();
	const { user } = await getSession(await headers());
	const userId = user?.id;
	const agentId = parseInt(params.agentid, 10);

	if (isNaN(agentId)) {
		return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
	}

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		console.log(
			`[API AGENT ACTIONS GET] Fetching actions for agent ${agentId} (user ${userId})`,
		);

		// Fetch agentActions for this agent, joining with the actions table
		// Ensure the agent belongs to the user for security
		const agentSpecificActions = await db.query.agentActions.findMany({
			where: eq(agentActions.agentId, agentId),
			// Join with callAgents to verify ownership
			with: {
				agent: {
					where: and(
						eq(callAgents.id, agentId),
						eq(callAgents.creatorId, userId),
					),
					// Select only the creatorId from agent for the ownership check
					columns: { creatorId: true },
				},
				// Join with actions to get details about the action definition
				action: true, // Fetch all fields from the linked action
			},
			orderBy: [agentActions.timing, agentActions.order], // Optional: Order by timing and order field
		});

		// Security check: Ensure we found actions *for an agent owned by the user*
		if (agentSpecificActions.length > 0 && !agentSpecificActions[0].agent) {
			console.warn(
				`[API AGENT ACTIONS GET] Agent ${agentId} not found or not owned by user ${userId} despite querying agentActions`,
			);
			return NextResponse.json(
				{ error: "Agent not found or not authorized" },
				{ status: 404 },
			);
		}

		console.log(
			`[API AGENT ACTIONS GET] Found ${agentSpecificActions.length} actions for agent ${agentId}`,
		);

		// Structure the response by timing
		const groupedActions = {
			before: [],
			during: [],
			after: [],
		};

		agentSpecificActions.forEach((item) => {
			if (groupedActions[item.timing]) {
				// *** CORRECTED STRUCTURE HERE ***
				// Push an object representing the AgentAction *instance*
				groupedActions[item.timing].push({
					agentActionId: item.id, // This is the unique ID of the instance
					agentId: item.agentId, // Include the agent ID
					actionId: item.actionId, // Include the global Action ID
					timing: item.timing, // Include the timing group
					order: item.order, // Include the order
					action: item.action, // <--- NEST the global action details under 'action' key
					// Include any other relevant fields from the agentActions table you might need
					// e.g., isEnabled: item.isEnabled, metadata: item.metadata, etc.
				});
			}
		});

		// Log the structure before returning to verify
		console.log(
			`[API AGENT ACTIONS GET] Returning grouped actions:`,
			groupedActions,
		);

		return NextResponse.json(groupedActions, { status: 200 });
	} catch (error) {
		console.error(
			`[API AGENT ACTIONS GET] Database error fetching actions for agent ${agentId} (user ${userId}):`,
			error,
		);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
