// app/api/characters/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { characters, users, characterLikes } from "@/lib/db/schemaCharacterAI";
import { eq, and, or, like, desc, sql, exists } from "drizzle-orm";

// POST handler (No changes)
export async function POST(req) {
	const { user } = await getSession(await headers());
	const userId = user?.id;

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const characterData = await req.json();
		console.log("Received character data for creation:", characterData);

		const {
			name,
			tagline,
			description,
			greeting,
			avatarUrl,
			voiceId,
			voiceName,
			voiceProvider,
			language,
			behavior,
			isPublic,
		} = characterData;

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

		const [newCharacter] = await db
			.insert(characters)
			.values({
				creatorId: userId,
				name: name.trim(),
				tagline: tagline?.trim() || null,
				description: description.trim(),
				greeting: greeting.trim(),
				avatarUrl: avatarUrl || null,
				voiceId: voiceId,
				voiceName: voiceName || null,
				voiceProvider: voiceProvider,
				language: language,
				behavior: behavior,
				isPublic: isPublic,
				likes: 0,
				chats: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		console.log("Character created in DB successfully:", newCharacter);

		return NextResponse.json(
			{
				message: "Character created successfully",
				characterId: newCharacter.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("API Error /api/characters (POST - Character Creation):", error);
		console.error("Full POST error object:", error);
		return NextResponse.json(
			{ error: "Internal server error during character creation" },
			{ status: 500 },
		);
	}
}

// GET handler (List Characters) - FINAL CORRECTED VERSION
export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const searchTerm = searchParams.get("search");
		const category = searchParams.get("category");

		const whereConditions = [eq(characters.isPublic, true)];

		if (searchTerm) {
			whereConditions.push(
				or(
					like(characters.name, `%${searchTerm}%`),
					like(characters.description, `%${searchTerm}%`),
					like(characters.tagline, `%${searchTerm}%`),
					sql`${characters.behavior} @> ${sql.raw(`'${JSON.stringify([searchTerm])}'::jsonb`)}`,
				),
			);
		}

		if (category) {
			whereConditions.push(
				sql`${characters.behavior} @> ${sql.raw(`'${JSON.stringify([category])}'::jsonb`)}`,
			);
		}

		let currentUserId = null;
		try {
			const { user } = await getSession(await headers());
			currentUserId = user?.id;
			console.log("Better-Auth user fetched:", user);
			console.log("Current User ID from Better-Auth:", currentUserId);
		} catch (authError) {
			console.warn("Failed to get session from Better-Auth (user might not be logged in or session is invalid):", authError);
		}

		const result = await db
			.select({
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
				// *** THE FIX IS HERE ***
				// Select 'users.name' instead of 'users.username'
				creatorName: users.name,
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
			.leftJoin(users, eq(characters.creatorId, users.id))
			.where(and(...whereConditions))
			.orderBy(desc(characters.createdAt));

		// The mapping now correctly uses the 'creatorName' alias from the query
		const formattedCharacters = result.map((row) => ({
			id: row.id,
			name: row.name,
			tagline: row.tagline,
			description: row.description,
			greeting: row.greeting,
			avatarUrl: row.avatarUrl,
			voiceId: row.voiceId,
			voiceName: row.voiceName,
			voiceProvider: row.voiceProvider,
			language: row.language,
			behavior: row.behavior,
			isPublic: row.isPublic,
			likes: row.likes || 0,
			chats: row.chats || 0,
			shares: 0,
			creatorId: row.creatorId,
			creatorName: row.creatorName || "Unknown Creator", // Use the alias directly
			isLikedByCurrentUser: row.isLikedByCurrentUser,
		}));

		return NextResponse.json(
			{ characters: formattedCharacters },
			{ status: 200 },
		);
	} catch (error) {
		console.error("API Error /api/characters (GET - Fetching Characters):", error);
		console.error("Full GET error object:", error);
		return NextResponse.json(
			{ error: "Internal server error fetching characters" },
			{ status: 500 },
		);
	}
}