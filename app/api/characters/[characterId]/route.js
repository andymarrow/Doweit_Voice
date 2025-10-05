// app/api/characters/[characterId]/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { characters, characterLikes, users } from "@/lib/db/schemaCharacterAI";
import { eq, and, sql, exists } from "drizzle-orm"; // Ensure sql and exists are imported

export async function GET(req, { params }) {
	const { characterId } = params;
	const { user } = await getSession(await headers());
	const currentUserId = user?.id;

	if (!characterId) {
		return NextResponse.json(
			{ error: "Character ID is required" },
			{ status: 400 },
		);
	}

	try {
		// Use the more robust subquery method to prevent Drizzle errors
		const characterResult = await db
			.select({
				// Explicitly select all fields from the 'characters' table
				id: characters.id,
				creatorId: characters.creatorId,
				name: characters.name,
				tagline: characters.tagline,
				description: characters.description,
				greeting: characters.greeting,
				avatarUrl: characters.avatarUrl,
				voiceId: characters.voiceId,
				voiceName: characters.voiceName,
				voiceProvider: characters.voiceProvider,
				language: characters.language,
				behavior: characters.behavior,
				isPublic: characters.isPublic,
				likes: characters.likes,
				chats: characters.chats,
				// *** THE FIX IS HERE: Select 'users.name' instead of 'users.username' ***
				creatorName: users.name,
				// Use the subquery for the liked status
				isLikedByCurrentUser: currentUserId
					? exists(
							db
								.select({ val: 1 })
								.from(characterLikes)
								.where(
									and(
										eq(characterLikes.characterId, characters.id),
										eq(characterLikes.userId, currentUserId),
									),
								),
						).as("isLikedByCurrentUser")
					: sql<boolean>`false`.as("isLikedByCurrentUser"),
			})
			.from(characters)
			.leftJoin(users, eq(characters.creatorId, users.id)) // Join to get creator info
			.where(eq(characters.id, parseInt(characterId))) // Filter by character ID
			.limit(1);

		const character = characterResult[0];

		if (!character) {
			return NextResponse.json(
				{ error: "Character not found" },
				{ status: 404 },
			);
		}

		// If the character is private, ensure the current user is the creator
		if (!character.isPublic && character.creatorId !== currentUserId) {
			return NextResponse.json(
				{ error: "Unauthorized access to private character" },
				{ status: 403 },
			);
		}

        // The query result is already in the correct flat format, so we can return it directly.
        // We add the 'shares' placeholder as before.
		return NextResponse.json({ ...character, shares: 0 }, { status: 200 });

	} catch (error) {
		console.error(`API Error /api/characters/${characterId} (GET):`, error);
		return NextResponse.json(
			{ error: "Internal server error fetching character" },
			{ status: 500 },
		);
	}
}