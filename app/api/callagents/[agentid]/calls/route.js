// app/api/callagents/[agentid]/calls/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import {
	callAgents,
	calls,
	callActionValues,
	agentActions,
	actions,
} from "@/lib/db/schemaCharacterAI";
import { eq, and, desc } from "drizzle-orm";

// --- GET function: Fetch calls for a specific agent ---
export async function GET(req, { params }) {
	const { userId } = auth();
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
			},
			// Note: Client-side filtering (search, date) will happen in the frontend for now.
			// If filtering needs to be server-side for performance with large datasets,
			// add `where` conditions here based on query parameters (e.g., `req.nextUrl.searchParams`).
		});

		console.log(
			`[API CALLS GET] Found ${agentCalls.length} calls for agent ${agentId}`,
		);
		// console.log('[API CALLS GET] Fetched Calls Sample (first 2):', agentCalls.slice(0, 2)); // Log a sample

		// The data is already structured nicely by Drizzle's `with`
		// Each call object will have a `callActionValues` array, where each item
		// has `value` and a nested `agentAction.action` object with global action details.
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
    const { userId } = auth();
    const agentId = parseInt(params.agentid, 10);

    if (isNaN(agentId)) {
        return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
    }
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const callDetails = body; // The body *is* the callDetails object

        if (!callDetails || !callDetails.transcript) {
            return NextResponse.json({ error: "Transcript data is required" }, { status: 400 });
        }

        console.log(`[API CALLS POST] Attempting to save call for agent ${agentId}`);

        // Step 1: Verify ownership of the agent
        const agent = await db.query.callAgents.findFirst({
            where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)),
            columns: { id: true },
        });

        if (!agent) {
            return NextResponse.json({ error: "Agent not found or not authorized" }, { status: 404 });
        }

        // Step 2: Create a new call entry with the correct fields
        const [newCall] = await db
            .insert(calls)
            .values({
                agentId: agentId,
                // We don't have a contactId for a web test call, so we leave it null.
                
                // --- FIX APPLIED ---
                // For phoneNumber, we use the value if it exists, otherwise provide a placeholder
                // since the column is notNull. For web calls, customerName is more relevant.
                phoneNumber: callDetails.phoneNumber || "Web Call", // Use a placeholder for web calls
                
                direction: callDetails.direction || 'inbound', // Use direction from frontend
                status: "Completed", // Status from frontend
                
                // The transcript is already a JSON string from the frontend
                transcript: callDetails.transcript, 
                
                duration: callDetails.duration || 0,
                startTime: new Date(callDetails.startTime || Date.now()),
                endTime: new Date(callDetails.endTime || Date.now()),

                // We can store the customer's name in the rawCallData JSONB field for web calls
                rawCallData: {
                    customerName: callDetails.customerName,
                }
            })
            .returning({ id: calls.id });

        console.log(`[API CALLS POST] Successfully saved call ${newCall.id}`);

        return NextResponse.json({ success: true, callId: newCall.id }, { status: 201 });

    } catch (error) {
        console.error(`[API CALLS POST] Error saving call for agent ${agentId}:`, error);
        return NextResponse.json({ error: "Internal server error while saving call" }, { status: 500 });
    }
}
// --- DELETE function: Placeholder (Implemented in [callid] route) ---
// export async function DELETE(...) { ... }

