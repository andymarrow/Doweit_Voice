// app/api/chat/[characterId]/message/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database"; // Your Drizzle DB config
import { characters, chatMessages } from "@/lib/db/schemaCharacterAI"; // Your schema imports (users implicitly joined via relations)
import { eq, asc } from "drizzle-orm"; // Import eq and asc for Drizzle
// CORRECT IMPORT: Use the package name in the path
import { GoogleGenerativeAI } from "@google/generative-ai"; // <-- Corrected path
// Import Firebase Admin SDK parts needed
import admin from "@/configs/firebaseAdmin"; // Assume this is your initialized admin instance
import { getStorage } from "firebase-admin/storage"; // Import getStorage from admin SDK

// Get API Keys from environment variables
// CORRECTED TYPO: GEMNI_API_KEY -> GEMNI_API_KEY
const geminiApiKey = process.env.GEMNI_API_KEY; // <-- Fixed typo
const vapiSecretKey = process.env.VAPI_SECRET_KEY;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID; // Ensure this is set publicly

// Initialize Gemini Client
let geminiAi;
if (geminiApiKey) {
	try {
		geminiAi = new GoogleGenerativeAI(geminiApiKey);
		console.log("Gemini AI initialized.");
	} catch (error) {
		console.error("Error initializing GoogleGenerativeAI:", error);
		geminiAi = null; // Ensure it's null if initialization fails
	}
} else {
	console.error("GEMNI_API_KEY is not set. LLM responses will fail.");
}

// Access Firebase Storage bucket from admin
// Ensure admin is initialized *before* accessing storage
let bucket;
try {
	if (admin && admin.apps && admin.apps.length) {
		// Check if admin app and apps array are available/initialized
		bucket = getStorage(admin.apps[0]).bucket(); // Get bucket from the default app
		console.log("Firebase Storage bucket accessed.");
	} else {
		console.error(
			"Firebase Admin not initialized. Audio uploads will likely fail.",
		);
	}
} catch (e) {
	console.error("Failed to get Firebase Storage bucket:", e);
}

// Vapi TTS API endpoint
// Confirm the exact path and required body/headers with Vapi docs if issues persist
const vapiTtsApiUrl = "https://api.vapi.ai/v1/audio/tts";

// Helper function to format message history for Gemini
// Assumes history is an array of { sender: 'user'|'character', text: string }
function formatHistoryForGemini(history) {
	const geminiContents = [];

	for (const msg of history) {
		if (msg.sender === "user" || msg.sender === "character") {
			// Map 'character' sender to 'model' role for Gemini
			const role = msg.sender === "user" ? "user" : "model";
			// Gemini requires roles to alternate. Ensure history from DB/frontend is correct.
			// If the last message added has the same role as the current one, Gemini API will likely error.
			// In a standard chat history from DB, this should strictly alternate user/character.
			// Add a check to warn if roles aren't alternating as expected by Gemini
			if (
				geminiContents.length > 0 &&
				geminiContents[geminiContents.length - 1].role === role
			) {
				console.warn(
					`Gemini history formatting: Found consecutive messages with the same role ('${role}'). Ensure history alternates 'user' and 'character'. History part:`,
					msg,
				);
				// Depending on how often this happens and history source, you might need to filter or adjust.
			}

			geminiContents.push({
				role: role,
				parts: [{ text: msg.text }],
			});
		} else {
			console.warn(
				`Skipping message with unknown sender type in history: ${msg.sender}`,
			);
		}
	}
	return geminiContents;
}

// POST handler (Send Message to Character)
export async function POST(req, { params }) {
	const { characterId } = params;
	// const { userId: currentUserId } = auth(); // Get current user ID from Clerk
	const { user } = await getSession(await headers());
	const currentUserId = user?.id;

	// 1. Authentication and Authorization Check
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
		const { text, history } = await req.json(); // User's message text and recent history array

		// history is expected to be an array of message objects [{ id, text, sender, timestamp }]
		if (!text || typeof text !== "string" || !Array.isArray(history)) {
			console.error(
				"Invalid payload: message text (string) or history (array) missing/invalid.",
			);
			return NextResponse.json(
				{
					error: "Message text (string) and history (array) are required",
				},
				{ status: 400 },
			);
		}
		// Optional: Validate history array elements structure

		console.log(text, history);
		// 2. Fetch Character Data (needed for LLM prompt and Voice)
		const character = await db.query.characters.findFirst({
			where: eq(characters.id, charIdInt),
			// Make sure you fetch all needed fields from DB schema: name, description, tagline, greeting, behavior, voiceProvider, voiceId, language
		});

		if (!character) {
			return NextResponse.json(
				{ error: "Character not found" },
				{ status: 404 },
			);
		}

		// Ensure character has required voice details and language
		if (!character.voiceProvider || !character.voiceId || !character.language) {
			console.error(
				`Character ${character.id} is missing voice configuration (provider: ${character.voiceProvider}, id: ${character.voiceId}, language: ${character.language}).`,
			);
			return NextResponse.json(
				{
					error: "Character voice configuration is incomplete in the database",
				},
				{ status: 500 },
			);
		}

		// 3. Construct the LLM Prompt for Gemini
		if (!geminiAi) {
			return NextResponse.json(
				{
					error: "LLM (Gemini) not initialized on server. Check GEMNI_API_KEY.",
				},
				{ status: 500 },
			);
		}

		// System instruction combining character traits
		const systemInstruction = `You are roleplaying as a character named ${character.name}. Your personality is: ${character.description}. ${character.tagline ? `Your tagline is: ${character.tagline}.` : ""} ${character.greeting ? `Use phrases similar to "${character.greeting}" when appropriate, especially at the start of interactions.` : ""} Your behavior traits include: ${character.behavior && Array.isArray(character.behavior) && character.behavior.length > 0 ? character.behavior.join(", ") : "friendly"}. Speak in the language: ${character.language}. Maintain this persona and language consistently throughout the conversation. Do not break character.
        Respond ONLY with the character's dialogue. Do not include any descriptive text like "(thinking)" or metadata like "**Response**". Keep responses concise unless asked for detail.
        If the user's message implies a need for a specific emotion (e.g., user tells a joke, expresses sadness), try to convey that emotion naturally in your response text. (Note: Exact SSML tags are not guaranteed unless specifically prompted and supported).`;

		// Format the recent history for Gemini's 'contents' array
		const geminiContents = formatHistoryForGemini(history);

		// Add the current user message to the contents. The final role must be 'user'.
		geminiContents.push({ role: "user", parts: [{ text: text }] });

		console.log("Sending prompt to Gemini. Contents:", geminiContents);
		console.log("System Instruction Length:", systemInstruction.length);

		// 4. Call the LLM API (Gemini)
		let generatedText = "";
		try {
			const model = geminiAi.getGenerativeModel({
				model: "gemini-2.5-flash",
			}); // Using the flash model ID directly

			const result = await model.generateContent({
				contents: geminiContents,
				systemInstruction: systemInstruction,
				// Add generation config if needed (e.g., temperature, maxTokens)
				// generationConfig: { temperature: 0.8, maxOutputTokens: 300 } // Adjust as needed
			});

			// Extract the text response from the result
			// Use `text()` which concatenates all text parts
			generatedText = result.response.text();

			if (!generatedText) {
				console.warn("Gemini returned an empty response.");
				// Handle empty response case
			}

			console.log("Received text response from Gemini:", generatedText);
		} catch (llmError) {
			console.error("Error calling Gemini API:", llmError);
			// Decide how to handle LLM error: return internal server error or a default message
			// Returning a default message is often better UX than a raw 500
			generatedText = "Sorry, I had trouble thinking of a response."; // Default message on LLM error
		}

		// If generatedText is still empty (e.g., default message wasn't set or LLM error was handled differently)
		if (!generatedText && generatedText !== "") {
			// Check for null, undefined, or empty string
			return NextResponse.json(
				{
					aiMessage: {
						id: `${charIdInt}-${Date.now()}_empty`, // Unique ID
						text: "I'm not sure how to respond.",
						sender: "character",
						timestamp: new Date().toISOString(),
						audioUrl: null,
					},
				},
				{ status: 200 },
			); // Still return 200 for a valid process flow, just an empty/default response
		}

		// 5. Call Vapi's Text-to-Speech (TTS) API
		let audioUrl = null;
		let audioBuffer = null; // To hold binary audio data from Vapi

		// Vapi TTS payload structure (confirm with Vapi docs if needed)
		const vapiTtsPayload = {
			text: generatedText, // Send the plain text from Gemini
			voice: {
				provider: character.voiceProvider, // e.g., "vapi", "elevenlabs"
				voiceId: character.voiceId, // e.g., "Elliot", "Hana", "21m00Tcm4TlvDq8ikWAM"
			},
			language: character.language, // Use the character's language code (e.g., "en")
			format: "mp3", // Specify audio format for Firebase compatibility
			// Optional: If Vapi TTS provider supports emotion/style directly via payload params
			// add them here based on analysis of generatedText (more complex logic needed)
		};

		console.log("Sending TTS request to Vapi:", vapiTtsPayload);

		try {
			if (!vapiSecretKey) {
				console.error("VAPI_SECRET_KEY is not set. Skipping Vapi TTS.");
				throw new Error("VAPI_SECRET_KEY missing."); // Throw to skip fetch
			}
			if (
				!character.voiceProvider ||
				!character.voiceId ||
				!character.language
			) {
				console.error("Character voice details missing from DB for TTS.");
				// Do NOT throw here, just proceed without audio
			} else {
				const ttsResponse = await fetch(vapiTtsApiUrl, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${vapiSecretKey}`,
						"Content-Type": "application/json",
						Accept: "audio/mp3", // Specify expected response type
					},
					body: JSON.stringify(vapiTtsPayload),
				});

				if (!ttsResponse.ok) {
					const errorBody = await ttsResponse.text();
					console.error(
						`Vapi TTS API Error. Status: ${ttsResponse.status}, Body: ${errorBody}`,
					);
					// Log error but proceed without audio
					audioBuffer = null; // Ensure no buffer to upload
				} else {
					console.log(
						"Received successful response from Vapi TTS. Status:",
						ttsResponse.status,
					);
					// Vapi TTS API is documented to return the audio data directly as binary
					audioBuffer = await ttsResponse.arrayBuffer(); // Get binary data as ArrayBuffer
					console.log(
						`Received audio data buffer of size ${audioBuffer?.byteLength} bytes.`,
					);

					if (!audioBuffer || audioBuffer.byteLength === 0) {
						console.warn(
							"Vapi TTS returned success but audio buffer is empty.",
						);
						audioBuffer = null;
					}
				}
			} // End check for missing voice details
		} catch (ttsFetchError) {
			console.error("Error calling Vapi TTS API:", ttsFetchError);
			audioBuffer = null; // Ensure no buffer
		}

		// 6. Upload Audio to Firebase Storage (if buffer exists)
		// This step is only needed if Vapi TTS returns binary data.
		// Requires Firebase Admin SDK.
		if (
			audioBuffer &&
			bucket &&
			firebaseProjectId &&
			currentUserId &&
			charIdInt
		) {
			// Added charIdInt check
			try {
				const timestamp = Date.now();
				// Use a consistent path structure based on user and character
				const audioFilePath = `chat-audio/${charIdInt}/${currentUserId}/${timestamp}.mp3`; // e.g., chat-audio/123/user_abc/1678888888888.mp3

				const file = bucket.file(audioFilePath);

				// Convert ArrayBuffer received from fetch to Node.js Buffer for `file.save`
				const bufferToUpload = Buffer.from(audioBuffer);

				// Upload the buffer
				await file.save(bufferToUpload, {
					metadata: {
						contentType: "audio/mp3", // Set content type
						// Optional: add custom metadata like characterId, userId
						metadata: {
							characterId: charIdInt.toString(),
							userId: currentUserId,
						},
					},
					// Make the file publicly readable directly on upload for playback
					predefinedAcl: "publicRead",
				});

				// Construct the public download URL (standard format)
				// Ensure bucket.name is correct (e.g., cinematechat-6040e.appspot.com)
				audioUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(audioFilePath)}?alt=media`;

				console.log("Audio uploaded to Firebase:", audioUrl);
			} catch (firebaseUploadError) {
				console.error(
					"Error uploading audio to Firebase Storage:",
					firebaseUploadError,
				);
				audioUrl = null; // Ensure audioUrl is null on failure
			}
		} else if (!audioBuffer) {
			console.log("No audio buffer to upload.");
		} else {
			console.warn(
				"Firebase Storage bucket or required info not available or missing IDs for upload.",
			);
			audioUrl = null;
		}

		// 7. Save Messages to Database
		// Save both user and AI messages backend-side for history accuracy.

		const now = new Date();
		// Let Drizzle generate the `id` (serial primary key)

		// Assuming your chatSessionId format is `${userId}_${characterId}`
		const chatSessionId = `${currentUserId}_${charIdInt}`;

		// Create user message object
		const userMessageToSave = {
			chatSessionId: chatSessionId,
			userId: currentUserId,
			characterId: charIdInt,
			sender: "user",
			text: text,
			timestamp: now,
			audioUrl: null,
		};

		// Create AI message object
		const aiMessageToSave = {
			chatSessionId: chatSessionId,
			userId: currentUserId,
			characterId: charIdInt,
			sender: "character",
			text: generatedText,
			timestamp: new Date(now.getTime() + 1),
			audioUrl: audioUrl,
		};

		let savedAiMessage = null; // To capture the DB-assigned ID and timestamp

		try {
			// Save user message
			await db.insert(chatMessages).values(userMessageToSave);
			console.log("User message saved to DB.");

			// Save AI message and return the inserted record
			[savedAiMessage] = await db
				.insert(chatMessages)
				.values(aiMessageToSave)
				.returning({
					id: chatMessages.id,
					timestamp: chatMessages.timestamp,
				});
			console.log("AI message saved to DB. Assigned ID:", savedAiMessage?.id);

			console.log("Messages saved to DB.");
		} catch (dbError) {
			console.error("Error saving messages to database:", dbError);
			// Log DB error. Proceed to return AI message if available, but warn.
			if (savedAiMessage) {
				console.warn(
					"Messages generated but failed to save to DB. AI message still returned to frontend.",
				);
			} else {
				console.error("Neither messages could be saved to DB.");
			}
		}

		// 8. Return Response to Frontend
		// Construct the AI message object to return
		const finalAiMessage = {
			// Use DB ID and timestamp if transaction succeeded, otherwise fallback
			id: savedAiMessage?.id?.toString() || `${charIdInt}-${Date.now()}_temp`,
			text: generatedText,
			audioUrl: audioUrl, // This will be null if TTS or upload failed
			sender: "character",
			timestamp:
				savedAiMessage?.timestamp?.toISOString() || new Date().toISOString(),
		};

		console.log("Returning AI message to frontend:", finalAiMessage);

		return NextResponse.json(
			{
				aiMessage: finalAiMessage,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error(
			"API Error /api/chat/[characterId]/message (POST) - Top Level Catch:",
			error,
		);
		// Catch any errors not handled above and return a generic 500
		return NextResponse.json(
			{ error: "Internal server error during chat message processing" },
			{ status: 500 },
		);
	}
}


//for open ai implementation though you can use the below

// app/api/chat/[characterId]/message/route.js
// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";
// import { headers } from "next/headers";
// import { db } from "@/lib/database"; // Your Drizzle DB config
// import { characters, chatMessages } from "@/lib/db/schemaCharacterAI"; // Your schema imports (users implicitly joined via relations)
// import { eq, asc } from "drizzle-orm"; // Import eq and asc for Drizzle
// // CHANGED: Import OpenAI instead of GoogleGenerativeAI
// import OpenAI from "openai";
// // Import Firebase Admin SDK parts needed
// import admin from "@/configs/firebaseAdmin"; // Assume this is your initialized admin instance
// import { getStorage } from "firebase-admin/storage"; // Import getStorage from admin SDK

// // Get API Keys from environment variables
// // CHANGED: Use OPENAI_API_KEY
// const openaiApiKey = process.env.OPENAI_API_KEY;
// const vapiSecretKey = process.env.VAPI_SECRET_KEY;
// const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID; // Ensure this is set publicly

// // CHANGED: Initialize OpenAI Client
// let openai;
// if (openaiApiKey) {
// 	try {
// 		openai = new OpenAI({ apiKey: openaiApiKey });
// 		console.log("OpenAI client initialized.");
// 	} catch (error) {
// 		console.error("Error initializing OpenAI client:", error);
// 		openai = null; // Ensure it's null if initialization fails
// 	}
// } else {
// 	console.error("OPENAI_API_KEY is not set. LLM responses will fail.");
// }

// // Access Firebase Storage bucket from admin
// // (This section is unchanged)
// let bucket;
// try {
// 	if (admin && admin.apps && admin.apps.length) {
// 		bucket = getStorage(admin.apps[0]).bucket();
// 		console.log("Firebase Storage bucket accessed.");
// 	} else {
// 		console.error(
// 			"Firebase Admin not initialized. Audio uploads will likely fail.",
// 		);
// 	}
// } catch (e) {
// 	console.error("Failed to get Firebase Storage bucket:", e);
// }

// // Vapi TTS API endpoint
// // (This section is unchanged)
// const vapiTtsApiUrl = "https://api.vapi.ai/v1/audio/tts";

// // CHANGED: Helper function to format message history for OpenAI
// // Assumes history is an array of { sender: 'user'|'character', text: string }
// function formatHistoryForOpenAI(history) {
// 	return history
// 		.filter((msg) => msg.sender === "user" || msg.sender === "character")
// 		.map((msg) => ({
// 			// Map 'character' sender to 'assistant' role for OpenAI
// 			role: msg.sender === "user" ? "user" : "assistant",
// 			content: msg.text,
// 		}));
// }

// // POST handler (Send Message to Character)
// export async function POST(req, { params }) {
// 	const { characterId } = params;
// 	const { user } = await getSession(await headers());
// 	const currentUserId = user?.id;

// 	// 1. Authentication and Authorization Check
// 	if (!currentUserId) {
// 		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 	}

// 	const charIdInt = parseInt(characterId);
// 	if (isNaN(charIdInt)) {
// 		return NextResponse.json(
// 			{ error: "Invalid Character ID" },
// 			{ status: 400 },
// 		);
// 	}

// 	try {
// 		const { text, history } = await req.json();

// 		if (!text || typeof text !== "string" || !Array.isArray(history)) {
// 			console.error(
// 				"Invalid payload: message text (string) or history (array) missing/invalid.",
// 			);
// 			return NextResponse.json(
// 				{
// 					error: "Message text (string) and history (array) are required",
// 				},
// 				{ status: 400 },
// 			);
// 		}
		
// 		console.log(text, history);
// 		// 2. Fetch Character Data
// 		const character = await db.query.characters.findFirst({
// 			where: eq(characters.id, charIdInt),
// 		});

// 		if (!character) {
// 			return NextResponse.json(
// 				{ error: "Character not found" },
// 				{ status: 404 },
// 			);
// 		}

// 		if (!character.voiceProvider || !character.voiceId || !character.language) {
// 			console.error(
// 				`Character ${character.id} is missing voice configuration (provider: ${character.voiceProvider}, id: ${character.voiceId}, language: ${character.language}).`,
// 			);
// 			return NextResponse.json(
// 				{
// 					error: "Character voice configuration is incomplete in the database",
// 				},
// 				{ status: 500 },
// 			);
// 		}

// 		// 3. Construct the LLM Prompt for OpenAI
// 		// CHANGED: Check for openai client
// 		if (!openai) {
// 			return NextResponse.json(
// 				{
// 					error: "LLM (OpenAI) not initialized on server. Check OPENAI_API_KEY.",
// 				},
// 				{ status: 500 },
// 			);
// 		}

// 		// System prompt combining character traits for OpenAI's 'system' role
// 		const systemPrompt = `You are roleplaying as a character named ${character.name}. Your personality is: ${character.description}. ${character.tagline ? `Your tagline is: ${character.tagline}.` : ""} ${character.greeting ? `Use phrases similar to "${character.greeting}" when appropriate, especially at the start of interactions.` : ""} Your behavior traits include: ${character.behavior && Array.isArray(character.behavior) && character.behavior.length > 0 ? character.behavior.join(", ") : "friendly"}. Speak in the language: ${character.language}. Maintain this persona and language consistently throughout the conversation. Do not break character.
//         Respond ONLY with the character's dialogue. Do not include any descriptive text like "(thinking)" or metadata like "**Response**". Keep responses concise unless asked for detail.
//         If the user's message implies a need for a specific emotion (e.g., user tells a joke, expresses sadness), try to convey that emotion naturally in your response text.`;
		
//         // Format the history and add the system prompt and new user message for OpenAI
// 		const messagesForApi = [
// 			{
// 				role: "system",
// 				content: systemPrompt,
// 			},
// 			...formatHistoryForOpenAI(history),
// 			{
// 				role: "user",
// 				content: text,
// 			},
// 		];

// 		console.log("Sending prompt to OpenAI. Messages:", messagesForApi);
// 		console.log("System Prompt Length:", systemPrompt.length);

// 		// 4. Call the LLM API (OpenAI)
// 		let generatedText = "";
// 		try {
//             // CHANGED: OpenAI API call
// 			const completion = await openai.chat.completions.create({
// 				model: "gpt-3.5-turbo",
// 				messages: messagesForApi,
// 				// Add generation config if needed (e.g., temperature, max_tokens)
// 				temperature: 0.8,
// 				max_tokens: 300,
// 			});

// 			// Extract the text response from the result
// 			generatedText = completion.choices[0]?.message?.content?.trim() || "";

// 			if (!generatedText) {
// 				console.warn("OpenAI returned an empty response.");
// 				// Handle empty response case
// 			}

// 			console.log("Received text response from OpenAI:", generatedText);
// 		} catch (llmError) {
// 			console.error("Error calling OpenAI API:", llmError);
// 			// Returning a default message is often better UX than a raw 500
// 			generatedText = "Sorry, I had trouble thinking of a response."; // Default message on LLM error
// 		}

// 		// (The rest of the file is unchanged, as requested)

// 		// If generatedText is still empty
// 		if (!generatedText && generatedText !== "") {
// 			return NextResponse.json(
// 				{
// 					aiMessage: {
// 						id: `${charIdInt}-${Date.now()}_empty`,
// 						text: "I'm not sure how to respond.",
// 						sender: "character",
// 						timestamp: new Date().toISOString(),
// 						audioUrl: null,
// 					},
// 				},
// 				{ status: 200 },
// 			);
// 		}

// 		// 5. Call Vapi's Text-to-Speech (TTS) API
// 		let audioUrl = null;
// 		let audioBuffer = null;

// 		const vapiTtsPayload = {
// 			text: generatedText,
// 			voice: {
// 				provider: character.voiceProvider,
// 				voiceId: character.voiceId,
// 			},
// 			language: character.language,
// 			format: "mp3",
// 		};

// 		console.log("Sending TTS request to Vapi:", vapiTtsPayload);

// 		try {
// 			if (!vapiSecretKey) {
// 				console.error("VAPI_SECRET_KEY is not set. Skipping Vapi TTS.");
// 				throw new Error("VAPI_SECRET_KEY missing.");
// 			}
// 			if (
// 				!character.voiceProvider ||
// 				!character.voiceId ||
// 				!character.language
// 			) {
// 				console.error("Character voice details missing from DB for TTS.");
// 			} else {
// 				const ttsResponse = await fetch(vapiTtsApiUrl, {
// 					method: "POST",
// 					headers: {
// 						Authorization: `Bearer ${vapiSecretKey}`,
// 						"Content-Type": "application/json",
// 						Accept: "audio/mp3",
// 					},
// 					body: JSON.stringify(vapiTtsPayload),
// 				});

// 				if (!ttsResponse.ok) {
// 					const errorBody = await ttsResponse.text();
// 					console.error(
// 						`Vapi TTS API Error. Status: ${ttsResponse.status}, Body: ${errorBody}`,
// 					);
// 					audioBuffer = null;
// 				} else {
// 					console.log(
// 						"Received successful response from Vapi TTS. Status:",
// 						ttsResponse.status,
// 					);
// 					audioBuffer = await ttsResponse.arrayBuffer();
// 					console.log(
// 						`Received audio data buffer of size ${audioBuffer?.byteLength} bytes.`,
// 					);

// 					if (!audioBuffer || audioBuffer.byteLength === 0) {
// 						console.warn(
// 							"Vapi TTS returned success but audio buffer is empty.",
// 						);
// 						audioBuffer = null;
// 					}
// 				}
// 			}
// 		} catch (ttsFetchError) {
// 			console.error("Error calling Vapi TTS API:", ttsFetchError);
// 			audioBuffer = null;
// 		}

// 		// 6. Upload Audio to Firebase Storage
// 		if (
// 			audioBuffer &&
// 			bucket &&
// 			firebaseProjectId &&
// 			currentUserId &&
// 			charIdInt
// 		) {
// 			try {
// 				const timestamp = Date.now();
// 				const audioFilePath = `chat-audio/${charIdInt}/${currentUserId}/${timestamp}.mp3`;
// 				const file = bucket.file(audioFilePath);
// 				const bufferToUpload = Buffer.from(audioBuffer);

// 				await file.save(bufferToUpload, {
// 					metadata: {
// 						contentType: "audio/mp3",
// 						metadata: {
// 							characterId: charIdInt.toString(),
// 							userId: currentUserId,
// 						},
// 					},
// 					predefinedAcl: "publicRead",
// 				});

// 				audioUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(audioFilePath)}?alt=media`;
// 				console.log("Audio uploaded to Firebase:", audioUrl);
// 			} catch (firebaseUploadError) {
// 				console.error(
// 					"Error uploading audio to Firebase Storage:",
// 					firebaseUploadError,
// 				);
// 				audioUrl = null;
// 			}
// 		} else if (!audioBuffer) {
// 			console.log("No audio buffer to upload.");
// 		} else {
// 			console.warn(
// 				"Firebase Storage bucket or required info not available or missing IDs for upload.",
// 			);
// 			audioUrl = null;
// 		}

// 		// 7. Save Messages to Database
// 		const now = new Date();
// 		const chatSessionId = `${currentUserId}_${charIdInt}`;

// 		const userMessageToSave = {
// 			chatSessionId: chatSessionId,
// 			userId: currentUserId,
// 			characterId: charIdInt,
// 			sender: "user",
// 			text: text,
// 			timestamp: now,
// 			audioUrl: null,
// 		};

// 		const aiMessageToSave = {
// 			chatSessionId: chatSessionId,
// 			userId: currentUserId,
// 			characterId: charIdInt,
// 			sender: "character",
// 			text: generatedText,
// 			timestamp: new Date(now.getTime() + 1),
// 			audioUrl: audioUrl,
// 		};

// 		let savedAiMessage = null;

// 		try {
// 			await db.insert(chatMessages).values(userMessageToSave);
// 			console.log("User message saved to DB.");

// 			[savedAiMessage] = await db
// 				.insert(chatMessages)
// 				.values(aiMessageToSave)
// 				.returning({
// 					id: chatMessages.id,
// 					timestamp: chatMessages.timestamp,
// 				});
// 			console.log("AI message saved to DB. Assigned ID:", savedAiMessage?.id);

// 			console.log("Messages saved to DB.");
// 		} catch (dbError) {
// 			console.error("Error saving messages to database:", dbError);
// 			if (savedAiMessage) {
// 				console.warn(
// 					"Messages generated but failed to save to DB. AI message still returned to frontend.",
// 				);
// 			} else {
// 				console.error("Neither messages could be saved to DB.");
// 			}
// 		}

// 		// 8. Return Response to Frontend
// 		const finalAiMessage = {
// 			id: savedAiMessage?.id?.toString() || `${charIdInt}-${Date.now()}_temp`,
// 			text: generatedText,
// 			audioUrl: audioUrl,
// 			sender: "character",
// 			timestamp:
// 				savedAiMessage?.timestamp?.toISOString() || new Date().toISOString(),
// 		};

// 		console.log("Returning AI message to frontend:", finalAiMessage);

// 		return NextResponse.json(
// 			{
// 				aiMessage: finalAiMessage,
// 			},
// 			{ status: 200 },
// 		);
// 	} catch (error) {
// 		console.error(
// 			"API Error /api/chat/[characterId]/message (POST) - Top Level Catch:",
// 			error,
// 		);
// 		return NextResponse.json(
// 			{ error: "Internal server error during chat message processing" },
// 			{ status: 500 },
// 		);
// 	}
// }