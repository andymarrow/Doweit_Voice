// app/api/voices/route.js

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/configs/db';
import { voices } from '@/lib/db/schemaCharacterAI'; 
import { eq,or, isNull } from 'drizzle-orm';

const vapiSecretKey = process.env.VAPI_SECRET_KEY;
const vapiAssistantsApiUrl = 'https://api.vapi.ai/assistant';

// --- Function to fetch default voices from VAPI ---
async function fetchVapiVoices() {
    if (!vapiSecretKey) {
        console.error("VAPI_SECRET_KEY is not set. Cannot fetch default VAPI voices.");
        return []; // Return empty array if not configured
    }
    try {
        const response = await fetch(vapiAssistantsApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${vapiSecretKey}`,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Failed to fetch assistants from Vapi API. Status: ${response.status}, Body: ${errorBody}`);
            return []; // Return empty on error
        }

        const assistants = await response.json();
        const vapiVoices = {}; // Use a map to handle duplicates from VAPI

        assistants.forEach(assistant => {
            if (assistant.voice?.provider && assistant.voice?.voiceId) {
                const voiceKey = `${assistant.voice.provider}-${assistant.voice.voiceId}`;
                if (!vapiVoices[voiceKey]) {
                    vapiVoices[voiceKey] = {
                        id: voiceKey,
                        voiceId: assistant.voice.voiceId,
                        name: assistant.name || assistant.voice.voiceId, // Prefer assistant name
                        description: `VAPI Default (${assistant.voice.provider})`,
                        sampleAudioUrl: null, // VAPI assistant endpoint does not provide this
                        platform: 'vapi', // Standardize the platform key
                    };
                }
            }
        });
        return Object.values(vapiVoices);

    } catch (error) {
        console.error("Error fetching Vapi voices:", error);
        return []; // Return empty on error
    }
}

// --- Function to fetch user's custom voices from our DB ---
async function fetchUserCustomVoices(userId) {
    if (!userId) {
        return [];
    }
    try {
        const customVoices = await db.query.voices.findMany({
            where: eq(voices.creatorId, userId),
        });

        // Map to the same format as VAPI voices for consistency
        return customVoices.map(v => ({
            id: `${v.provider}-${v.providerVoiceId}`,
            voiceId: v.providerVoiceId,
            name: v.name,
            description: v.description || `Custom (${v.provider})`,
            sampleAudioUrl: v.sampleAudioUrl,
            platform: v.provider,
        }));

    } catch (error) {
        console.error(`Error fetching custom voices for user ${userId}:`, error);
        return [];
    }
}


// --- MAIN GET HANDLER ---
export async function GET(request) {
    try {
        const { userId } = auth(); // Get the current user

        // --- 1. Fetch voices from all sources in parallel ---
        const [vapiVoices, customVoices] = await Promise.all([
            fetchVapiVoices(),
            fetchUserCustomVoices(userId) // Pass the userId to get their specific voices
        ]);
        
        // --- 2. Merge the lists ---
        // We can use a Map to ensure that if a user's custom voice happens
        // to have the same ID as a VAPI default, the custom one takes precedence.
        const combinedVoicesMap = new Map();

        // Add VAPI defaults first
        vapiVoices.forEach(voice => combinedVoicesMap.set(voice.id, voice));
        
        // Add/overwrite with user's custom voices
        customVoices.forEach(voice => combinedVoicesMap.set(voice.id, voice));

        const finalVoiceList = Array.from(combinedVoicesMap.values());
        
        // Sort the final list alphabetically by name
        finalVoiceList.sort((a, b) => a.name.localeCompare(b.name));

        console.log(`Returning a combined list of ${finalVoiceList.length} voices.`);

        return NextResponse.json(finalVoiceList, { status: 200 });

    } catch (error) {
        console.error("Error in combined /api/voices route:", error);
        return NextResponse.json({ message: "Failed to fetch voices", error: error.message }, { status: 500 });
    }
}