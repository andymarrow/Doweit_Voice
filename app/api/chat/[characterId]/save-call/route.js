// app/api/chat/[characterId]/save-call/route.js
import { NextResponse } from 'next/server';
import { db } from "@/lib/database";
import { chatMessages } from '@/lib/db/schemaCharacterAI'; // Adjust the import path if necessary
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server'; // Import auth to get user ID securely

export async function POST(req, { params }) {
    try {
        const { userId } = auth(); // Get user ID securely from Clerk auth

        if (!userId) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const characterId = parseInt(params.characterId, 10); // Ensure characterId is a number
        if (isNaN(characterId)) {
             return NextResponse.json({ error: 'Invalid character ID' }, { status: 400 });
        }

        // The frontend sends the full list of messages
        const { messages } = await req.json();

        if (!Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
        }

        if (messages.length === 0) {
             console.log(`No messages to save for user ${userId} and character ${characterId}.`);
             return NextResponse.json({ message: 'No messages to save' }, { status: 200 });
        }

        // Construct the chatSessionId
        const chatSessionId = `${userId}_${characterId}`;

        // Prepare messages for insertion
        // Filter out 'system' messages as they might not be needed in history,
        // and ensure sender is 'user' or 'character'.
        // Also, ensure we only save messages that aren't duplicates based on ID
        // received from the frontend. This assumes the frontend IDs (Vapi timestamp+sender+random or text_)
        // are reliable for marking unique messages within a session state.
        // However, to avoid *saving* duplicates into the DB across page loads
        // or multiple save attempts for the same conversation segments, a better
        // approach might be to check for existing messages in the DB *before* inserting.
        // But for simplicity, we'll trust the frontend IDs are unique for this batch
        // and rely on a potential future de-duplication process if needed.
        const messagesToInsert = messages
             .filter(msg => msg.sender !== 'system') // Don't save system messages
             .map(msg => ({
                 // Note: The ID field in the DB is `serial` (auto-increment),
                 // so we don't provide `msg.id` here.
                 chatSessionId: chatSessionId,
                 userId: userId,
                 characterId: characterId,
                 sender: msg.sender, // 'user' or 'character'
                 text: msg.text,
                 audioUrl: msg.audioUrl || null, // Save audioUrl if present, else null
                 // Use the timestamp from the message object, or default to now if missing
                 timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
             }));


         if (messagesToInsert.length === 0) {
             console.log(`No non-system messages to save for user ${userId} and character ${characterId}.`);
             return NextResponse.json({ message: 'No non-system messages to save' }, { status: 200 });
         }


        // TODO: Optional: Implement a check here to avoid saving duplicate messages
        // from different save-call events if the same messages are sent multiple times.
        // This would involve querying existing messages for this session and filtering
        // `messagesToInsert` based on text content and timestamp proximity, or relying
        // on a unique constraint if you were using a different ID strategy in the DB.
        // For now, we'll just insert the batch.

        // Insert messages into the database
        // Use `onConflictDoNothing` to handle potential duplicates if, for example,
        // the same message batch is sent twice rapidly. This requires a UNIQUE constraint
        // on the combination of fields you want to be unique (e.g., chatSessionId, sender, timestamp, text content might be too complex).
        // Given the current schema, simple insert is fine, relying on the serial ID.
        // If you add a unique constraint later (e.g., on chatSessionId, timestamp, sender),
        // you'd use `onConflictDoNothing`.
         await db.insert(chatMessages).values(messagesToInsert);


        return NextResponse.json({ message: 'Call history saved successfully' }, { status: 200 });

    } catch (error) {
        console.error("Error saving call history:", error);
        return NextResponse.json({ error: 'Failed to save call history', details: error.message }, { status: 500 });
    }
}