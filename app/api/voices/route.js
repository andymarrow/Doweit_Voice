// app/api/voices/route.js

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { voices } from "@/lib/db/schemaCharacterAI";
import { eq } from "drizzle-orm";

const vapiSecretKey = process.env.VAPI_SECRET_KEY;
const vapiAssistantsApiUrl = "https://api.vapi.ai/assistant";

export const dynamic = 'force-dynamic';

// --- Hardcoded Gemini Voices ---
const GEMINI_VOICES = [
    'Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Leda', 'Orus',
    'Aoede', 'Callirrhoe', 'Autonoe', 'Enceladus', 'Lapetus', 'Umbriel',
    'Algieba', 'Despina', 'Erinome', 'Algenib', 'Rasalgethi', 'Laemedeia',
    'Achernar', 'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima', 'Achird',
    'Zubenelgenubi', 'Vindemiatrix', 'Sadchibia', 'Sadaltager', 'Sulafat'
];

// Fetch voices by reading the voice config from user-created Vapi assistants.
// Each assistant represents a voice persona — the assistant name is the voice
// name and assistant.voice contains the provider + voiceId to use.
async function fetchVapiVoices() {
	if (!vapiSecretKey) {
		console.error("VAPI_SECRET_KEY is not set. Cannot fetch Vapi voices.");
		return [];
	}
	try {
		const response = await fetch(vapiAssistantsApiUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${vapiSecretKey}`, "Content-Type": "application/json" },
        });

		if (!response.ok) {
			const errorBody = await response.text();
			console.error(
				`Failed to fetch assistants from Vapi API. Status: ${response.status}, Body: ${errorBody}`,
			);
			return [];
		}

		const assistants = await response.json();
		const vapiVoices = {};

		assistants.forEach((assistant) => {
            if (assistant.voice?.provider && assistant.voice?.voiceId) {
                const voiceKey = `${assistant.voice.provider}-${assistant.voice.voiceId}`;
                if (!vapiVoices[voiceKey]) {
                    vapiVoices[voiceKey] = {
                        id: voiceKey,
                        voiceId: assistant.voice.voiceId,
                        name: assistant.name || assistant.voice.voiceId,
                        description: `Vapi (${assistant.voice.provider})`,
                        sampleAudioUrl: null,
                        platform: "vapi",
                        provider: assistant.voice.provider,
                    };
                }
            }
        });
		return Object.values(vapiVoices);
	} catch (error) {
		console.error("Error fetching Vapi voices:", error);
		return [];
	}
}

// --- Function to fetch user's custom voices from our DB ---
async function fetchUserCustomVoices(userId) {
	if (!userId) return [];
	try {
		const customVoices = await db.query.voices.findMany({
			where: eq(voices.creatorId, userId),
		});
		return customVoices.map((v) => ({
			id: `${v.provider}-${v.providerVoiceId}`,
			voiceId: v.providerVoiceId,
			name: v.name,
			description: v.description || `Custom (${v.provider})`,
			sampleAudioUrl: v.sampleAudioUrl,
			platform: v.provider,
            provider: v.provider,
		}));
	} catch (error) {
		console.error(`Error fetching custom voices for user ${userId}:`, error);
		return [];
	}
}

// --- Helper to format Gemini Voices ---
function getGeminiVoices() {
    return GEMINI_VOICES.map(voiceName => ({
        id: `google-${voiceName}`,
        voiceId: voiceName,
        name: voiceName,
        description: "Google Gemini voice",
        sampleAudioUrl: null,
        platform: "google",
        provider: "google",
    }));
}


// --- MAIN GET HANDLER ---
export async function GET(request) {
	try {
		const { user } = await getSession(await headers());
		const userId = user?.id;

		// Fetch from all sources in parallel
		const [vapiVoices, customVoices] = await Promise.all([
			fetchVapiVoices(),
			fetchUserCustomVoices(userId),
		]);

		const geminiVoices = getGeminiVoices();

		// Merge — custom voices overwrite duplicates
		const combinedVoicesMap = new Map();
		geminiVoices.forEach((voice) => combinedVoicesMap.set(voice.id, voice));
		vapiVoices.forEach((voice) => combinedVoicesMap.set(voice.id, voice));
		customVoices.forEach((voice) => combinedVoicesMap.set(voice.id, voice));

		const finalVoiceList = Array.from(combinedVoicesMap.values());
		finalVoiceList.sort((a, b) => a.name.localeCompare(b.name));

		console.log(`Returning a combined list of ${finalVoiceList.length} voices.`);

		return NextResponse.json(finalVoiceList, { status: 200 });
	} catch (error) {
		console.error("Error in combined /api/voices route:", error);
		return NextResponse.json(
			{ message: "Failed to fetch voices", error: error.message },
			{ status: 500 },
		);
	}
}
