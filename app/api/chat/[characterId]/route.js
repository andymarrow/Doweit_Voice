export const dynamic = "force-dynamic";
// app/api/chat/[characterId]/route.js - Handles fetching chat history
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { chatMessages } from "@/lib/db/schemaCharacterAI";
import { eq, asc } from "drizzle-orm";
import { resolveCharacterId } from "@/lib/utils/publicId";

// GET handler for fetching initial chat history
export async function GET(req, { params }) {
	const { characterId } = params;
	const { user } = await getSession(await headers());
	const currentUserId = user?.id;

	if (!currentUserId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const charIdInt = await resolveCharacterId(characterId);
	if (!charIdInt) {
		return NextResponse.json(
			{ error: "Character not found" },
			{ status: 404 },
		);
	}

	try {
		const chatSessionId = `${currentUserId}_${charIdInt}`;

		const messages = await db.query.chatMessages.findMany({
			where: eq(chatMessages.chatSessionId, chatSessionId),
			orderBy: [asc(chatMessages.timestamp)],
			limit: 50,
		});

		console.log(
			`Fetched ${messages.length} messages for session ${chatSessionId}`,
		);

		const formattedMessages = messages.map((msg) => ({
			id: msg.id.toString(),
			text: msg.text,
			sender: msg.sender,
			audioUrl: msg.audioUrl,
			timestamp: msg.timestamp.toISOString(),
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
