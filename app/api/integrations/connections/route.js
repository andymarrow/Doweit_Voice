// app/api/integrations/connections/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database";
import { userConnections } from '@/lib/db/schemaCharacterAI';
import { eq } from 'drizzle-orm';

// This endpoint's only job is to tell the frontend which services
// the currently logged-in user has successfully connected.

export async function GET() {
    // 1. Authenticate the user
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Query the database for this user's connections
        const connections = await db.query.userConnections.findMany({
            where: eq(userConnections.userId, userId),
            // We only need to know the name of the provider (e.g., 'elevenlabs')
            columns: {
                provider: true 
            }
        });

        // 3. Transform the data into a simple array of strings
        // The frontend receives: ['elevenlabs', 'twilio'] instead of [{ provider: 'elevenlabs' }, ...]
        // This is much easier to work with.
        const connectedProviders = connections.map(c => c.provider);

        console.log(`[API CONNECTIONS GET] Found connected providers for user ${userId}:`, connectedProviders);

        // 4. Return the array as a JSON response
        return NextResponse.json(connectedProviders, { status: 200 });

    } catch (error) {
        console.error("API Error /api/integrations/connections (GET):", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}