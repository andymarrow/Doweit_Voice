// app/api/chat/[characterId]/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/configs/db';
import { chatMessages } from '@/lib/db/schemaCharacterAI';
import { eq, and, desc } from 'drizzle-orm';

// Define the limit for chat history to fetch
const CHAT_HISTORY_LIMIT = 30; // As per your requirement

export async function GET(req, { params }) {
    const { characterId } = params;
    const { userId } = auth(); // Get user ID from Clerk

    if (!userId) {
        // If chat requires login, return unauthorized
        return NextResponse.json({ error: 'Authentication required to view chat history' }, { status: 401 });
    }

    if (!characterId) {
        return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

     const charIdInt = parseInt(characterId);
     if (isNaN(charIdInt)) {
          return NextResponse.json({ error: 'Invalid Character ID' }, { status: 400 });
     }


    // Determine the unique chat session ID for this user and character
    const chatSessionId = `${userId}_${charIdInt}`;

    try {
        // Fetch chat messages for this session, ordered by timestamp, limited
        // We fetch slightly more than the limit to ensure we get the *last* N messages
        // and then reverse them if needed or order ascending directly if DB supports that efficiently.
        // Drizzle's `orderBy(asc(chatMessages.timestamp))` is fine.

        const messages = await db.query.chatMessages.findMany({
            where: and(
                eq(chatMessages.chatSessionId, chatSessionId),
                // Optional: Add filter for userId if chatSessionId isn't enough guarantee
                // eq(chatMessages.userId, userId) // Redundant if chatSessionId includes userId
            ),
            orderBy: [asc(chatMessages.timestamp)], // Order ascending for chronological order
            // limit: CHAT_HISTORY_LIMIT, // Applying limit might truncate history if not ordered correctly
            // offset? // No offset needed for "last N"
        });

        // If we fetched more than needed to ensure the last N:
        // const lastNMessages = messages.slice(-CHAT_HISTORY_LIMIT);
        // For `orderBy(asc)`, limit works as expected - it gets the first N messages chronologically.
        // If you need the *last* N messages, you'd order by `desc` and then `reverse()` the array in JS,
        // or use window functions in SQL for more complex paging.
        // Let's stick to `orderBy(asc)` and just return what's fetched for simplicity.

        console.log(`Fetched ${messages.length} chat messages for session ${chatSessionId}`);

        // Return the chat messages
        return NextResponse.json({ messages }, { status: 200 });

    } catch (error) {
        console.error(`API Error /api/chat/${characterId} (GET):`, error);
        return NextResponse.json({ error: 'Internal server error fetching chat history' }, { status: 500 });
    }
}