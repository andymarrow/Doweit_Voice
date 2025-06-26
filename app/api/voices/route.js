// characterai/api/voices/routes.js - Fetching voices by listing assistants
import { NextResponse } from 'next/server';

const vapiSecretKey = process.env.VAPI_SECRET_KEY;
// Use the confirmed working endpoint for listing assistants
const vapiAssistantsApiUrl = 'https://api.vapi.ai/assistant'; // <-- Use the /assistant endpoint

// Optional: Basic check on startup
if (!vapiSecretKey) {
    console.error("VAPI_SECRET_KEY is not set in environment variables at startup. Voice fetching will fail.");
}

export async function GET(request) {
    // Check for the secret key at the start of the handler
    if (!vapiSecretKey) {
         console.error("VAPI_SECRET_KEY is not set when /api/voices was called.");
         return NextResponse.json(
             { message: "Server configuration error: VAPI_SECRET_KEY is not set." },
             { status: 500 }
         );
    }

    try {
        console.log(`Attempting to fetch assistants from Vapi API: ${vapiAssistantsApiUrl}`); // Log the target URL
        // Make a direct HTTP GET request to the Vapi Assistant List API endpoint
        const response = await fetch(vapiAssistantsApiUrl, { // Use the /assistant URL
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${vapiSecretKey}`, // Use your secret key for authentication
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
             // Attempt to read the error body from Vapi's response
             const errorBody = await response.text();
             console.error(`Failed to fetch assistants from Vapi API. Status: ${response.status}, Body: ${errorBody}`);
             throw new Error(`Failed to fetch assistants from Vapi API: Status ${response.status} - ${errorBody}`);
        }

        const assistants = await response.json(); // Vapi returns a JSON array of assistant objects

        // Structure of assistant object (partial, focusing on voice):
        // { ..., voice: { provider, voiceId, ... }, name, ... }

        // Extract the voice information from each assistant
        // We'll create unique voice entries based on provider+voiceId
        const voices = {}; // Use an object/map to store unique voices

        assistants.forEach(assistant => {
            if (assistant.voice && assistant.voice.provider && assistant.voice.voiceId) {
                const voiceKey = `${assistant.voice.provider}-${assistant.voice.voiceId}`;

                // Only add if we haven't seen this voice before
                if (!voices[voiceKey]) {
                    voices[voiceKey] = {
                        // Map to the structure your frontend expects: { id, name, description, sampleAudioUrl, ... }
                        // Use a combination of provider and voiceId as the unique ID
                        id: voiceKey, // Using provider-voiceId as the unique ID for this list
                        // Use voiceId or assistant name for the display name
                        name: assistant.voice.voiceId || `Voice for ${assistant.name}`,
                        // Create a simple description
                        description: `Provider: ${assistant.voice.provider}`,
                        // *** IMPORTANT: The /assistant endpoint DOES NOT provide sample audio URLs ***
                        // We cannot get sample audio from this endpoint.
                        sampleAudioUrl: null, // Set this to null as we cannot get it here
                        // Include original provider/voiceId
                        provider: assistant.voice.provider,
                        voiceId: assistant.voice.voiceId, // Store the original Vapi voiceId
                        // Note: Assistant object doesn't give language/gender directly for the voice itself
                    };
                    // Refine name if it's just voiceId like "Elliot"
                    if (voices[voiceKey].name === voices[voiceKey].voiceId) {
                         voices[voiceKey].name = `${voices[voiceKey].voiceId} (${voices[voiceKey].provider})`;
                    }
                }
            }
        });

        // Convert the unique voices object back to an array
        const uniqueVoicesArray = Object.values(voices);

        // Filter out voices without sample audio URLs (all of them in this case)
        // This will likely result in an empty array if your frontend requires sampleAudioUrl
        // Let's remove this filter for now so you see the list, but understand samples won't play.
        // const voicesWithSamples = uniqueVoicesArray.filter(voice => voice.sampleAudioUrl !== null);


        console.log(`Successfully fetched and extracted ${uniqueVoicesArray.length} unique voices from assistants.`);

        // Return the extracted unique voices (even without sample URLs)
        return NextResponse.json(uniqueVoicesArray);

    } catch (error) {
        console.error("Error in /api/voices route fetching assistants:", error);

        // Return a 500 Internal Server Error response to the frontend
        return NextResponse.json(
            { message: "Failed to fetch voices via assistants", error: error.message || "An unknown error occurred during voice fetching" },
            { status: 500 }
        );
    }
}