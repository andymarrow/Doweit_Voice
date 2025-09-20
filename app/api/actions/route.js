// app/api/actions/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database"; // Your Drizzle DB instance
// Import the actions schema from your combined file
import { actions } from '@/lib/db/schemaCharacterAI';
import { eq, desc, or, isNull, and } from 'drizzle-orm'; // Import necessary Drizzle functions


// GET /api/actions
// Fetches all actions for the authenticated user.
export async function GET() {
    const { userId } = auth();

    // console.log(`[API GET /api/actions] Attempting to fetch actions. Current userId from auth: ${userId}`); // Keep for debugging

    if (!userId) {
        // console.log('[API GET /api/actions] Unauthorized: No userId from auth.'); // Keep for debugging
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch actions owned by the current user (source = 'custom')
         const userCustomActions = await db.query.actions.findMany({
             where: eq(actions.creatorId, userId),
             orderBy: [desc(actions.createdAt)], // Order by creation date, newest first
         });

        // If you have system/template actions you want to also appear in this list:
        // Fetch system/template actions (assuming creatorId is null or they have a specific source)
        // This depends on how you modeled system/template actions.
        // For now, let's assume this GET is only for *user-created* actions ('custom').
        // If you need others, you'd fetch them separately or modify the query.

        // console.log(`[API GET /api/actions] Drizzle query executed for user ${userId}. Found ${userCustomActions.length} custom actions.`); // Keep for debugging
        // console.log('[API GET /api/actions] Fetched Actions Sample:', userCustomActions.slice(0, 5)); // Log a sample

        // Return the list of user's custom actions
        return NextResponse.json(userCustomActions, { status: 200 });

    } catch (error) {
        console.error("API Error /api/actions (GET):", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// POST /api/actions
// Creates a new action for the authenticated user.
export async function POST(req) {
    const { userId } = auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Basic validation matching frontend form data structure
        // Frontend sends { name, type (broad), details (config) }
        const { name, type,isRequired, details } = body; // 'type' from frontend is the broad type, e.g., 'Information Extractor'

        // Validate required fields
        if (!name || typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ error: 'Action name is required.' }, { status: 400 });
        }
         if (!details || typeof details !== 'object') {
              return NextResponse.json({ error: 'Action configuration details are required.' }, { status: 400 });
         }
          if (!details.type) {
               return NextResponse.json({ error: 'Action detail type (Text, Boolean, Choice, Action) is required in details configuration.' }, { status: 400 });
          }
// ***** NEW: Validate isRequired *****
        if (isRequired === undefined || typeof isRequired !== 'boolean') {
             return NextResponse.json({ error: '"isRequired" must be a boolean value.' }, { status: 400 });
        }

         // Basic validation based on details.type config
         if (details.type === 'Boolean') {
              if (details.trueLabel === undefined || details.falseLabel === undefined || details.trueLabel.trim() === '' || details.falseLabel.trim() === '') {
                   return NextResponse.json({ error: 'Boolean config requires non-empty trueLabel and falseLabel.' }, { status: 400 });
              }
         } else if (details.type === 'Choice') {
             if (!Array.isArray(details.options) || details.options.length === 0 || details.options.some(opt => !opt.label || typeof opt.label !== 'string' || !opt.label.trim())) {
                 return NextResponse.json({ error: 'Choice config requires a non-empty array of options with non-empty labels.' }, { status: 400 });
             }
         }
         // Add more validation for 'Action' type config if needed


        // Check for existing action with the same name for this user (based on schema unique index)
        // Query needs to be structured correctly for the unique index (creatorId, name)
         const existingAction = await db.query.actions.findFirst({
             where: and(
                  eq(actions.creatorId, userId), // For the current user
                  eq(actions.name, name.trim())
             ),
         });
         // Need `and` from drizzle-orm for the query above if not already imported
         // import { eq, desc, or, isNull, and } from 'drizzle-orm';


        if (existingAction) {
             console.warn(`[API POST /api/actions] Conflict: Action name "${name.trim()}" already exists for user ${userId}.`);
            return NextResponse.json({ error: `An action with the name "${name.trim()}" already exists.` }, { status: 409 }); // 409 Conflict
        }


        // Insert the new action record into the database
        const newActions = await db.insert(actions).values({
             creatorId: userId, // Assign the current user as the creator
             name: name.trim(),
             // Optional: Generate a default display name if not provided by frontend
             displayName: body.displayName || name.trim().replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
             description: body.description || '', // Use provided description or empty string
             type: type, // Broad type from frontend
             isRequired: isRequired,
             config: details, // Save the detailed config object
             source: 'custom', // Assuming user-created actions are 'custom'
             // createdAt and updatedAt will be set by defaultNow()
        }).returning(); // Return the inserted action object


        if (!newActions || newActions.length === 0) {
             console.error(`[API POST /api/actions] DB Insert failed for user ${userId}. Insert result:`, newActions);
             return NextResponse.json({ error: 'Failed to create action in database' }, { status: 500 });
        }

        const newAction = newActions[0];
        console.log(`[API POST /api/actions] Action created successfully for user ${userId}. ID: ${newAction.id}`);

        return NextResponse.json(newAction, { status: 201 }); // 201 Created

    } catch (error) {
        console.error("API Error /api/actions (POST):", error);
        // Check if it's a known constraint violation (e.g., if the unique index check failed differently)
        // Drizzle throws specific errors for constraints
        if (error.message.includes('action_creator_name_unq')) { // Check for the unique index name
             console.warn(`[API POST /api/actions] Likely unique constraint violation for user ${userId} and name "${body?.name}".`);
             return NextResponse.json({ error: `An action with the name "${body?.name}" already exists.` }, { status: 409 }); // 409 Conflict
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Make sure you import `and` for the query
// import { eq, desc, or, isNull, and } from 'drizzle-orm';