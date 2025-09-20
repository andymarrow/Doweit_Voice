// app/api/callagents/[agentid]/actions/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database";
import { callAgents, agentActions, actions } from '@/lib/db/schemaCharacterAI'; // Import necessary schemas
import { eq, and, inArray, sql , or ,isNull } from 'drizzle-orm';

// --- GET function: Fetch agent's configured actions ---
export async function GET(req, { params }) {
    const { userId } = auth();
    const agentId = parseInt(params.agentid, 10);

    if (isNaN(agentId)) {
        return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[API AGENT ACTIONS GET] Fetching actions for agent ${agentId} (user ${userId})`);

        // Fetch agentActions for this agent, joining with the actions table
        // Ensure the agent belongs to the user for security
        const agentSpecificActions = await db.query.agentActions.findMany({
            where: eq(agentActions.agentId, agentId),
             // Join with callAgents to verify ownership
             with: {
                agent: {
                    where: and(
                        eq(callAgents.id, agentId),
                        eq(callAgents.creatorId, userId)
                    ),
                     // Select only the creatorId from agent for the ownership check
                    columns: { creatorId: true }
                },
                 // Join with actions to get details about the action definition
                action: true, // Fetch all fields from the linked action
             },
             orderBy: [agentActions.timing, agentActions.order], // Optional: Order by timing and order field
        });

        // Security check: Ensure we found actions *for an agent owned by the user*
        // If agentSpecificActions is empty, it might be because the agent has no actions OR the agent wasn't found/owned
        // We could add an extra check here to see if the agent exists at all for the user if needed,
        // but filtering by agent.creatorId inside the query ensures we only return actions for owned agents.
        if (agentSpecificActions.length > 0 && !agentSpecificActions[0].agent) {
             // This case should ideally not be hit if the query is correct,
             // but as a safeguard if the join/where logic is tricky.
             console.warn(`[API AGENT ACTIONS GET] Agent ${agentId} not found or not owned by user ${userId} despite querying agentActions`);
            return NextResponse.json({ error: 'Agent not found or not authorized' }, { status: 404 });
        }

        console.log(`[API AGENT ACTIONS GET] Found ${agentSpecificActions.length} actions for agent ${agentId}`);

        // Structure the response by timing (optional, can be done on frontend)
        // Let's group it here for easier consumption by the frontend page state
        const groupedActions = {
            before: [],
            during: [],
            after: [],
        };

        agentSpecificActions.forEach(item => {
             if (groupedActions[item.timing]) {
                 // Add the action details to the correct timing group
                 // Include the agentAction ID (item.id) and the action definition details (item.action)
                 groupedActions[item.timing].push({
                     ...item.action, // Spread the global action details (id, name, type, config, etc.)
                     agentActionId: item.id, // Include the unique ID of this agent's instance
                     timing: item.timing, // Include timing
                     order: item.order, // Include order
                     // Add any other relevant fields from agentActions table if needed
                 });
             }
        });


        return NextResponse.json(groupedActions, { status: 200 });

    } catch (error) {
        console.error(`[API AGENT ACTIONS GET] Database error fetching actions for agent ${agentId} (user ${userId}):`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// --- POST function: Add actions to an agent ---
export async function POST(req, { params }) {
    const { userId } = auth();
    const agentId = parseInt(params.agentid, 10);

    if (isNaN(agentId)) {
        console.warn(`[API AGENT ACTIONS POST] Invalid agentId provided: ${params.agentid}`);
        return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    if (!userId) {
        console.log(`[API AGENT ACTIONS POST] Unauthorized: No userId for agent ${agentId}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { timing, actionIds: rawActionIds } = await req.json(); // Get rawActionIds

        console.log(`[API AGENT ACTIONS POST] Received request to add actions to agent ${agentId} (user ${userId})`, { timing, rawActionIds });

        // *** FIX 1: Remove duplicates from the received actionIds array ***
        const actionIds = Array.from(new Set(rawActionIds));
        console.log(`[API AGENT ACTIONS POST] Processed unique actionIds:`, actionIds);


        // Validate input (using the unique actionIds array)
        if (!timing || !['before', 'during', 'after'].includes(timing)) {
            console.warn(`[API AGENT ACTIONS POST] Invalid or missing timing provided: ${timing}`);
            return NextResponse.json({ error: 'Invalid or missing timing provided' }, { status: 400 });
        }
        if (actionIds.length === 0) {
             console.warn(`[API AGENT ACTIONS POST] No unique actionIds provided.`);
            return NextResponse.json({ message: 'No actions provided to add' }, { status: 200 }); // Or 400, depending on desired behavior
        }


        // Security Check 1: Verify the user owns the agent
        const agent = await db.query.callAgents.findFirst({
            where: and(
                eq(callAgents.id, agentId),
                eq(callAgents.creatorId, userId)
            ),
             columns: { id: true }
        });

        if (!agent) {
            console.warn(`[API AGENT ACTIONS POST] Agent ${agentId} not found or not owned by user ${userId}`);
            return NextResponse.json({ error: 'Agent not found or not authorized' }, { status: 404 });
        }

        // Security Check 2: Verify the user is allowed to add these global actions
        // Fetch the global actions requested to be added that the user has permission for
        const requestedGlobalActions = await db.query.actions.findMany({
            where: and(
                 inArray(actions.id, actionIds),
                 // *** FIX 2: Use Drizzle `or` helper instead of `sql` template ***
                 or(
                     isNull(actions.creatorId), // System/Template actions
                     eq(actions.creatorId, userId) // Actions created by the current user
                 )
             )
        });

         // Check if all requested actionIds were found and are allowed
         if (requestedGlobalActions.length !== actionIds.length) {
             const foundIds = requestedGlobalActions.map(a => a.id);
             // Calculate disallowed IDs based on the *unique* actionIds array
             const disallowedIds = actionIds.filter(id => !foundIds.includes(id));
             console.warn(`[API AGENT ACTIONS POST] Attempted to add disallowed or non-existent global actions. Disallowed IDs: ${disallowedIds.join(', ')} for user ${userId}`);
             // Return 403 Forbidden if any requested unique ID was not found/allowed
             return NextResponse.json({ error: `One or more selected actions are not available or you do not have permission to add them. Disallowed IDs: ${disallowedIds.join(', ')}` }, { status: 403 });
         }


        // Prepare data for insertion into agentActions
        // Determine the 'order'. Find the max existing order for the timing group and add incrementally.
         const existingActionsInTiming = await db.query.agentActions.findMany({
             where: and(
                 eq(agentActions.agentId, agentId),
                 eq(agentActions.timing, timing)
             ),
              columns: { order: true },
              orderBy: [agentActions.order],
         });

         let maxOrder = existingActionsInTiming.reduce((max, current) => Math.max(max, current.order || 0), -1);

        const valuesToInsert = actionIds.map(actionId => {
             maxOrder += 1;
            return {
                agentId: agentId,
                actionId: actionId, // Use the unique actionId
                timing: timing,
                order: maxOrder,
                createdAt: new Date(),
            };
        });

         console.log(`[API AGENT ACTIONS POST] Preparing to insert ${valuesToInsert.length} agentActions.`);
         // console.log("[API AGENT ACTIONS POST] Values to Insert:", valuesToInsert); // Log values if debugging insert issues

        // Perform the insertion
         // Use `onConflictDoNothing` to gracefully handle attempts to add duplicates
         // based on the unique index (`unqAgentActionTiming`)
         const insertedAgentActions = await db.insert(agentActions)
             .values(valuesToInsert)
              .onConflictDoNothing({
                   target: [agentActions.agentId, agentActions.actionId, agentActions.timing]
               })
             .returning(); // Return the newly inserted rows (or empty array if all were duplicates)

        console.log(`[API AGENT ACTIONS POST] Successfully inserted ${insertedAgentActions.length} new agent actions for agent ${agentId}`);

        // For the frontend to update its state, it needs the details of the actions that were actually inserted.
        // Fetch the details of the actions that were actually inserted.
         if (insertedAgentActions.length > 0) {
             const insertedAgentActionIds = insertedAgentActions.map(item => item.id); // Get the agentAction IDs that were inserted
             // Fetch the full details of the inserted agentActions (including the joined global action details)
             const newlyAddedAgentActionsDetails = await db.query.agentActions.findMany({
                 where: inArray(agentActions.id, insertedAgentActionIds),
                 with: { // Join with the global actions table
                     action: true
                 }
             });

             // Structure the response data similar to the GET endpoint
             const responseData = newlyAddedAgentActionsDetails.map(item => ({
                 ...item.action, // Spread global action details
                 agentActionId: item.id, // Use the agentAction instance ID
                 timing: item.timing,
                 order: item.order,
                 // Add any other necessary fields from agentActions
             }));

            return NextResponse.json(responseData, { status: 201 }); // 201 Created

         } else {
             // No new actions were inserted (maybe all were duplicates sent initially or already existed)
              console.log(`[API AGENT ACTIONS POST] No new actions inserted (likely duplicates).`);
             return NextResponse.json([], { status: 200 }); // Return empty array, status 200 OK
         }


    } catch (error) {
        console.error(`[API AGENT ACTIONS POST] Unexpected API Error during agent action addition for agent ${agentId} (user ${userId}):`, error);
        // Check if it's a known constraint violation (e.g., if the unique index check failed differently)
        // Drizzle throws specific errors for constraints
        if (error.message.includes('action_creator_name_unq')) { // Check for the global actions unique index name (unlikely here, this is for *creating* global actions)
             console.warn(`[API AGENT ACTIONS POST] Potential unique constraint violation during lookup/insert.`);
             // Although onConflictDoNothing should prevent this for agentActions, log it.
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Note: You might also need DELETE /api/callagents/[agentid]/actions/[agentactionid]
// to remove a specific action instance from an agent's list.
// This would involve deleting a row from the agentActions table.
// You might also need a PUT/PATCH to update the 'order' of actions.