// app/api/callagents/[agentid]/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database";
import { callAgents } from '@/lib/db/schemaCharacterAI'; // Correct import for combined schema
// Import and and eq for combined conditions
import { and, eq } from 'drizzle-orm';
// We might need 'ne' if we implement uniqueness checks for updatable fields other than ID

// Utility to get agentId from params (it's now a string UUID)
function getAgentId(params) {
    return params.agentid; // Agent ID is expected as a string UUID
}

// GET /api/callagents/:agentid - Fetch Single Agent
export async function GET(req, { params }) {
    const { userId } = auth();
    const agentId = getAgentId(params); // Agent ID is now a string UUID

    console.log(`[API GET /callagents/${agentId}] Attempting to fetch agent ID ${agentId} for user ${userId}.`);

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // No NaN check needed, just check if agentId is a string and reasonably formatted (optional)
    if (typeof agentId !== 'string' || agentId.length === 0) return NextResponse.json({ error: 'Invalid agent ID format' }, { status: 400 });


    try {
        const agent = await db.query.callAgents.findFirst({
            where: and(
                eq(callAgents.id, agentId), // Compare string UUID
                eq(callAgents.creatorId, userId) // Ensure ownership
            ),
             // Optionally fetch relations needed by the layout/pages immediately
             // with: {
             //    agentActions: true,
             //    knowledgeBase: true,
             // },
        });

        if (!agent) {
            console.warn(`[API GET /callagents/${agentId}] Not Found: Agent ID ${agentId} not found or not owned by user ${userId}.`);
            return NextResponse.json({ error: 'Agent not found or you do not have permission to view it' }, { status: 404 });
        }

        console.log(`[API GET /callagents/${agentId}] Agent ID ${agentId} fetched successfully for user ${userId}. Name: ${agent.name}`);
        return NextResponse.json(agent, { status: 200 });

    } catch (error) {
        console.error(`API Error /api/callagents/${agentId} (GET):`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// PUT /api/callagents/:agentid - Update Agent
export async function PUT(req, { params }) {
     const { userId } = auth();
     const agentId = getAgentId(params); // Agent ID is now a string UUID

     console.log(`[API PUT /callagents/${agentId}] Attempting to update agent ID ${agentId} for user ${userId}.`);


     if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     if (typeof agentId !== 'string' || agentId.length === 0) return NextResponse.json({ error: 'Invalid agent ID format' }, { status: 400 });


     try {
         const body = await req.json();

         // Define fields we allow updating
         // For example, you might update name, avatarUrl, voiceConfig, callConfig, prompt, etc.
         // Let's only allow fields currently editable in your config pages for now.
         const { name, avatarUrl, voiceEngine, aiModel, timezone, knowledgeBaseId, customVocabulary, useFillerWords, prompt, greetingMessage, voiceConfig, callConfig, status } = body;

         // Build update data object - only include fields explicitly provided and allowed
         const updateData = {};
         if (name !== undefined) updateData.name = name; // Validate name below
         if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl; // Allow setting to null
         if (voiceEngine !== undefined) updateData.voiceEngine = voiceEngine;
         if (aiModel !== undefined) updateData.aiModel = aiModel;
         if (timezone !== undefined) updateData.timezone = timezone;
         if (knowledgeBaseId !== undefined) updateData.knowledgeBaseId = knowledgeBaseId; // Can be null
         if (customVocabulary !== undefined) updateData.customVocabulary = customVocabulary;
         if (useFillerWords !== undefined) updateData.useFillerWords = useFillerWords;
         if (prompt !== undefined) updateData.prompt = prompt;
         if (greetingMessage !== undefined) updateData.greetingMessage = greetingMessage;
         if (voiceConfig !== undefined) updateData.voiceConfig = voiceConfig;
         if (callConfig !== undefined) updateData.callConfig = callConfig;
         if (status !== undefined) updateData.status = status;


         // --- Validation (Simplified - expand based on your needs) ---
         if (updateData.name !== undefined && (typeof updateData.name !== 'string' || updateData.name.trim() === '')) {
              return NextResponse.json({ error: 'Agent name cannot be empty' }, { status: 400 });
         }
         // Add more validation for other fields if necessary

         // --- Name Uniqueness Check (if name is changing) ---
         // Fetch the existing agent first to compare its current name and ensure it exists
         const existingAgent = await db.query.callAgents.findFirst({
              where: and(
                  eq(callAgents.id, agentId),
                  eq(callAgents.creatorId, userId) // Ensure ownership
              )
         });

         if (!existingAgent) {
              console.warn(`[API PUT /callagents/${agentId}] Not Found: Agent ID ${agentId} not found or not owned by user ${userId}.`);
              return NextResponse.json({ error: 'Agent not found or you do not have permission to update it' }, { status: 404 });
         }

         // Check if the name is being changed AND if the new name conflicts with another agent
         // You might want name to be unique *per user*
         if (updateData.name !== undefined && updateData.name.trim() !== existingAgent.name) {
              console.log(`[API PUT /callagents/${agentId}] Checking for name conflict: "${updateData.name.trim()}" for user ${userId}`);
              // You need 'ne' (not equal) from drizzle-orm for this check
              const conflictingAgent = await db.query.callAgents.findFirst({
                  where: and(
                       eq(callAgents.creatorId, userId),
                       eq(callAgents.name, updateData.name.trim()),
                       ne(callAgents.id, agentId) // Exclude the current agent from the check
                  ),
              });

              if (conflictingAgent) {
                   console.warn(`[API PUT /callagents/${agentId}] Conflict: Agent with name "${updateData.name.trim()}" already exists (ID: ${conflictingAgent.id}).`);
                   return NextResponse.json({ error: `An agent with the name "${updateData.name.trim()}" already exists.` }, { status: 409 }); // 409 Conflict
              }
              console.log(`[API PUT /callagents/${agentId}] Name conflict check passed.`);
          } else if (updateData.name !== undefined) {
              console.log(`[API PUT /callagents/${agentId}] Name is not changing or is the same. Skipping conflict check.`);
          }


         // --- Database Update ---
         if (Object.keys(updateData).length === 0) {
              console.log(`[API PUT /callagents/${agentId}] No updateable fields provided in body.`);
              return NextResponse.json(existingAgent, { status: 200 });
         }

         console.log(`[API PUT /callagents/${agentId}] Updating agent ID ${agentId} for user ${userId} with data:`, updateData);

         const updatedAgents = await db.update(callAgents)
             .set({
                 ...updateData,
                 updatedAt: new Date(), // Manually set updatedAt
             })
             .where(and(
                 eq(callAgents.id, agentId),
                 eq(callAgents.creatorId, userId) // Ensure the agent belongs to the user
             ))
             .returning();

         if (!updatedAgents || updatedAgents.length === 0) {
             console.error(`[API PUT /callagents/${agentId}] DB Update failed despite agent found. Result:`, updatedAgents);
             return NextResponse.json({ error: 'Failed to update agent in database' }, { status: 500 });
         }

         const updatedAgent = updatedAgents[0];
         console.log(`[API PUT /callagents/${agentid}] Agent ID ${agentId} updated successfully. Returned data:`, updatedAgent);


         return NextResponse.json(updatedAgent, { status: 200 });

     } catch (error) {
         console.error(`API Error /api/callagents/${agentid} (PUT):`, error);
         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
 }


// DELETE /api/callagents/:agentid - Delete Agent
 export async function DELETE(req, { params }) {
     const { userId } = auth();
     const agentId = getAgentId(params); // Agent ID is now a string UUID

     console.log(`[API DELETE /callagents/${agentId}] Attempting to delete agent ID ${agentId} for user ${userId}.`);


     if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     if (typeof agentId !== 'string' || agentId.length === 0) return NextResponse.json({ error: 'Invalid agent ID format' }, { status: 400 });


     try {
         // Delete the agent, ensuring it belongs to the current user
         const deletedAgents = await db.delete(callAgents)
             .where(and(
                 eq(callAgents.id, agentId),
                 eq(callAgents.creatorId, userId) // IMPORTANT: Only delete if owned by the user
             ))
             .returning({ id: callAgents.id }); // Return the ID of the deleted record

         if (!deletedAgents || deletedAgents.length === 0) {
              console.warn(`[API DELETE /callagents/${agentId}] Not Found: Agent ID ${agentId} not found or not owned by user ${userId}.`);
              return NextResponse.json({ error: 'Agent not found or you do not have permission to delete it' }, { status: 404 });
         }

         console.log(`[API DELETE /callagents/${agentId}] Agent deleted successfully. Deleted ID: ${deletedAgents[0].id}`);

         return NextResponse.json({ success: true, deletedId: deletedAgents[0].id }, { status: 200 });

     } catch (error) {
         console.error(`API Error /api/callagents/${agentId} (DELETE):`, error);
         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
 }