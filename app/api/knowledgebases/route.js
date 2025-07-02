// app/api/knowledgebases/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/configs/db';
import { knowledgeBases } from '@/lib/db/schemaCharacterAI'; // Import KB schema
import { eq, desc, and } from 'drizzle-orm';

// Define allowed fields for creating a new KB via POST
const ALLOWED_KB_CREATE_FIELDS = [
    'name',
    'description',
    'isPublic', // Might allow setting this on creation, though typically starts false
    'content', // Initial content
    'status', // Initial status, defaults to 'processing' usually
];


// --- GET function: Fetch user's owned Knowledge Bases ---
// GET /api/knowledgebases
export async function GET() {
    const { userId } = auth();

    if (!userId) {
        console.log('[API KB LIST GET] Unauthorized: No userId.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[API KB LIST GET] Fetching knowledge bases for user ${userId}`);

        // Fetch knowledge bases where the current user is the creator
        const myKnowledgeBases = await db.query.knowledgeBases.findMany({
            where: eq(knowledgeBases.creatorId, userId),
            orderBy: [desc(knowledgeBases.createdAt)], // Order by creation date, newest first
            // Select specific fields needed for the list view
            columns: {
                 id: true,
                 name: true,
                 description: true,
                 isPublic: true,
                 status: true,
                 createdAt: true,
                 updatedAt: true,
                 // Don't fetch the full 'content' JSONB here for performance
                 // Add counts for content items if needed in the list view later
            }
        });

        console.log(`[API KB LIST GET] Found ${myKnowledgeBases.length} knowledge bases for user ${userId}.`);

        // Return the list of owned KBs
        // Add isOwner: true to each object for consistency, although they are all owned here
        const responseData = myKnowledgeBases.map(kb => ({ ...kb, isOwner: true }));

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("API Error /api/knowledgebases (GET):", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// --- POST function: Create a new Knowledge Base ---
// POST /api/knowledgebases
export async function POST(req) {
    const { userId } = auth();

    if (!userId) {
        console.log('[API KB CREATE POST] Unauthorized: No userId.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        console.log('[API KB CREATE POST] Received body:', body);


        // Basic validation for required fields for creation
        const { name } = body;
         if (!name || typeof name !== 'string' || !name.trim()) {
             console.warn('[API KB CREATE POST] Validation failed: Missing or invalid name.');
            return NextResponse.json({ error: 'Knowledge Base name is required.' }, { status: 400 });
        }
        // Optional: More validation for description, content structure if needed


        // Build the data object for insertion, using allowed fields
        const insertData = {
            creatorId: userId, // Automatically assign the current user as creator
             name: name.trim(),
            description: body.description || '', // Default empty string if not provided
             isPublic: body.isPublic === true, // Ensure boolean, default to false if not explicitly true
             content: Array.isArray(body.content) ? body.content : [], // Ensure array, default empty
             status: body.status || 'processing', // Default status if not provided
             // createdAt and updatedAt will be set by defaultNow()
        };

         // Filter insertData to only include allowed fields from the request body (except creatorId which is set based on auth)
         const finalInsertData = { creatorId: userId, name: insertData.name }; // Start with required fields
         for (const field in body) {
             if (ALLOWED_KB_CREATE_FIELDS.includes(field) && field !== 'name') { // Skip name as it's trimmed and handled
                 finalInsertData[field] = insertData[field]; // Use the potentially transformed/defaulted value
             }
         }
          // Ensure boolean fields are present even if false, if they were allowed in the body
          if (ALLOWED_KB_CREATE_FIELDS.includes('isPublic') && body.isPublic === undefined) {
              finalInsertData.isPublic = false;
          }
           if (ALLOWED_KB_CREATE_FIELDS.includes('content') && body.content === undefined) {
              finalInsertData.content = [];
          }
           if (ALLOWED_KB_CREATE_FIELDS.includes('status') && body.status === undefined) {
              finalInsertData.status = 'processing';
          }


         console.log('[API KB CREATE POST] Prepared insert data:', finalInsertData);


        // Check for existing KB with the same name for this user (optional, but good UX)
        // Based on the unique index (creatorId, name)
         const existingKb = await db.query.knowledgeBases.findFirst({
             where: and(
                  eq(knowledgeBases.creatorId, userId),
                  eq(knowledgeBases.name, finalInsertData.name)
             ),
         });

        if (existingKb) {
             console.warn(`[API KB CREATE POST] Conflict: KB name "${finalInsertData.name}" already exists for user ${userId}.`);
            return NextResponse.json({ error: `A Knowledge Base with the name "${finalInsertData.name}" already exists.` }, { status: 409 }); // 409 Conflict
        }


        // Insert the new KB record
        const newKbs = await db.insert(knowledgeBases).values(finalInsertData).returning();


        if (!newKbs || newKbs.length === 0) {
             console.error(`[API KB CREATE POST] DB Insert failed for user ${userId}. Insert result:`, newKbs);
             return NextResponse.json({ error: 'Failed to create Knowledge Base in database' }, { status: 500 });
        }

        const newKb = newKbs[0];
        console.log(`[API KB CREATE POST] Knowledge Base created successfully for user ${userId}. ID: ${newKb.id}`);

        // Return the newly created KB object
        // Include isOwner: true flag as the user is the creator
        return NextResponse.json({ ...newKb, isOwner: true }, { status: 201 }); // 201 Created

    } catch (error) {
        console.error("API Error /api/knowledgebases (POST):", error);
        // Check for known constraint violation (e.g., unique index)
         if (error.message.includes('knowledge_bases_creator_id_name_unq')) { // Check for the unique index name
             console.warn(`[API KB CREATE POST] Likely unique constraint violation for user ${userId} and name "${body?.name}".`);
              return NextResponse.json({ error: `A Knowledge Base with the name "${body?.name}" already exists.` }, { status: 409 }); // 409 Conflict
         }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}