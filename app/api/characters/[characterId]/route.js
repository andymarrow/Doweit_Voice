// app/api/characters/[characterId]/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database";
import { characters, characterLikes, users } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';

export async function GET(req, { params }) {
    const { characterId } = params; // Get character ID from the URL params
    const { userId: currentUserId } = auth(); // Get current user ID from Clerk (can be null)

    if (!characterId) {
        return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    try {
        // Fetch the character details, including creator's username
         const characterResult = await db.select({
             character: characters,
             creatorUsername: users.username, // Select creator's username
             // Also check if the current user likes this character
             liked: characterLikes.userId, // Will be null if not liked by user
         })
         .from(characters)
         .leftJoin(users, eq(characters.creatorId, users.id)) // Join to get creator info
         // Left join with characterLikes table for the current user
         .leftJoin(characterLikes, and(
             eq(characters.id, characterLikes.characterId),
             currentUserId ? eq(characterLikes.userId, currentUserId) : undefined // Join only if userId exists
         ))
         .where(eq(characters.id, parseInt(characterId))) // Filter by character ID (parse as integer)
         .limit(1); // Expect only one result

        const characterRow = characterResult[0];

        if (!characterRow) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

         // If the character is private, ensure the current user is the creator
         if (!characterRow.character.isPublic && characterRow.character.creatorId !== currentUserId) {
             return NextResponse.json({ error: 'Unauthorized access to private character' }, { status: 403 });
         }

        // Format the result
        const character = {
            ...characterRow.character,
            creatorName: characterRow.creatorUsername || 'Unknown Creator', // Use fetched username
            // Ensure engagement metrics are numbers
            likes: characterRow.character.likes || 0,
            chats: characterRow.character.chats || 0,
             // Note: shares is a placeholder on frontend
            shares: 0, // Provide a default or fetch if tracked differently
            // Indicate if the current user likes this character
            isLikedByCurrentUser: !!characterRow.liked, // True if liked.userId is not null
        };


        return NextResponse.json(character, { status: 200 });

    } catch (error) {
        console.error(`API Error /api/characters/${characterId} (GET):`, error);
        return NextResponse.json({ error: 'Internal server error fetching character' }, { status: 500 });
    }
}