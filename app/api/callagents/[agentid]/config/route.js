// app/api/callagents/[agentid]/config/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database"; // Your Drizzle DB instance
// Import the combined schema file
import { callAgents } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';

// Define allowed fields that can be updated via this PATCH route
// This is important for security to prevent unauthorized changes to other fields
const ALLOWED_UPDATE_FIELDS = [
    'name',
    'avatarUrl', // Although image upload should likely be a separate endpoint
    'voiceEngine',
    'aiModel',
    'timezone',
    'knowledgeBaseId', // Note: This is an integer FK, ensure it's sent as such or null
    'customVocabulary', // Expecting JSONB array
    'useFillerWords',
    'prompt', // Although PromptPage also updates this
    'greetingMessage', // Although PromptPage also updates this
    'voiceConfig', // Expecting JSONB object
    'callConfig', // Expecting JSONB object
    'status', // Potentially allow status updates like 'active'/'paused'
    // Add other nullable fields if they can be cleared by setting them to null
    'description', // If you add a description field later
];


// --- GET function: Fetch agent configuration ---
export async function GET(req, { params }) {
    const { userId } = auth();
    const agentId = parseInt(params.agentid, 10);

    // Validate agentId
     if (isNaN(agentId)) {
         console.warn(`[API CONFIG GET] Invalid agentId provided: ${params.agentid}`);
         return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
     }

    if (!userId) {
        console.log(`[API CONFIG GET] Unauthorized: No userId for agent ${agentId}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[API CONFIG GET] Fetching config for agent ${agentId} (user ${userId})`);
        const agent = await db.query.callAgents.findFirst({
            where: and(
                eq(callAgents.id, agentId),
                eq(callAgents.creatorId, userId)
            ),
             // Select all columns relevant to configuration
             // If performance is critical and you only need specific fields for a tab,
             // you could filter columns here. But for the main config page,
             // fetching all config is reasonable.
        });

        if (!agent) {
            console.warn(`[API CONFIG GET] Agent ${agentId} not found for user ${userId}`);
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        console.log(`[API CONFIG GET] Successfully fetched config for agent ${agentId}`);
        // Return the fetched agent object (or a subset of its fields)
        return NextResponse.json(agent, { status: 200 });

    } catch (error) {
        console.error(`[API CONFIG GET] Database error fetching config for agent ${agentId} (user ${userId}):`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// --- PATCH function: Update agent configuration ---
export async function PATCH(req, { params }) {
    const { userId } = auth();
    const agentId = parseInt(params.agentid, 10);

    // Validate agentId
    if (isNaN(agentId)) {
         console.warn(`[API CONFIG PATCH] Invalid agentId provided: ${params.agentid}`);
        return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    if (!userId) {
         console.log(`[API CONFIG PATCH] Unauthorized: No userId for agent ${agentId}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Parse the request body as JSON
        const updates = await req.json();
        console.log(`[API CONFIG PATCH] Received update request for agent ${agentId} (user ${userId}). Updates:`, updates);

        // Build the update object, including only allowed fields
        const updateData = {};
        for (const field in updates) {
            if (ALLOWED_UPDATE_FIELDS.includes(field)) {
                 // Add the field and its value to updateData
                 // Add basic type checking if necessary (e.g., ensure customVocabulary is an array)
                 if (field === 'customVocabulary' && !Array.isArray(updates[field])) {
                      console.warn(`[API CONFIG PATCH] Invalid type for customVocabulary: expected array`);
                     continue; // Skip this field or return error
                 }
                  if (field === 'voiceConfig' && typeof updates[field] !== 'object') {
                      console.warn(`[API CONFIG PATCH] Invalid type for voiceConfig: expected object`);
                     continue; // Skip
                 }
                  if (field === 'callConfig' && typeof updates[field] !== 'object') {
                      console.warn(`[API CONFIG PATCH] Invalid type for callConfig: expected object`);
                     continue; // Skip
                 }
                 // Handle knowledgeBaseId potentially being null
                 if (field === 'knowledgeBaseId' && updates[field] !== null && typeof updates[field] !== 'number') {
                     console.warn(`[API CONFIG PATCH] Invalid type for knowledgeBaseId: expected number or null`);
                     continue; // Skip
                 }
                  // Boolean fields should be explicitly boolean
                 if (field === 'useFillerWords' && typeof updates[field] !== 'boolean') {
                     console.warn(`[API CONFIG PATCH] Invalid type for useFillerWords: expected boolean`);
                     continue; // Skip
                 }


                updateData[field] = updates[field];
            } else {
                 console.warn(`[API CONFIG PATCH] Attempted to update disallowed field: ${field}`);
                // Optionally return an error if disallowed fields are present
                // return NextResponse.json({ error: `Updating field "${field}" is not allowed` }, { status: 400 });
            }
        }

        // If no valid fields are being updated, maybe return a specific response
        if (Object.keys(updateData).length === 0) {
             console.warn(`[API CONFIG PATCH] No valid update fields provided for agent ${agentId}`);
            return NextResponse.json({ message: 'No valid fields to update' }, { status: 200 });
        }

        console.log(`[API CONFIG PATCH] Applying updates for agent ${agentId}:`, updateData);

        // Perform the update in the database
        const updatedAgents = await db.update(callAgents)
            .set({
                 ...updateData,
                 updatedAt: new Date(), // Manually set updatedAt for consistency
             })
            .where(and(
                eq(callAgents.id, agentId),
                eq(callAgents.creatorId, userId) // Ensure user owns the agent
            ))
            .returning(); // Return the updated record

        if (!updatedAgents || updatedAgents.length === 0) {
             // This indicates the agent wasn't found *or* the user didn't own it
            console.warn(`[API CONFIG PATCH] Update failed: Agent ${agentId} not found or not owned by user ${userId}`);
            return NextResponse.json({ error: 'Agent not found or not authorized' }, { status: 404 });
        }

        const updatedAgent = updatedAgents[0];
        console.log(`[API CONFIG PATCH] Agent ${agentId} updated successfully.`);

        // Return the updated agent data
        return NextResponse.json(updatedAgent, { status: 200 });

    } catch (error) {
        console.error(`[API CONFIG PATCH] Unexpected API Error during agent update for agent ${agentId} (user ${userId}):`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}