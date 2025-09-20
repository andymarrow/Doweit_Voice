// app/api/chat/[characterId]/route.js - Handles fetching chat history
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database"; // Your Drizzle DB config
import { chatMessages } from "@/lib/db/schemaCharacterAI"; // Your schema imports
import { eq, asc } from "drizzle-orm";

// GET handler for fetching initial chat history
// This is called by your frontend useEffect fetch('/api/chat/${characterId}?userId=...')
export async function GET(req, { params }) {
	const { characterId } = params;
	// const { userId: currentUserId } = auth(); // Get current user ID from Clerk
	const { user } = await getSession(await headers());
	const currentUserId = user?.id;

	if (!currentUserId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const charIdInt = parseInt(characterId);
	if (isNaN(charIdInt)) {
		return NextResponse.json(
			{ error: "Invalid Character ID" },
			{ status: 400 },
		);
	}

	try {
		// Assuming chatSessionId is stored as `${userId}_${characterId}`
		const chatSessionId = `${currentUserId}_${charIdInt}`;

		// Fetch messages for this user and character, ordered by timestamp
		const messages = await db.query.chatMessages.findMany({
			where: eq(chatMessages.chatSessionId, chatSessionId),
			orderBy: [asc(chatMessages.timestamp)], // Order by timestamp ascending
			limit: 50, // Limit number of messages to fetch for history (adjust as needed)
		});

		console.log(
			`Fetched ${messages.length} messages for session ${chatSessionId}`,
		);

		// Format messages to match frontend Message component props exactly
		const formattedMessages = messages.map((msg) => ({
			id: msg.id.toString(), // Ensure ID is a string for React keys
			text: msg.text,
			sender: msg.sender, // 'user' or 'character'
			audioUrl: msg.audioUrl, // Can be null
			timestamp: msg.timestamp.toISOString(), // Ensure ISO string format for consistency
			// Add other fields if necessary from chatMessages schema
		}));

		return NextResponse.json({ messages: formattedMessages }, { status: 200 });
	} catch (error) {
		console.error(`API Error /api/chat/${characterId} (GET History):`, error);
		return NextResponse.json(
			{ error: "Internal server error fetching chat history" },
			{ status: 500 },
		);
	}
}
