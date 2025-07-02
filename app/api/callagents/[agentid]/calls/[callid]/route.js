// app/api/callagents/[agentid]/calls/[callid]/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/configs/db';
import { callAgents, calls } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';

// --- DELETE function: Remove a specific call ---
export async function DELETE(req, { params }) {
    const { userId } = auth();
    const agentId = parseInt(params.agentid, 10);
    const callId = parseInt(params.callid, 10); // Get the specific call ID

    // Validate IDs
    if (isNaN(agentId)) {
        console.warn(`[API CALL DELETE] Invalid agentId provided: ${params.agentid}`);
        return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }
     if (isNaN(callId)) {
        console.warn(`[API CALL DELETE] Invalid callId provided: ${params.callid}`);
        return NextResponse.json({ error: 'Invalid call ID' }, { status: 400 });
    }


    if (!userId) {
        console.log(`[API CALL DELETE] Unauthorized: No userId for agent ${agentId}, call ${callId}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[API CALL DELETE] Attempting to delete call ${callId} for agent ${agentId} (user ${userId})`);

        // Step 1: Verify that the call exists, belongs to the correct agent,
        // AND that agent is owned by the current user.
        // Use a select query with joins before attempting the delete.
        const callToDelete = await db.query.calls.findFirst({
            where: eq(calls.id, callId),
            with: { // Join to get the linked agent
                agent: {
                    columns: { id: true, creatorId: true } // Select agent ID and creator ID
                }
            }
        });

        // Check if the call was found
        if (!callToDelete) {
             console.warn(`[API CALL DELETE] Call ${callId} not found.`);
             return NextResponse.json({ error: 'Call not found' }, { status: 404 });
        }

        // Check if the found call belongs to the correct agent from the URL
        if (callToDelete.agentId !== agentId) {
             console.warn(`[API CALL DELETE] Call ${callId} belongs to agent ${callToDelete.agentId}, not expected agent ${agentId}.`);
             return NextResponse.json({ error: 'Call not found for this agent' }, { status: 404 }); // Or 403 Forbidden
        }

        // Check if the agent that the call belongs to is owned by the current user
        if (callToDelete.agent.creatorId !== userId) {
             console.warn(`[API CALL DELETE] Call ${callId} belongs to agent ${agentId}, which is not owned by user ${userId}. Unauthorized deletion attempt.`);
             return NextResponse.json({ error: 'Not authorized to delete this call' }, { status: 403 }); // User is not authorized
        }

        console.log(`[API CALL DELETE] Verification successful for call ${callId}. Proceeding with deletion.`);

        // Step 2: Perform the delete using just the callId
        // onDelete: 'cascade' on call_action_values table should handle deleting associated rows.
         const result = await db.delete(calls)
             .where(eq(calls.id, callId));

        // Check the result of the delete operation
        // Use rowCount for Neon compatibility
        const rowsAffected = result.rowCount ?? result.rowsAffected ?? (
            result.count !== undefined ? parseInt(String(result.count), 10) : undefined
        );

        console.log(`[API CALL DELETE] Delete query executed for call ${callId}. Rows affected: ${rowsAffected}`);

        if (rowsAffected === 1) {
             console.log(`[API CALL DELETE] Successfully deleted call ${callId}.`);
            // Return success response
            return NextResponse.json({ success: true, deletedId: callId }, { status: 200 });
            // return new NextResponse(null, { status: 204 }); // 204 No Content is also appropriate
        } else if (rowsAffected === 0) {
             console.warn(`[API CALL DELETE] Call ${callId} not found after verification? Or already deleted concurrently? Rows affected: ${rowsAffected}.`);
             return NextResponse.json({ error: 'Call not found or already deleted' }, { status: 404 });
        } else {
             console.error(`[API CALL DELETE] Unexpected number of rows affected (${rowsAffected}) after successful verification for call ${callId}. Result object:`, result);
             return NextResponse.json({ error: 'Unexpected database error during deletion' }, { status: 500 });
        }

    } catch (error) {
        console.error(`[API CALL DELETE] Database error deleting call ${callId} for agent ${agentId} (user ${userId}):`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}