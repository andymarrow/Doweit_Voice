// app/api/knowledgebases/[kbid]/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/configs/db';
import { knowledgeBases, users } from '@/lib/db/schemaCharacterAI'; // Import KB and User schemas
import { eq, and, or, isNull } from 'drizzle-orm';

// Define allowed fields that can be updated via this PATCH route for the KB itself
const ALLOWED_KB_UPDATE_FIELDS = [
    'name',
    'description',
    'isPublic', // Allow owner to change public status
    'content', // Allow owner to update content directly (e.g., add/remove items)
    'status', // Allow owner to update status (e.g., trigger re-processing)
];

// Helper to parse KB ID
function parseKbId(params) {
    const id = parseInt(params.kbid, 10);
    return isNaN(id) ? null : id;
}


// --- GET function: Fetch a specific Knowledge Base ---
// GET /api/knowledgebases/[kbid]
export async function GET(req, { params }) {
    const { userId } = auth(); // userId is needed for checking ownership vs public

    const kbId = parseKbId(params);

    if (kbId === null) {
        console.warn(`[API KB DETAIL GET] Invalid kbId provided: ${params.kbid}`);
        return NextResponse.json({ error: 'Invalid Knowledge Base ID' }, { status: 400 });
    }

     // User must be authenticated to view KBs (even public ones, based on app structure)
    if (!userId) {
         console.log(`[API KB DETAIL GET] Unauthorized: No userId for KB ${kbId}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    try {
        console.log(`[API KB DETAIL GET] Fetching KB ${kbId} for user ${userId}`);

        // Fetch the Knowledge Base by ID
        // Use findFirst with a WHERE clause that includes the permission logic (owned OR public)
        const knowledgeBase = await db.query.knowledgeBases.findFirst({
            where: and(
                eq(knowledgeBases.id, kbId),
                 or(
                     eq(knowledgeBases.creatorId, userId), // Owned by the user
                     eq(knowledgeBases.isPublic, true) // Or is public
                 )
            ),
             // Include creator details if you want to display "by Author"
             with: {
                 creator: {
                     // *** FIX: Explicitly select columns from the users table ***
                      columns: { id: true, firstName: true, lastName: true }
                 }
             }
             // Select all columns from the knowledgeBase table implicitly by default
        });

        // If KB not found at all OR if found but didn't match the permission check
        if (!knowledgeBase) {
             console.warn(`[API KB DETAIL GET] KB ${kbId} not found or not authorized for user ${userId}.`);
            // Return 404 for both "not found" and "not authorized" on GET for privacy
            return NextResponse.json({ error: 'Knowledge Base not found' }, { status: 404 });
        }

         // Determine if the authenticated user is the owner
        const isOwner = knowledgeBase.creatorId === userId;

        console.log(`[API KB DETAIL GET] Successfully fetched KB ${kbId}. Is owner: ${isOwner}.`);

        // Return the fetched KB object, including the isOwner flag
        // Remove the raw creator object if you only need the name or isOwner flag
        // Or keep it if the frontend uses the full creator data
        return NextResponse.json({ ...knowledgeBase, isOwner, creator: undefined }, { status: 200 }); // Optionally remove creator object


    } catch (error) {
        console.error(`[API KB DETAIL GET] Database error fetching KB ${kbId} for user ${userId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// --- PATCH function: Update a specific Knowledge Base ---
// PATCH /api/knowledgebases/[kbid]
export async function PATCH(req, { params }) {
    const { userId } = auth();

    const kbId = parseKbId(params);

    if (kbId === null) {
        console.warn(`[API KB UPDATE PATCH] Invalid kbId provided: ${params.kbid}`);
        return NextResponse.json({ error: 'Invalid Knowledge Base ID' }, { status: 400 });
    }

    if (!userId) {
         console.log(`[API KB UPDATE PATCH] Unauthorized: No userId for KB ${kbId}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const updates = await req.json();
        console.log(`[API KB UPDATE PATCH] Received update request for KB ${kbId} (user ${userId}). Updates:`, updates);

        // Step 1: Verify ownership BEFORE allowing any updates
        const knowledgeBase = await db.query.knowledgeBases.findFirst({
             where: and(
                 eq(knowledgeBases.id, kbId),
                 eq(knowledgeBases.creatorId, userId) // Must be the owner to edit
             ),
             columns: { id: true } // Just need to confirm existence and ownership
         });

         if (!knowledgeBase) {
             console.warn(`[API KB UPDATE PATCH] KB ${kbId} not found or not owned by user ${userId}. Update denied.`);
             return NextResponse.json({ error: 'Knowledge Base not found or not authorized' }, { status: 404 }); // Return 404 if not found/owned
         }

        // Step 2: Build the update object, including only allowed fields
        const updateData = {};
        for (const field in updates) {
            if (ALLOWED_KB_UPDATE_FIELDS.includes(field)) {
                 // Add basic type checking if necessary
                 if (field === 'content' && !Array.isArray(updates[field])) {
                      console.warn(`[API KB UPDATE PATCH] Invalid type for content: expected array`);
                      return NextResponse.json({ error: `Invalid data format for field "${field}"` }, { status: 400 });
                 }
                 if (field === 'isPublic' && typeof updates[field] !== 'boolean') {
                      console.warn(`[API KB UPDATE PATCH] Invalid type for isPublic: expected boolean`);
                      return NextResponse.json({ error: `Invalid data format for field "${field}"` }, { status: 400 });
                 }
                 // Add validation for name/description length, status values, etc.
                 if (field === 'name' && (typeof updates[field] !== 'string' || updates[field].trim().length === 0)) {
                      console.warn(`[API KB UPDATE PATCH] Invalid type for name: expected non-empty string`);
                      return NextResponse.json({ error: `Knowledge Base name cannot be empty` }, { status: 400 });
                 }


                updateData[field] = updates[field];
            } else {
                 console.warn(`[API KB UPDATE PATCH] Attempted to update disallowed field: "${field}".`);
                // Optionally return an error if disallowed fields are present
                // return NextResponse.json({ error: `Updating field "${field}" is not allowed` }, { status: 400 });
            }
        }

        // If no valid fields are being updated
        if (Object.keys(updateData).length === 0) {
             console.warn(`[API KB UPDATE PATCH] No valid update fields provided for KB ${kbId}`);
            return NextResponse.json({ message: 'No valid fields to update' }, { status: 200 });
        }

        console.log(`[API KB UPDATE PATCH] Applying updates for KB ${kbId}:`, updateData);

        // Step 3: Perform the update in the database
        // Use `returning()` to get the updated record to send back
        const updatedKbs = await db.update(knowledgeBases)
            .set({
                 ...updateData,
                 updatedAt: new Date(), // Manually set updatedAt
             })
            .where(eq(knowledgeBases.id, kbId)) // Update the specific KB (ownership already verified)
            .returning();


        if (!updatedKbs || updatedKbs.length === 0) {
             console.error(`[API KB UPDATE PATCH] Update failed for KB ${kbId}. DB result:`, updatedKbs);
            return NextResponse.json({ error: 'Failed to update Knowledge Base' }, { status: 500 });
        }

        const updatedKb = updatedKbs[0];
        console.log(`[API KB UPDATE PATCH] Knowledge Base ${kbId} updated successfully.`);

        // Return the updated KB data
        // Include isOwner: true flag as they must be the owner to PATCH
        return NextResponse.json({ ...updatedKb, isOwner: true }, { status: 200 });

    } catch (error) {
        console.error(`[API KB UPDATE PATCH] Unexpected API Error during KB update for KB ${kbId} (user ${userId}):`, error);
         // Check for unique constraint violation if name was updated
          if (error.message.includes('knowledge_bases_creator_id_name_unq')) {
              console.warn(`[API KB UPDATE PATCH] Likely unique constraint violation on name update for user ${userId}.`);
              // Find the attempted new name from updates
              const attemptedName = updates?.name;
               return NextResponse.json({ error: `A Knowledge Base with the name "${attemptedName}" already exists.` }, { status: 409 }); // 409 Conflict
          }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// --- DELETE function: Delete a specific Knowledge Base ---
// DELETE /api/knowledgebases/[kbid]
export async function DELETE(req, { params }) {
    const { userId } = auth();

    const kbId = parseKbId(params);

    if (kbId === null) {
        console.warn(`[API KB DELETE] Invalid kbId provided: ${params.kbid}`);
        return NextResponse.json({ error: 'Invalid Knowledge Base ID' }, { status: 400 });
    }

    if (!userId) {
         console.log(`[API KB DELETE] Unauthorized: No userId for KB ${kbId}.`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[API KB DELETE] Attempting to delete KB ${kbId} for user ${userId}`);

        // Step 1: Verify ownership BEFORE deleting
        const knowledgeBase = await db.query.knowledgeBases.findFirst({
             where: and(
                 eq(knowledgeBases.id, kbId),
                 eq(knowledgeBases.creatorId, userId) // Must be the owner to delete
             ),
             columns: { id: true } // Just need to confirm existence and ownership
         });

         if (!knowledgeBase) {
             console.warn(`[API KB DELETE] KB ${kbId} not found or not owned by user ${userId}. Deletion denied.`);
             return NextResponse.json({ error: 'Knowledge Base not found or not authorized' }, { status: 404 }); // Return 404 if not found/owned
         }

        // Step 2: Perform the deletion
         // onDelete: 'cascade' on call_agents table referencing knowledgeBases.id should handle deleting agent links.
        const result = await db.delete(knowledgeBases)
            .where(eq(knowledgeBases.id, kbId)); // Delete the specific KB (ownership verified)

        // Check the result of the delete operation (using rowCount for Neon compatibility)
        const rowsAffected = result.rowCount ?? result.rowsAffected ?? (
            result.count !== undefined ? parseInt(String(result.count), 10) : undefined
        );

         console.log(`[API KB DELETE] Delete query executed for KB ${kbId}. Rows affected: ${rowsAffected}`);

        if (rowsAffected === 1) {
             console.log(`[API KB DELETE] Successfully deleted KB ${kbId}.`);
            // Return success response
            return NextResponse.json({ success: true, deletedId: kbId }, { status: 200 });
            // Or return 204 No Content:
            // return new NextResponse(null, { status: 204 });
        } else if (rowsAffected === 0) {
             console.warn(`[API KB DELETE] KB ${kbId} not found after verification? Or already deleted concurrently? Rows affected: ${rowsAffected}.`);
             return NextResponse.json({ error: 'Knowledge Base not found or already deleted' }, { status: 404 });
        } else {
             console.error(`[API KB DELETE] Unexpected number of rows affected (${rowsAffected}) after successful verification for KB ${kbId}. Result object:`, result);
             return NextResponse.json({ error: 'Unexpected database error during deletion' }, { status: 500 });
        }


    } catch (error) {
        console.error(`[API KB DELETE] Database error deleting KB ${kbId} for user ${userId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}