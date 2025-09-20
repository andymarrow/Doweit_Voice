// app/api/integrations/connect/elevenlabs/route.js

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { ElevenLabsClient } from "elevenlabs";
import { db } from "@/lib/database";
import { userConnections, voices } from "@/lib/db/schemaCharacterAI";
import { encrypt } from "@/lib/utils/crypto";
import { eq, and } from "drizzle-orm";

// This is the main function for the POST request.
export async function POST(req) {
	try {
		// const { userId } = auth();
		const { user } = await getSession(await headers());
		const userId = user?.id;
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { apiKey } = await req.json();
		if (!apiKey) {
			return NextResponse.json(
				{ error: "API Key is required" },
				{ status: 400 },
			);
		}

		// --- 1. Verify the API Key with ElevenLabs ---
		const elevenlabs = new ElevenLabsClient({ apiKey });
		try {
			// A simple call to check if the key is valid.
			await elevenlabs.user.get();
		} catch (error) {
			console.error("ElevenLabs API key validation failed:", error);
			return NextResponse.json(
				{ error: "Invalid ElevenLabs API Key" },
				{ status: 401 },
			);
		}

		// --- 2. Encrypt and Save the Key to the Database ---
		const encryptedKey = encrypt(apiKey);

		// Use upsert logic: update if exists, insert if not.
		await db
			.insert(userConnections)
			.values({
				userId,
				provider: "elevenlabs",
				encryptedAccessToken: encryptedKey,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: [userConnections.userId, userConnections.provider],
				set: {
					encryptedAccessToken: encryptedKey,
					updatedAt: new Date(),
				},
			});

		console.log(`Successfully saved connection for user ${userId}`);

		// --- 3. Trigger Voice Synchronization ---
		await syncElevenLabsVoices(userId, elevenlabs);

		return NextResponse.json(
			{ success: true, message: "ElevenLabs connected and voices synced." },
			{ status: 200 },
		);
	} catch (error) {
		console.error("[API CONNECT ELEVENLABS]", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

// Helper function to fetch voices from ElevenLabs and save them to our DB.
async function syncElevenLabsVoices(userId, elevenlabsClient) {
	console.log(`Starting voice sync for user ${userId}...`);

	// Fetch the full response object from the user's ElevenLabs account.
	const elevenLabsResponse = await elevenlabsClient.voices.getAll();

	// --- FIX APPLIED HERE ---
	// The actual list of voices is inside the .voices property of the response object.
	const elevenLabsVoicesArray = elevenLabsResponse.voices;

	// Now, we check if the array exists and is not empty.
	if (!elevenLabsVoicesArray || elevenLabsVoicesArray.length === 0) {
		console.log(`No voices found for user ${userId} on ElevenLabs.`);
		return;
	}

	// Map the ElevenLabs voice structure from the array to our database schema.
	const voicesToInsert = elevenLabsVoicesArray.map((voice) => ({
		creatorId: userId,
		provider: "elevenlabs",
		providerVoiceId: voice.voice_id,
		name: voice.name,
		sampleAudioUrl: voice.preview_url,
		category: voice.category,
		isPublic: false,
	}));

	// Database strategy: Delete and Re-insert. This part is correct.
	await db
		.delete(voices)
		.where(
			and(eq(voices.creatorId, userId), eq(voices.provider, "elevenlabs")),
		);

	await db.insert(voices).values(voicesToInsert);

	console.log(
		`Successfully synced ${voicesToInsert.length} voices for user ${userId}.`,
	);
}
