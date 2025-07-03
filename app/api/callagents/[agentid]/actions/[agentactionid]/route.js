// app/api/callagents/[agentid]/actions/[agentactionid]/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/configs/db';
import { callAgents, agentActions } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';

// --- DELETE function: Remove a specific action instance from an agent ---
export async function DELETE(req, { params }) {
    const { userId } = auth();
    const agentId = parseInt(params.agentid, 10);
    const agentActionId = parseInt(params.agentactionid, 10); // Get the specific agentAction ID

    // Validate IDs
    if (isNaN(agentId)) {
        console.warn(`[API AGENT ACTION DELETE] Invalid agentId provided: ${params.agentid}`);
        return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }
     if (isNaN(agentActionId)) {
        console.warn(`[API AGENT ACTION DELETE] Invalid agentActionId provided: ${params.agentactionid}`);
        return NextResponse.json({ error: 'Invalid action instance ID' }, { status: 400 });
    }


    if (!userId) {
        console.log(`[API AGENT ACTION DELETE] Unauthorized: No userId for agent ${agentId}, action instance ${agentActionId}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[API AGENT ACTION DELETE] Attempting to delete agent action instance ${agentActionId} for agent ${agentId} (user ${userId})`);

        // Step 1: Verify ownership (This part is working correctly now)
        const actionToDelete = await db.query.agentActions.findFirst({
            where: eq(agentActions.id, agentActionId),
            with: { // Join to get the linked agent
                agent: {
                    columns: { id: true, creatorId: true } // Select agent ID and creator ID
                }
            }
        });

        // Check if the action instance was found
        if (!actionToDelete) {
             console.warn(`[API AGENT ACTION DELETE] Agent action instance ${agentActionId} not found.`);
             return NextResponse.json({ error: 'Action instance not found' }, { status: 404 });
        }

        // Check if the found action instance belongs to the correct agent from the URL
        if (actionToDelete.agentId !== agentId) {
             console.warn(`[API AGENT ACTION DELETE] Agent action instance ${agentActionId} belongs to agent ${actionToDelete.agentId}, not expected agent ${agentId}.`);
             return NextResponse.json({ error: 'Action instance not found for this agent' }, { status: 404 });
        }

        // Check if the agent that the action instance belongs to is owned by the current user
        if (actionToDelete.agent.creatorId !== userId) {
             console.warn(`[API AGENT ACTION DELETE] Agent action instance ${agentActionId} belongs to agent ${agentId}, which is not owned by user ${userId}. Unauthorized deletion attempt.`);
             return NextResponse.json({ error: 'Not authorized to delete this action' }, { status: 403 });
        }

        console.log(`[API AGENT ACTION DELETE] Verification successful for instance ${agentActionId}. Proceeding with deletion.`);

        // Step 2: Perform the delete using just the ID
         const result = await db.delete(agentActions)
             .where(eq(agentActions.id, agentActionId));

        // *** CORRECTED CHECK FOR rowCount ***
        // Prefer rowCount as shown in the result object, fallback to others just in case.
        const rowsAffected = result.rowCount ?? result.rowsAffected ?? (
            result.count !== undefined ? parseInt(String(result.count), 10) : undefined
        );

        console.log(`[API AGENT ACTION DELETE] Delete query executed for instance ${agentActionId}. Raw result object:`, result);
        console.log(`[API AGENT ACTION DELETE] Interpreted rows affected: ${rowsAffected}`);


        if (rowsAffected === 1) {
             console.log(`[API AGENT ACTION DELETE] Successfully deleted agent action instance ${agentActionId}.`);
            return NextResponse.json({ success: true, deletedId: agentActionId }, { status: 200 });
            // Or return 204 No Content:
            // return new NextResponse(null, { status: 204 });
        } else if (rowsAffected === 0) {
             console.warn(`[API AGENT ACTION DELETE] Agent action instance ${agentActionId} not found after verification? Or already deleted concurrently? Rows affected: ${rowsAffected}.`);
             return NextResponse.json({ error: 'Action instance not found or already deleted' }, { status: 404 });
        } else {
             // This case should now hopefully not be hit.
             console.error(`[API AGENT ACTION DELETE] Unexpected number of rows affected (${rowsAffected}) after successful verification for agent action instance ${agentActionId}.`);
             // Log the result object again just in case
              console.error("[API AGENT ACTION DELETE] Result object leading to unexpected count:", result);
             return NextResponse.json({ error: 'Unexpected database error during deletion' }, { status: 500 });
        }

    } catch (error) {
        console.error(`[API AGENT ACTION DELETE] Database error deleting agent action instance ${agentActionId} for agent ${agentId} (user ${userId}):`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Define allowed fields for updating an agentAction instance
const ALLOWED_AGENT_ACTION_UPDATE_FIELDS = [
    'timing', // e.g., 'before', 'during', 'after'
    'order',  // e.g., integer order within timing
    // Add configOverrides if you decide to add that field to agentActions schema later
];

// Helper to parse IDs
function parseAgentId(params) {
    const id = parseInt(params.agentid, 10);
    return isNaN(id) ? null : id;
}
function parseAgentActionId(params) {
     const id = parseInt(params.agentactionid, 10);
     return isNaN(id) ? null : id;
}


// --- PATCH function: Update a specific agent action instance (timing, order, etc.) ---
// PATCH /api/callagents/[agentid]/actions/[agentactionid]
export async function PATCH(req, { params }) {
    const { userId } = auth();
    const agentId = parseAgentId(params);
    const agentActionId = parseAgentActionId(params);

    if (agentId === null || agentActionId === null) {
        console.warn(`[API AGENT ACTION UPDATE PATCH] Invalid IDs provided: agentId=${params.agentid}, agentActionId=${params.agentactionid}`);
        return NextResponse.json({ error: 'Invalid Agent or Action Instance ID' }, { status: 400 });
    }

    if (!userId) {
        console.log(`[API AGENT ACTION UPDATE PATCH] Unauthorized: No userId for agent ${agentId}, action instance ${agentActionId}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const updates = await req.json();
        console.log(`[API AGENT ACTION UPDATE PATCH] Received update request for agent action instance ${agentActionId} (agent ${agentId}, user ${userId}). Updates:`, updates);

        // Step 1: Verify that the agentAction instance exists, belongs to the correct agent,
        // AND that agent is owned by the current user.
        const actionToUpdate = await db.query.agentActions.findFirst({
            where: eq(agentActions.id, agentActionId),
            with: { // Join to get the linked agent
                agent: {
                    columns: { id: true, creatorId: true } // Select agent ID and creator ID
                }
            }
        });

        // Check if the action instance was found
        if (!actionToUpdate) {
             console.warn(`[API AGENT ACTION UPDATE PATCH] Agent action instance ${agentActionId} not found.`);
             return NextResponse.json({ error: 'Action instance not found' }, { status: 404 });
        }

        // Check if the found action instance belongs to the correct agent from the URL
        if (actionToUpdate.agentId !== agentId) {
             console.warn(`[API AGENT ACTION UPDATE PATCH] Agent action instance ${agentActionId} belongs to agent ${actionToUpdate.agentId}, not expected agent ${agentId}.`);
             // Return 404 as the user requested an action instance that isn't under this agent
             return NextResponse.json({ error: 'Action instance not found for this agent' }, { status: 404 });
        }

        // Check if the agent that the action instance belongs to is owned by the current user
        if (actionToUpdate.agent.creatorId !== userId) {
             console.warn(`[API AGENT ACTION UPDATE PATCH] Agent action instance ${agentActionId} belongs to agent ${agentId}, which is not owned by user ${userId}. Unauthorized update attempt.`);
             return NextResponse.json({ error: 'Not authorized to update this action' }, { status: 403 });
        }

        console.log(`[API AGENT ACTION UPDATE PATCH] Verification successful for instance ${agentActionId}. Proceeding with update.`);


        // Step 2: Build the update object, including only allowed fields
        const updateData = {};
        for (const field in updates) {
            if (ALLOWED_AGENT_ACTION_UPDATE_FIELDS.includes(field)) {
                 // Add type validation
                 if (field === 'timing' && !['before', 'during', 'after'].includes(updates[field])) {
                     console.warn(`[API AGENT ACTION UPDATE PATCH] Invalid timing value: "${updates[field]}".`);
                     return NextResponse.json({ error: 'Invalid timing value provided.' }, { status: 400 });
                 }
                 if (field === 'order' && (typeof updates[field] !== 'number' || !Number.isInteger(updates[field]) || updates[field] < 0)) {
                     console.warn(`[API AGENT ACTION UPDATE PATCH] Invalid order value: ${updates[field]}.`);
                     return NextResponse.json({ error: 'Order must be a non-negative integer.' }, { status: 400 });
                 }
                 // Add validation for configOverrides if added later

                updateData[field] = updates[field];
            } else {
                 console.warn(`[API AGENT ACTION UPDATE PATCH] Attempted to update disallowed field: "${field}".`);
            }
        }

        // If no valid fields are being updated
        if (Object.keys(updateData).length === 0) {
             console.warn(`[API AGENT ACTION UPDATE PATCH] No valid update fields provided for instance ${agentActionId}`);
            return NextResponse.json({ message: 'No valid fields to update' }, { status: 200 });
        }

        console.log(`[API AGENT ACTION UPDATE PATCH] Applying updates for instance ${agentActionId}:`, updateData);


        // Step 3: Perform the update in the database
        const updatedAgentActions = await db.update(agentActions)
            .set({
                 ...updateData,
                 // No updatedAt field in agentActions schema provided earlier, but add if you have it
                 // updatedAt: new Date(),
             })
            .where(eq(agentActions.id, agentActionId)) // Update the specific instance (ownership verified)
            .returning(); // Return the updated record


        if (!updatedAgentActions || updatedAgentActions.length === 0) {
             console.error(`[API AGENT ACTION UPDATE PATCH] Update failed for instance ${agentActionId}. DB result:`, updatedAgentActions);
            return NextResponse.json({ error: 'Failed to update Action Instance' }, { status: 500 });
        }

        const updatedAgentAction = updatedAgentActions[0];
        console.log(`[API AGENT ACTION UPDATE PATCH] Action instance ${agentActionId} updated successfully.`);

        // Return the updated agentAction instance data
        // Note: This does NOT include the joined global action details like the GET does.
        // Frontend might need to re-fetch the list or merge this update.
        return NextResponse.json(updatedAgentAction, { status: 200 });

    } catch (error) {
        console.error(`[API AGENT ACTION UPDATE PATCH] Unexpected API Error during action instance update for instance ${agentActionId} (agent ${agentId}, user ${userId}):`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}