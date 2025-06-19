// app/api/chat/[characterId]/message/route.js
import { NextResponse } from 'next/server';
// Correct import: Get both auth and clerkClient
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/configs/db';
import { characters, chatMessages, users } from '@/lib/db/schemaCharacterAI';
import { eq, and, desc, asc, sql } from 'drizzle-orm'; // Import sql for increment
import { getAiStreamResponse } from '@/lib/google-ai/gemini-chat-stream'; // Your AI utility
import { uploadFileToFirebase } from '@/lib/firebase/upload'; // Your Firebase upload utility


const CHAT_CONTEXT_LIMIT = 30; // Number of previous messages to send for context

export async function POST(req, { params }) {
    const { characterId } = params;
    const { userId } = auth(); // Get user ID from Clerk

    if (!userId) {
        return NextResponse.json({ error: 'Authentication required to chat' }, { status: 401 });
    }

    if (!characterId) {
        return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

     const charIdInt = parseInt(characterId);
     if (isNaN(charIdInt)) {
          return NextResponse.json({ error: 'Invalid Character ID' }, { status: 400 });
     }

    try {
        const { text: userMessageText } = await req.json(); // Get user message text from request body

        if (!userMessageText || typeof userMessageText !== 'string' || userMessageText.trim().length === 0) {
            return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
        }

        // 1. Fetch Character Info (don't need creator name here)
        const character = await db.query.characters.findFirst({
            where: eq(characters.id, charIdInt),
            columns: { // Select only necessary fields for AI prompting and access check
                id: true, name: true, description: true, greeting: true,
                voiceId: true, language: true, behavior: true, creatorId: true,
            },
        });

        if (!character) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        // Ensure character is public or user is the creator if private
        if (!character.isPublic && character.creatorId !== userId) {
             return NextResponse.json({ error: 'Unauthorized to chat with this private character' }, { status: 403 });
        }


        // 2. Ensure user exists in our DB (or create if first time chatting)
         // Use the imported clerkClient directly
        let userRecord = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (!userRecord) {
            const clerkUser = await clerkClient.users.getUser(userId);
            if (!clerkUser) {
                 console.error("Clerk user not found for ID:", userId);
                 // This case should ideally not happen if Clerk auth passed, but good practice
                 return NextResponse.json({ error: 'Clerk user not found' }, { status: 400 });
            }
            [userRecord] = await db.insert(users).values({
                id: userId,
                username: clerkUser.username || 'New User',
                email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
                profileImageUrl: clerkUser.imageUrl || null,
                createdAt: new Date(), // Ensure timestamps are set
                updatedAt: new Date(),
            }).returning();
            console.log("Created new user record in DB during chat:", userRecord);
        }


        // 3. Fetch recent chat history for context
        const chatSessionId = `${userId}_${charIdInt}`;
        // Fetch ordered ascending to easily provide chronological history to AI
        const recentMessages = await db.query.chatMessages.findMany({
            where: eq(chatMessages.chatSessionId, chatSessionId),
            orderBy: [asc(chatMessages.timestamp)], // Chronological order
             // Limit the number of messages fetched for context
            limit: CHAT_CONTEXT_LIMIT,
             // Select only text, sender, timestamp for AI context
            columns: { text: true, sender: true, timestamp: true },
        });

        // Prepare history for the AI model (already in chronological order)
         const historyForAI = recentMessages.map(msg => ({
             sender: msg.sender,
             text: msg.text,
             // Optional: include timestamp if AI model can use it
         }));

         // Add the user's current message to the history sent to the AI *for this turn's context*
         // Do NOT save it to DB yet if saving happens after getting AI response
         // If saving happens BEFORE AI call (as implemented previously), the history should include the user message already
         // Let's stick to saving user message BEFORE the AI call and including it in historyForAI
         // historyForAI.push({ sender: 'user', text: userMessageText.trim() }); // <-- Already added in previous implementation


        // 4. Save User Message to DB
        const newUserMessage = {
            chatSessionId: chatSessionId,
            userId: userId,
            characterId: charIdInt,
            sender: 'user',
            text: userMessageText.trim(),
            timestamp: new Date(),
        };
        // Insert the user message *before* calling the AI
         await db.insert(chatMessages).values(newUserMessage);
        console.log("Saved user message to DB.");


        // 5. Call Google AI Studio Stream API
         // Pass the character config and the history including the new user message
         const aiResponse = await getAiStreamResponse(userMessageText.trim(), historyForAI, {
             name: character.name,
             description: character.description,
             greeting: character.greeting,
             language: character.language,
             voiceId: character.voiceId, // Use AI Studio voice ID
             behavior: character.behavior || [], // Ensure behavior is an array
         });

         // aiResponse will contain { text: string, audioData: string|null (base64) }

        // 6. Handle AI Response Audio (Save Base64 to Firebase)
        let aiAudioUrl = null;
        if (aiResponse.audioData) {
            // Convert base64 audio data to a Buffer
            const audioBuffer = Buffer.from(aiResponse.audioData, 'base64');

            // Upload the audio buffer to Firebase Storage
            // Use a specific folder like 'chat-audio' and include characterId and a timestamp
            aiAudioUrl = await uploadFileToFirebase(audioBuffer, userId, `character-chat-audio/${charIdInt}`);

             if (!aiAudioUrl) {
                 console.error("Failed to upload AI audio to Firebase.");
                 // Proceed without audio URL if upload fails
             } else {
                  console.log("AI audio uploaded successfully:", aiAudioUrl);
             }
        }


        // 7. Save AI Message to DB
        const newAiMessage = {
            chatSessionId: chatSessionId,
            userId: userId, // Still linked to the user in this session
            characterId: charIdInt,
            sender: 'character',
            text: aiResponse.text,
            audioUrl: aiAudioUrl, // Save the uploaded audio URL
            timestamp: new Date(), // Use a new timestamp for the AI response
        };
         // Insert the AI message
         await db.insert(chatMessages).values(newAiMessage);
        console.log("Saved AI message to DB.");


        // 8. Increment Character Chat Count
        await db.update(characters)
             .set({ chats: sql`${characters.chats} + 1` }) // Use raw SQL to increment
             .where(eq(characters.id, charIdInt));


        // 9. Return AI message details to the frontend
        return NextResponse.json({
             aiMessage: {
                // Return ID from DB if available, otherwise use timestamp/unique string
                // If you need the DB ID, change the insert above to use `.returning()`
                // For now, use a temporary client-side id format + timestamp
                id: `ai-${Date.now()}`, // Temporary ID for frontend
                text: newAiMessage.text,
                audioUrl: newAiMessage.audioUrl, // Return the Firebase audio URL
                sender: 'character',
                timestamp: newAiMessage.timestamp.toISOString(), // Return as ISO string
             }
         }, { status: 200 });

    } catch (error) {
        console.error(`API Error /api/chat/${characterId}/message (POST):`, error);
        // Handle errors during AI call or saving
        // Return a generic error message to the frontend
        return NextResponse.json({ error: 'Failed to get character response', aiMessage: { // Optionally send a fallback AI message
             id: `ai-error-${Date.now()}`,
             text: "Sorry, I encountered an error and couldn't respond.",
             sender: 'character',
             timestamp: new Date().toISOString(),
             audioUrl: null,
         } }, { status: 500 });
    }
}