// app/api/characters/[characterId]/like/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { characters, characterLikes } from "@/lib/db/schemaCharacterAI";
// *** THE FIX IS HERE: Added 'sql' to the import list ***
import { eq, and, sql } from "drizzle-orm";

export async function POST(req, { params }) {
	const { characterId } = params;
	const { user } = await getSession(await headers());
	const userId = user?.id;

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!characterId) {
		return NextResponse.json(
			{ error: "Character ID is required" },
			{ status: 400 },
		);
	}

	const charIdInt = parseInt(characterId);
	if (isNaN(charIdInt)) {
		return NextResponse.json(
			{ error: "Invalid Character ID" },
			{ status: 400 },
		);
	}

	try {
		// Check if the user has already liked this character
		const existingLike = await db.query.characterLikes.findFirst({
			where: and(
				eq(characterLikes.userId, userId),
				eq(characterLikes.characterId, charIdInt),
			),
		});

		let message;
		let status = 200;

		if (existingLike) {
			// If liked, remove the like
			await db
				.delete(characterLikes)
				.where(eq(characterLikes.id, existingLike.id)); // Safer to delete by primary key

			// Decrement the likes count on the character
			await db
				.update(characters)
				.set({ likes: sql`${characters.likes} - 1` })
				.where(eq(characters.id, charIdInt));
			message = "Character unliked successfully";
		} else {
			// If not liked, add the like
			await db.insert(characterLikes).values({
				userId: userId,
				characterId: charIdInt,
			});

			// Increment the likes count on the character
			await db
				.update(characters)
				.set({ likes: sql`${characters.likes} + 1` })
				.where(eq(characters.id, charIdInt));
			message = "Character liked successfully";
			status = 201; // Created
		}

		// Fetch the updated likes count
		const updatedCharacter = await db.query.characters.findFirst({
			where: eq(characters.id, charIdInt),
			columns: {
				likes: true,
			},
		});

		return NextResponse.json(
			{
				message,
				likes: updatedCharacter?.likes ?? 0,
				isLikedByCurrentUser: !existingLike,
			},
			{ status },
		);
	} catch (error) {
		console.error(
			`API Error /api/characters/${characterId}/like (POST):`,
			error,
		);
		if (
			error.code === '23505' // Standard PostgreSQL unique violation code
		) {
			return NextResponse.json({ error: "Conflict: Action already performed." }, { status: 409 });
		}
		return NextResponse.json(
			{ error: "Internal server error toggling like status" },
			{ status: 500 },
		);
	}
}