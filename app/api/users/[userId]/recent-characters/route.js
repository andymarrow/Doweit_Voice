// app/api/users/[userId]/recent-characters/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { chatMessages, characters } from "@/lib/db/schemaCharacterAI";
import { eq, desc, sql } from "drizzle-orm"; // Import necessary helpers

// Define how many recent characters to show
const RECENT_CHARACTER_LIMIT = 5; // Or another suitable number

export async function GET(req, { params }) {
	const { userId: paramUserId } = params; // Get user ID from URL parameters
	// const { userId: currentUserId } = auth(); // Get logged-in user ID from Clerk
	const { user } = await getSession(await headers());
	const currentUserId = user?.id;

	// Ensure the user requesting the data is the same as the user in the URL, or is authenticated
	// You might enforce that a user can only view their own recent chats.
	if (!currentUserId || currentUserId !== paramUserId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!paramUserId) {
		return NextResponse.json(
			{ error: "User ID is required in path" },
			{ status: 400 },
		);
	}

	try {
		// --- Strategy: Find recent chat messages, get their character IDs, then fetch unique characters ---

		// 1. Find recent chat messages for this user, ordered by timestamp descending
		// Select only the characterId to avoid fetching large message text/audio
		const recentMessageCharacterIds = await db
			.select({
				characterId: chatMessages.characterId,
			})
			.from(chatMessages)
			.where(eq(chatMessages.userId, currentUserId)) // Filter by the logged-in user
			.orderBy(desc(chatMessages.timestamp)) // Order by recent messages
			.limit(50); // Fetch enough recent messages to find a few unique characters

		// 2. Extract unique character IDs from the recent messages
		const uniqueCharacterIds = [
			...new Set(recentMessageCharacterIds.map((msg) => msg.characterId)),
		].slice(0, RECENT_CHARACTER_LIMIT);

		// If no recent chat activity, return empty array
		if (uniqueCharacterIds.length === 0) {
			console.log(`No recent characters found for user ${currentUserId}`);
			return NextResponse.json({ recentCharacters: [] }, { status: 200 });
		}

		// 3. Fetch the details for these unique characters
		const recentCharacters = await db.query.characters.findMany({
			where: sql`${characters.id} IN (${uniqueCharacterIds.join(",")})`, // Use SQL IN clause with the list of IDs
			// Or, simpler Drizzle eq with `inArray`:
			// where: inArray(characters.id, uniqueCharacterIds), // Need to import inArray
			columns: {
				// Select only the fields needed by the sidebar component
				id: true,
				name: true,
				avatarUrl: true,
				// Include other fields if the sidebar needs them (e.g., short description)
				// description: true,
			},
			// Order the final characters. Ordering by the most recent *message* time
			// is complex in a single query. We can order by character creation date
			// or just return them in the order found, or add a `lastActive` field
			// to the characters table updated on each message.
			// For simplicity now, let's order by the *order they appeared in uniqueCharacterIds*
			// which roughly corresponds to recency based on step 1. This requires sorting in JS.
		});

		// Optional: Sort recentCharacters by the order in uniqueCharacterIds
		// This ensures the most recently chatted character appears first in the list
		const sortedRecentCharacters = uniqueCharacterIds
			.map((id) => recentCharacters.find((char) => char.id === id))
			.filter(Boolean); // Remove any characters not found (shouldn't happen if IDs are valid)

		console.log(
			`Returning ${sortedRecentCharacters.length} recent characters for user ${currentUserId}`,
		);

		// Return the list of recent characters
		return NextResponse.json(
			{ recentCharacters: sortedRecentCharacters },
			{ status: 200 },
		);
	} catch (error) {
		console.error(
			`API Error /api/users/${paramUserId}/recent-characters (GET):`,
			error,
		);
		return NextResponse.json(
			{ error: "Internal server error fetching recent characters" },
			{ status: 500 },
		);
	}
}

// You'll need to add `inArray` to your drizzle import if you use that syntax:
// import { eq, desc, sql, distinct, inArray } from 'drizzle-orm';
