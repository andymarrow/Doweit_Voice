// app/api/characters/[characterId]/like/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database";
import { characters, characterLikes } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';

export async function POST(req, { params }) {
    const { characterId } = params;
    const { userId } = auth(); // Get user ID from Clerk

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!characterId) {
        return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

     const charIdInt = parseInt(characterId);
     if (isNaN(charIdInt)) {
          return NextResponse.json({ error: 'Invalid Character ID' }, { status: 400 });
     }

    try {
        // Check if the user has already liked this character
        const existingLike = await db.query.characterLikes.findFirst({
            where: and(
                eq(characterLikes.userId, userId),
                eq(characterLikes.characterId, charIdInt)
            )
        });

        let message;
        let status = 200;

        if (existingLike) {
            // If liked, remove the like
            await db.delete(characterLikes)
                    .where(and(
                        eq(characterLikes.userId, userId),
                        eq(characterLikes.characterId, charIdInt)
                    ));
            // Decrement the likes count on the character
             await db.update(characters)
                     .set({ likes: sql`${characters.likes} - 1` }) // Use raw SQL to decrement
                     .where(eq(characters.id, charIdInt));
            message = 'Character unliked successfully';
        } else {
            // If not liked, add a new like
             // Add user to DB if they don't exist (re-using logic from POST /api/characters)
            let userRecord = await db.query.users.findFirst({ where: eq(users.id, userId) });
             if (!userRecord) {
                 const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
                 const clerkUser = await clerkClient.users.getUser(userId);
                 [userRecord] = await db.insert(users).values({
                     id: userId,
                     username: clerkUser.username || 'User', email: clerkUser.emailAddresses?.[0]?.emailAddress, profileImageUrl: clerkUser.imageUrl
                 }).returning();
             }


            await db.insert(characterLikes).values({
                userId: userId,
                characterId: charIdInt,
            });
             // Increment the likes count on the character
             await db.update(characters)
                     .set({ likes: sql`${characters.likes} + 1` }) // Use raw SQL to increment
                     .where(eq(characters.id, charIdInt));
            message = 'Character liked successfully';
            status = 201; // Created
        }

         // Optional: Fetch the updated character details including the new like count
         const updatedCharacter = await db.query.characters.findFirst({
             where: eq(characters.id, charIdInt),
             with: { // Join to see if the current user now likes it (redundant check, but useful if returning full character)
                 characterLikes: {
                     where: eq(characterLikes.userId, userId),
                     columns: { userId: true },
                     limit: 1,
                 },
             },
         });

        // Return the updated character data (or just success message)
        return NextResponse.json({
             message,
             // Return updated likes count and current user's like status
             likes: updatedCharacter?.likes ?? 0,
             isLikedByCurrentUser: !existingLike, // If there was no existing like, it's now liked
         }, { status });

    } catch (error) {
        console.error(`API Error /api/characters/${characterId}/like (POST):`, error);
        // Handle potential unique constraint violation if user double-clicks quickly without optimistic update
        if (error.message.includes('duplicate key value violates unique constraint')) {
             // This might happen if the frontend tries to add a like twice
             return NextResponse.json({ error: 'Already liked' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal server error toggling like status' }, { status: 500 });
    }
}