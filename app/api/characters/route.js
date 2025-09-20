// app/api/characters/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { characters, users, characterLikes } from "@/lib/db/schemaCharacterAI";
import { eq, and, or, like, desc, sql, inArray } from "drizzle-orm";

// POST handler (Create Character)
export async function POST(req) {
	// const { userId } = auth();
	const { user } = await getSession(await headers());
	const userId = user?.id;

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const characterData = await req.json();
		console.log("Received character data:", characterData);

		// --- Validate incoming data ---
		const {
			name,
			tagline,
			description,
			greeting,
			avatarUrl,
			voiceId,
			voiceName,
			voiceProvider, // <-- Already here, good
			language,
			behavior,
			isPublic,
		} = characterData;

		// Update validation to include voiceProvider - Already correct
		if (
			!name ||
			!description ||
			!greeting ||
			!voiceId ||
			!voiceProvider ||
			!language ||
			!Array.isArray(behavior)
		) {
			console.error("Missing required fields in payload:", {
				name: !!name,
				description: !!description,
				greeting: !!greeting,
				voiceId: !!voiceId,
				voiceProvider: !!voiceProvider,
				language: !!language,
				behavior: Array.isArray(behavior),
			});
			return NextResponse.json(
				{ error: "Missing required character fields" },
				{ status: 400 },
			);
		}
		// Optional: More specific validation (string lengths, valid language code etc.)

		// --- Ensure user exists in our DB (or create if first time) ---
		let userRecord = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!userRecord) {
			const clerkUser = await clerkClient.users.getUser(userId);
			if (!clerkUser) {
				console.error("Clerk user not found for ID:", userId);
				return NextResponse.json(
					{ error: "Clerk user not found" },
					{ status: 400 },
				);
			}
			[userRecord] = await db
				.insert(users)
				.values({
					id: userId,
					username:
						clerkUser.username ||
						`${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
						"New User",
					email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
					profileImageUrl: clerkUser.imageUrl || null,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			console.log("Created new user record in DB:", userRecord);
		}

		// --- Insert new character into the database ---
		const [newCharacter] = await db
			.insert(characters)
			.values({
				creatorId: userRecord.id,
				name: name.trim(),
				tagline: tagline?.trim() || null,
				description: description.trim(),
				greeting: greeting.trim(),
				avatarUrl: avatarUrl || null,
				voiceId: voiceId,
				voiceName: voiceName || null,
				voiceProvider: voiceProvider, // <-- Already correct
				language: language,
				behavior: behavior,
				isPublic: isPublic,
				likes: 0,
				chats: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		console.log("Character created in DB:", newCharacter);

		// Return the newly created character's ID
		return NextResponse.json(
			{
				message: "Character created successfully",
				characterId: newCharacter.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("API Error /api/characters (POST):", error);
		// Return a generic 500 or the specific error message if safe
		// It's often better not to expose internal error messages directly to the frontend in production
		// but for development, logging error.message can be helpful server-side.
		return NextResponse.json(
			{ error: "Internal server error during character creation" },
			{ status: 500 },
		);
	}
}

// GET handler (List Characters)
export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const searchTerm = searchParams.get("search");
		const category = searchParams.get("category");

		// Build dynamic WHERE clause
		const whereClause = and(
			eq(characters.isPublic, true),
			// Add search term filter
			searchTerm
				? or(
						like(characters.name, `%${searchTerm}%`),
						like(characters.description, `%${searchTerm}%`),
						like(characters.tagline, `%${searchTerm}%`),
						// Searching JSON array example (requires Drizzle `sql`)
						// Note: This uses raw SQL template literal, adjust syntax if needed for your DB/Drizzle version
						sql`${characters.behavior} @> ${JSON.stringify([searchTerm])}::jsonb`, // Example: checks if array contains search term
					)
				: undefined,
			// Add category filter (using the same JSONB check)
			// SYNTAX FIX HERE: Added closing curly brace '}'
			category
				? sql`${characters.behavior} @> ${JSON.stringify([category])}::jsonb`
				: undefined, // <-- FIX APPLIED
		);

		// Get current user ID from Clerk (can be null if not logged in)
		// const { userId: currentUserId } = auth();
		const { user } = await getSession(await headers());
		const currentUserId = user?.id;

		// Build the Drizzle query with joins
		const result = await db
			.select({
				character: characters,
				creatorUsername: users.username, // Select creator's username from joined users table
				// Check if the current user liked this character via a left join
				liked: characterLikes.userId, // Will be null if not liked by user
			})
			.from(characters)
			// Join to get creator info
			.leftJoin(users, eq(characters.creatorId, users.id))
			// Left join with characterLikes table for the current user (only if user is logged in)
			.leftJoin(
				characterLikes,
				and(
					eq(characters.id, characterLikes.characterId),
					currentUserId ? eq(characterLikes.userId, currentUserId) : undefined, // Condition only if userId exists
				),
			)
			.where(whereClause) // Apply public/search/category filters
			.orderBy(desc(characters.createdAt)); // Order results

		// Format the result to match the frontend CharacterCard props
		const formattedCharacters = result.map((row) => ({
			id: row.character.id,
			name: row.character.name,
			tagline: row.character.tagline,
			description: row.character.description,
			greeting: row.character.greeting,
			avatarUrl: row.character.avatarUrl,
			voiceId: row.character.voiceId,
			voiceName: row.character.voiceName,
			voiceProvider: row.character.voiceProvider, // <-- Ensure this is included when fetching
			language: row.character.language,
			behavior: row.character.behavior,
			isPublic: row.character.isPublic,
			likes: row.character.likes || 0, // Ensure number
			chats: row.character.chats || 0, // Ensure number
			shares: 0, // Placeholder
			creatorId: row.character.creatorId,
			creatorName: row.creatorUsername || "Unknown Creator", // Use fetched creator username
			isLikedByCurrentUser: !!row.liked, // True if liked.userId is not null
		}));

		return NextResponse.json(
			{ characters: formattedCharacters },
			{ status: 200 },
		);
	} catch (error) {
		console.error("API Error /api/characters (GET):", error);
		return NextResponse.json(
			{ error: "Internal server error fetching characters" },
			{ status: 500 },
		);
	}
}
