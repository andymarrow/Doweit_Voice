// app/api/knowledgebases/templates/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database";
import { knowledgeBases, users } from '@/lib/db/schemaCharacterAI'; // Import KB and User schemas
import { eq, or, isNull, desc } from 'drizzle-orm'; // Ensure all necessary imports are here


// --- GET function: Fetch public Knowledge Bases (Templates) ---
// GET /api/knowledgebases/templates
export async function GET() {
    const { userId } = auth();

    // Access to templates typically requires authentication,
    // even though the templates themselves aren't user-specific.
     if (!userId) {
        console.log('[API KB TEMPLATES GET] Unauthorized: No userId.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[API KB TEMPLATES GET] Fetching public knowledge bases for user ${userId}`);

        // Fetch knowledge bases that are marked as public OR have a null creatorId (system templates)
        const publicKnowledgeBases = await db.query.knowledgeBases.findMany({
            where: or(
                 eq(knowledgeBases.isPublic, true),
                 isNull(knowledgeBases.creatorId) // Assuming system templates have null creatorId
            ),
            orderBy: [desc(knowledgeBases.createdAt)], // Order by creation date
             // Include creator details to display "by Author"
             with: {
                 creator: {
                     // *** FIX: Explicitly select columns from the users table ***
                     // Ensure the syntax is correct here. This looks right, but sometimes
                     // a re-check helps.
                     columns: {
                          id: true, // Include ID for potential linking or display
                          firstName: true,
                          lastName: true
                     }
                 }
             },
             // Select specific fields relevant for the template list view
             columns: {
                 id: true,
                 name: true,
                 description: true,
                 isPublic: true,
                 content: true, // Include content to copy when used
                 // status: true, // Status might not be relevant for templates
                 // Add other template-specific metadata like downloads/likes if they existed in schema
             },
        });

        console.log(`[API KB TEMPLATES GET] Found ${publicKnowledgeBases.length} public knowledge bases.`);
         // console.log('[API KB TEMPLATES GET] Fetched Templates Sample (first 2):', publicKnowledgeBases.slice(0, 2)); // Log a sample

        // Format the author name if creator relation was fetched
        const responseData = publicKnowledgeBases.map(kb => ({
             ...kb,
             // Add an 'author' field based on the joined creator data
             author: kb.creator ? `${kb.creator.firstName || ''} ${kb.creator.lastName || ''}`.trim() || 'System' : 'System', // Default to 'System' if no creator or creator is null
             // Remove the nested creator object from the response if not needed on frontend
             creator: undefined,
             // Add a flag indicating if the user is the owner (always false for templates from this endpoint)
             isOwner: false,
        }));


        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("API Error /api/knowledgebases/templates (GET):", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}