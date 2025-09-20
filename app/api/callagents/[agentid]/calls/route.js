// app/api/callagents/[agentid]/calls/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents, calls } from "@/lib/db/schemaCharacterAI";
import { eq, and, desc } from "drizzle-orm";

// --- GET function: Fetch calls for a specific agent ---
export async function GET(req, { params }) {
	// const { userId } = auth();
	const { user } = await getSession(await headers());
	const userId = user?.id;
	const agentId = parseInt(params.agentid, 10);

	if (isNaN(agentId)) {
		console.warn(`[API CALLS GET] Invalid agentId provided: ${params.agentid}`);
		return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
	}

	if (!userId) {
		console.log(`[API CALLS GET] Unauthorized: No userId for agent ${agentId}`);
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		console.log(
			`[API CALLS GET] Fetching calls for agent ${agentId} (user ${userId})`,
		);

		// Step 1: Verify the user owns the agent
		const agent = await db.query.callAgents.findFirst({
			where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)),
			columns: { id: true }, // Select only the ID, just need to confirm existence and ownership
		});

		if (!agent) {
			console.warn(
				`[API CALLS GET] Agent ${agentId} not found or not owned by user ${userId}`,
			);
			return NextResponse.json(
				{ error: "Agent not found or not authorized" },
				{ status: 404 },
			);
		}

		// Step 2: Fetch calls for this agent, including nested callActionValues and joined action details
		const agentCalls = await db.query.calls.findMany({
			where: eq(calls.agentId, agentId),
			// Order by start time, newest first
			orderBy: [desc(calls.startTime)],
			// Include related callActionValues and join necessary tables to get action details
			with: {
				callActionValues: {
					with: {
						// Join agentActions and actions
						agentAction: {
							with: {
								// Join the global action definition
								action: true,
							},
						},
					},
				},
				agent: {
					with: {
						agentActions: {
							with: {
								action: true,
							},
						},
					},
				},
			},
		});

		console.log(
			`[API CALLS GET] Found ${agentCalls.length} calls for agent ${agentId}`,
		);

		return NextResponse.json(agentCalls, { status: 200 });
	} catch (error) {
		console.error(
			`[API CALLS GET] Database error fetching calls for agent ${agentId} (user ${userId}):`,
			error,
		);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(req, { params }) {
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
		const body = await req.json();
		const callDetails = body;

		if (!callDetails || !callDetails.transcript) {
			return NextResponse.json(
				{ error: "Transcript data is required" },
				{ status: 400 },
			);
		}

		// --- ADD THIS LOG ---
		console.log(
			`[API CALLS POST] Received payload with recordingUrl: ${callDetails.recordingUrl}`,
		);

		// Step 1: Verify ownership of the agent
		const agent = await db.query.callAgents.findFirst({
			where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)),
			columns: { id: true },
		});

		if (!agent) {
			return NextResponse.json(
				{ error: "Agent not found or not authorized" },
				{ status: 404 },
			);
		}

		// Step 2: Create a new call entry with the correct fields
		const [newCall] = await db
			.insert(calls)
			.values({
				agentId: agentId,
				phoneNumber: callDetails.phoneNumber || "Web Call",
				direction: callDetails.direction || "inbound",
				status: callDetails.status || "Completed", // Use status from frontend
				transcript: callDetails.transcript,
				duration: callDetails.duration || 0,
				startTime: new Date(callDetails.startTime || Date.now()),
				endTime: new Date(callDetails.endTime || Date.now()),

				// --- FIX APPLIED HERE ---
				// Add the recordingUrl from the payload to the database insert
				recordingUrl: callDetails.recordingUrl || null,

				rawCallData: {
					customerName: callDetails.customerName,
					// You could also store the Vapi callId here if needed
					vapiCallId: callDetails.callId,
				},
			})
			.returning({ id: calls.id });

		console.log(
			`[API CALLS POST] Successfully saved call ${newCall.id} with recording URL.`,
		);

		return NextResponse.json(
			{ success: true, callId: newCall.id },
			{ status: 201 },
		);
	} catch (error) {
		console.error(
			`[API CALLS POST] Error saving call for agent ${agentId}:`,
			error,
		);
		return NextResponse.json(
			{ error: "Internal server error while saving call" },
			{ status: 500 },
		);
	}
}
// --- DELETE function: Placeholder (Implemented in [callid] route) ---
// export async function DELETE(...) { ... }
