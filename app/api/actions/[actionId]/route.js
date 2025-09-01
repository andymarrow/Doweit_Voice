// app/api/actions/[actionId]/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/configs/db'; // Your Drizzle DB instance
// Import the actions schema from your combined file
import { actions } from '@/lib/db/schemaCharacterAI';
import { and, eq,ne  } from 'drizzle-orm';

// Utility to safely parse actionId from params
function parseActionId(params) {
    const id = parseInt(params.actionId, 10);
    return isNaN(id) ? null : id;
}


// PUT or PATCH /api/actions/:actionId
// Updates a specific action.
export async function PUT(req, { params }) {
    const { userId } = auth();
    const actionId = parseActionId(params); // Integer ID from URL

    if (!userId) {
        console.warn(`[API PUT /actions/${actionId}] Unauthorized: No userId.`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
     if (!actionId) {
         console.warn(`[API PUT /actions/${actionId}] Bad Request: Invalid action ID format.`);
         return NextResponse.json({ error: 'Invalid action ID' }, { status: 400 });
     }

    try {
        const body = await req.json();

        // Ensure body is not empty
        if (Object.keys(body).length === 0) {
             return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
        }

        // Define fields we allow updating directly from the Edit modal
        const { name, displayName, description, isRequired, config } = body;

        // Build update data object, explicitly checking for undefined
        const updateData = {};
        if (name !== undefined) updateData.name = name; // Allow name to be an empty string for validation later
        if (displayName !== undefined) updateData.displayName = displayName;
        if (description !== undefined) updateData.description = description;
        if (config !== undefined) updateData.config = config; // Assume config structure is validated below
if (isRequired !== undefined) updateData.isRequired = isRequired;


        // --- Validation ---

        // 1. Validate name if it's being updated
        if (updateData.name !== undefined) {
            if (typeof updateData.name !== 'string' || updateData.name.trim() === '') {
                return NextResponse.json({ error: 'Action name cannot be empty' }, { status: 400 });
            }
        }

        // 2. Validate displayName and description if being updated
        if (updateData.displayName !== undefined && typeof updateData.displayName !== 'string') {
             return NextResponse.json({ error: 'Display name must be a string' }, { status: 400 });
        }
        if (updateData.description !== undefined && typeof updateData.description !== 'string') {
             return NextResponse.json({ error: 'Description must be a string' }, { status: 400 });
        }
if (updateData.isRequired !== undefined && typeof updateData.isRequired !== 'boolean') {
            return NextResponse.json({ error: '"isRequired" must be a boolean value' }, { status: 400 });
        }

        // 3. Validate config if it's being updated
         if (updateData.config !== undefined) {
             // Basic check that config is an object
             if (typeof updateData.config !== 'object' || updateData.config === null) {
                  return NextResponse.json({ error: 'Invalid config data format' }, { status: 400 });
             }

             // Check for 'type' within config
             if (!updateData.config.type) {
                  return NextResponse.json({ error: 'Action detail type is required within config' }, { status: 400 });
             }
             const configType = updateData.config.type;

             // Type-specific config validation (similar to POST)
             if (configType === 'Boolean') {
                 const { trueLabel, falseLabel } = updateData.config;
                  if (trueLabel === undefined || falseLabel === undefined || typeof trueLabel !== 'string' || typeof falseLabel !== 'string' || trueLabel.trim() === '' || falseLabel.trim() === '') {
                       return NextResponse.json({ error: '"True" and "False" labels are required and cannot be empty for Boolean type' }, { status: 400 });
                  }

             } else if (configType === 'Choice') {
                  const options = updateData.config.options;
                  if (!Array.isArray(options) || options.length === 0 || options.some(opt => !opt || typeof opt !== 'object' || typeof opt.label !== 'string' || opt.label.trim() === '')) {
                      return NextResponse.json({ error: 'Choice config requires a non-empty array of options, each with a non-empty string label' }, { status: 400 });
                  }
             }
              // Add validation for 'Action' type config if it has required fields (e.g., config.number for transfer)
               else if (configType === 'Action') {
                    // Example validation for transfer number
                   if (updateData.config.config?.number !== undefined && typeof updateData.config.config.number !== 'string') {
                        return NextResponse.json({ error: 'Transfer number must be a string' }, { status: 400 });
                   }
                   // Add other Action type specific validations here
               }
             // Add validation for other config types if necessary
         }

        // 4. Name Uniqueness Check (if name is changing)
        // Fetch the existing action first to compare its current name and ensure it exists
        const existingAction = await db.query.actions.findFirst({
             where: and(
                 eq(actions.id, actionId),
                 eq(actions.creatorId, userId) // Ensure the action belongs to the user
             )
        });

        if (!existingAction) {
             // If the action doesn't exist or doesn't belong to this user, return 404
             console.warn(`[API PUT /actions/${actionId}] Not Found: Action ID ${actionId} not found or not owned by user ${userId}.`);
             return NextResponse.json({ error: 'Action not found or you do not have permission to update it' }, { status: 404 });
        }

        // Now check if the name is being changed AND if the new name conflicts with another action
        // Compare the *trimmed* incoming name with the *existing* action's name
        if (updateData.name !== undefined && updateData.name.trim() !== existingAction.name) {
             console.log(`[API PUT /actions/${actionId}] Checking for name conflict: "${updateData.name.trim()}" for user ${userId}`);
             const conflictingAction = await db.query.actions.findFirst({
                 where: and(
                      eq(actions.creatorId, userId),
                      eq(actions.name, updateData.name.trim()),
                      ne(actions.id, actionId) // Exclude the current action from the check
                 ),
             });

             if (conflictingAction) {
                  console.warn(`[API PUT /actions/${actionId}] Conflict: Action with name "${updateData.name.trim()}" already exists (ID: ${conflictingAction.id}).`);
                  return NextResponse.json({ error: `An action with the name "${updateData.name.trim()}" already exists.` }, { status: 409 }); // 409 Conflict
             }
             console.log(`[API PUT /actions/${actionId}] Name conflict check passed.`);
         } else if (updateData.name !== undefined) {
              console.log(`[API PUT /actions/${actionId}] Name is not changing or is the same (was "${existingAction.name}", is "${updateData.name.trim()}"). Skipping conflict check.`);
         } else {
             console.log(`[API PUT /actions/${actionId}] Name is not included in update data. Skipping conflict check.`);
         }


        // --- Database Update ---
        // Perform the update only if there is something in updateData
        if (Object.keys(updateData).length === 0) {
             console.log(`[API PUT /actions/${actionId}] No updateable fields provided in body.`);
             // If no updateable fields were provided, maybe return 200 OK with the existing action, or 400 Bad Request
             return NextResponse.json(existingAction, { status: 200 }); // No changes made
        }

        console.log(`[API PUT /actions/${actionId}] Updating action ID ${actionId} for user ${userId} with data:`, updateData);

        const updatedActions = await db.update(actions)
            .set({
                ...updateData,
                updatedAt: new Date(), // Manually set updatedAt
            })
            .where(and(
                eq(actions.id, actionId),
                eq(actions.creatorId, userId) // Ensure the action belongs to the user
            ))
            .returning(); // Return the updated record

        // We already checked for existingAction, so updatedActions should contain one element if successful
        if (!updatedActions || updatedActions.length === 0) {
            // This case should ideally not happen if existingAction was found,
            // unless there was a concurrent delete or a deeper DB issue.
            console.error(`[API PUT /actions/${actionId}] DB Update failed despite action found. Result:`, updatedActions);
            return NextResponse.json({ error: 'Failed to update action in database' }, { status: 500 });
        }

        const updatedAction = updatedActions[0];
        console.log(`[API PUT /actions/${actionId}] Action ID ${actionId} updated successfully. Returned data:`, updatedAction);


        return NextResponse.json(updatedAction, { status: 200 });

    } catch (error) {
        console.error(`API Error /api/actions/${actionId} (PUT):`, error);
        // Provide a generic error message for unexpected errors
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}



// DELETE /api/actions/:actionId
// Deletes a specific action.
// DELETE /api/actions/:actionId (Looks correct based on previous review)
export async function DELETE(req, { params }) {
    const { userId } = auth();
    const actionId = parseActionId(params);

    if (!userId) {
        console.warn(`[API DELETE /actions/${actionId}] Unauthorized: No userId.`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!actionId) {
        console.warn(`[API DELETE /actions/${actionId}] Bad Request: Invalid action ID format.`);
        return NextResponse.json({ error: 'Invalid action ID' }, { status: 400 });
    }

    try {
        console.log(`[API DELETE /actions/${actionId}] Attempting to delete action ID ${actionId} for user ${userId}.`);

        // Delete the action, ensuring it belongs to the current user
        const deletedActions = await db.delete(actions)
            .where(and(
                eq(actions.id, actionId),
                eq(actions.creatorId, userId) // IMPORTANT: Only delete if owned by the user
            ))
            .returning({ id: actions.id }); // Return the ID of the deleted record

        if (!deletedActions || deletedActions.length === 0) {
             // If no rows were deleted, it means the action wasn't found for this user/ID
             console.warn(`[API DELETE /actions/${actionId}] Not Found: Action ID ${actionId} not found or not owned by user ${userId}.`);
             return NextResponse.json({ error: 'Action not found or you do not have permission to delete it' }, { status: 404 }); // 404 Not Found
        }

        console.log(`[API DELETE /actions/${actionId}] Action deleted successfully. Deleted ID: ${deletedActions[0].id}`);

        // Return success response
        return NextResponse.json({ success: true, deletedId: deletedActions[0].id }, { status: 200 });

    } catch (error) {
        console.error(`API Error /api/actions/${actionId} (DELETE):`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/*
// Optional: Add a GET handler here if you need to fetch a single action by ID
// This GET handler would respond to /api/actions/:actionId
export async function GET(req, { params }) {
     const { userId } = auth();
     const actionId = parseActionId(params);

     if (!userId) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
      if (!actionId) {
          return NextResponse.json({ error: 'Invalid action ID' }, { status: 400 });
      }

     try {
         const action = await db.query.actions.findFirst({
             where: eq(actions.id, actionId),
             where: eq(actions.creatorId, userId), // Ensure ownership
         });

         if (!action) {
             return NextResponse.json({ error: 'Action not found or not owned by user' }, { status: 404 });
         }

         return NextResponse.json(action, { status: 200 });

     } catch (error) {
         console.error(`API Error /api/actions/${actionId} (GET):`, error);
         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}
*/