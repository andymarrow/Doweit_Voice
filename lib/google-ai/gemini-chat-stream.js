// lib/google-ai/gemini-chat-stream.js
import {
  GoogleGenAI,
//   LiveServerMessage, // No need to import types in JS
  MediaResolution,
  Modality,
//   Session, // No need to import types in JS
} from '@google/genai';

const apiKey = process.env.GEMNI_API_KEY; // Ensure GEMINI_API_KEY is in your environment variables
if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable not set.");
    // Depending on your setup, you might throw an error or handle this differently
    // For a backend API route, throwing might be appropriate if the key is mandatory
    // throw new Error("GEMINI_API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey });

// Define the model for audio dialogue
const AI_STREAMING_MODEL = 'models/gemini-2.5-flash-preview-native-audio-dialog';

/**
 * Utility to interact with the Google AI Studio streaming chat model.
 * It handles sending a prompt, receiving text and audio chunks, and returning
 * the accumulated text and potentially the audio data/URL for a single turn.
 *
 * NOTE: The AI Studio streaming API (`live.connect`) is designed for real-time,
 * turn-by-turn interaction, often involving audio input as well. Using it
 * from a standard HTTP request/response API route is a bit unusual as HTTP
 * is not inherently streaming two ways in the same connection.
 *
 * This implementation will simulate waiting for *one complete AI turn*
 * before resolving. It will collect text and audio data for that turn.
 * For the audio data, we'll collect the base64 chunks. You will likely need
 * to process these chunks (e.g., combine, convert to a playable format like WAV)
 * and decide how to serve them (e.g., save temporarily and return a URL).
 *
 * A more robust real-time voice chat would typically use WebSockets.
 * For this plan, we'll collect audio data in base64, combine it, and
 * discuss how to handle serving it.
 */

/**
 * Simulates one turn of interaction with the streaming model.
 * @param {string} userMessage - The user's input message.
 * @param {Array<Object>} history - Previous messages for context. Expected format: [{ sender: 'user' | 'character', text: string, ... }]
 * @param {Object} characterConfig - Character details { name, description, greeting, language, voiceId, behavior: string[] }.
 * @returns {Promise<{text: string, audioData: string|null}>} - The accumulated AI response text (string) and raw audio data (base64 string) or null.
 */
export async function getAiStreamResponse(userMessage, history, characterConfig) {
    // Simple prompt construction (can be made more sophisticated)
    // Ensuring characterConfig properties are accessed safely
     const charName = characterConfig.name || 'Character';
     const charDescription = characterConfig.description || 'an AI.';
     const charBehavior = Array.isArray(characterConfig.behavior) ? characterConfig.behavior.join(', ') : 'neutral';
     const charGreeting = characterConfig.greeting || '';
     const charLanguage = characterConfig.language || 'en'; // Default language

    const prompt = `
        You are ${charName}. ${charDescription}
        Your personality/behavior includes: ${charBehavior}.
        Your standard greeting is: "${charGreeting}"

        You must respond ONLY in the ${charLanguage} language.
        Do not switch languages, even if the user speaks another language.
        If you cannot fulfill a request in ${charLanguage}, state that you cannot in that language.

        Here is the recent conversation history:
        ${history.map(msg => `${msg.sender === 'user' ? charName : 'You'}: ${msg.text}`).join('\n')}
        User: ${userMessage}
        ${charName}:
    `.trim(); // Trim leading/trailing whitespace

    // const responseQueue = []; // Not directly used in this promise-based approach
    let session; // AI session instance

    let accumulatedText = '';
    const audioPartsBase64 = []; // Collect base64 audio chunks

    let resolveTurn;
    let rejectTurn; // Added reject for errors
    let turnIsResolved = false; // Flag to track if resolveTurn has been called

    const turnCompletePromise = new Promise((resolve, reject) => {
         resolveTurn = () => {
             if (!turnIsResolved) {
                 turnIsResolved = true;
                 resolve();
             }
         };
         rejectTurn = (err) => {
              if (!turnIsResolved) { // Only reject if not already resolved/rejected
                  turnIsResolved = true;
                  reject(err);
              }
         };
     });


    try {
        // Connect to the streaming model
        session = await ai.live.connect({
            model: AI_STREAMING_MODEL,
            callbacks: {
                onopen: () => console.debug('AI Live Session Opened'),
                onmessage: (message /*: LiveServerMessage*/) => { // Removed type annotation
                    // Process incoming messages from the AI
                    if (message.serverContent?.modelTurn?.parts) {
                        for (const part of message.serverContent.modelTurn.parts) {
                            if (part?.text) {
                                accumulatedText += part.text; // Accumulate text
                                // console.log('Received Text:', part.text); // Debugging
                            }
                            if (part?.inlineData?.data && part?.inlineData?.mimeType.startsWith('audio/')) {
                                // Collect audio data chunks (base64)
                                audioPartsBase64.push(part.inlineData.data);
                                // console.log('Received Audio Chunk'); // Debugging
                            }
                             // Handle turn completion signal
                            if (message.serverContent.modelTurn.turnComplete) {
                                console.debug('AI Turn Complete Signal Received');
                                resolveTurn(); // Resolve the promise when the turn is complete
                                // Note: There might be more parts after turnComplete,
                                // but we resolve the turn promise based on the signal.
                                // If you need ALL parts, remove the `break` and resolve after the loop in a timeout,
                                // or use a counter for expected parts if the API provides one.
                                // For this turn-based API, waiting for `turnComplete` is standard.
                                break;
                            }
                        }
                    }
                },
                onerror: (e /*: ErrorEvent*/) => { // Removed type annotation
                    console.error('AI Live Session Error:', e.message);
                    // Reject the promise on error
                    rejectTurn(new Error(`AI session error: ${e.message}`));
                },
                onclose: (e /*: CloseEvent*/) => { // Removed type annotation
                    console.debug('AI Live Session Closed:', e.reason);
                    // If the session closes *before* the turnComplete signal, treat it as an error or unexpected close
                    if (!turnIsResolved) {
                         console.warn("AI session closed before turn complete signal. Reason:", e.reason);
                         // Decide how to handle this:
                         // Option A: Treat as error (reject) - Might lose partial response
                         // rejectTurn(new Error(`AI session closed unexpectedly: ${e.reason}`));
                         // Option B: Resolve with partial data (resolve) - Assumes partial data is usable
                         resolveTurn(); // Resolve the turn promise so the outer function can proceed
                         // Option C: Add a timeout - Wait a bit more before deciding
                    }
                     // If already resolved, this is just a normal close after the turn finished
                },
            },
            config: {
                responseModalities: [Modality.AUDIO, Modality.TEXT], // Request both text and audio
                mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM, // Audio quality
                speechConfig: {
                    // Specify the voice ID from the character config
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                             // Use the stored AI Studio voice ID from character config
                             voiceName: characterConfig.voiceId,
                        }
                    }
                },
                 // Optional: Context window compression if needed for long histories
                // contextWindowCompression: {
                //     triggerTokens: '25600',
                //     slidingWindow: { targetTokens: '12800' },
                // },
            }
        });

        // Send the user's turn to the AI
        session.sendClientContent({
            turns: [
                {
                    // You could potentially send audio input here too if you implement speech-to-text
                    // userInput: { audio: {...} },
                    // Send text input
                    text: prompt, // Send the constructed prompt
                }
            ]
        });

        // Wait for the AI's turn to complete (or for an error)
         await turnCompletePromise;

         // Once the turn is complete, close the session gracefully
         // This is important to free up resources on the AI service side
         if (session) {
             try {
                 session.close();
                 console.debug('AI Live Session Closed Gracefully');
             } catch (closeErr) {
                 console.error("Error closing AI session after turn complete:", closeErr);
                 // Continue as the response data was already processed
             }
         }


        // Combine base64 audio parts if any
        const combinedAudioBase64 = audioPartsBase64.join('');
        const audioData = combinedAudioBase64 ? combinedAudioBase64 : null;

        return {
            text: accumulatedText,
            audioData: audioData // Base64 string of combined audio
        };

    } catch (error) {
        console.error('Error during AI streaming session:', error);
        // Ensure session is closed on error if it was successfully opened
        if (session) {
            try {
                session.close();
                 console.debug('AI Live Session Closed on Error');
            } catch (closeErr) {
                console.error("Error closing AI session after initial error:", closeErr);
            }
        }
        // Re-throw the error so the calling API route can handle it
        throw error;
    }
}

/**
 * Function to get available voices.
 * NOTE: Google AI Studio Stream API doesn't have a public endpoint to list voices easily.
 * We'll provide a hardcoded list or integrate with Google Cloud Text-to-Speech API if needed.
 * For MVP, return a curated list of known working voice names for the streaming model.
 * You might need to test these names with the actual API.
 *
 * This function is fine as is in terms of JS syntax.
 */
export async function getAvailableVoices() {
     // This is a simplified, hardcoded list based on known voices for the streaming model.
     // In a real-world app, you might:
     // 1. Use Google Cloud Text-to-Speech API to list voices (if its voices are compatible/available)
     // 2. Maintain a database of supported voices and their AI Studio IDs
     // 3. Have pre-generated sample audio files stored in Firebase/GCS.

     const voices = [
        // Example voices known to work with gemini-2.5-flash-preview-native-audio-dialog
        // You might need to confirm the exact list and their characteristics.
        // Added a placeholder sample URL for testing
        {
             id: 'zephyr',
             name: 'Zephyr',
             platformVoiceId: 'Zephyr', // The actual ID to use in the API call config
             description: 'Standard female voice.',
             avatarUrl: '/voice-previews/zephyr-avatar.jpg', // Placeholder or link to your asset
             sampleAudioUrl: '/voice-previews/zephyr-sample.mp3', // Placeholder or link to your asset
             type: 'AI Studio',
             language: 'en', // Check actual language support
             gender: 'female',
        },
        {
             id: 'puck',
             name: 'Puck',
             platformVoiceId: 'Puck',
             description: 'Standard male voice.',
             avatarUrl: '/voice-previews/puck-avatar.jpg', // Placeholder
             sampleAudioUrl: '/voice-previews/puck-sample.mp3', // Placeholder
             type: 'AI Studio',
             language: 'en', // Check actual language support
             gender: 'male',
        },
         {
             id: 'charon',
             name: 'Charon',
             platformVoiceId: 'Charon',
             description: 'Another female voice.',
             avatarUrl: '/voice-previews/charon-avatar.jpg', // Placeholder
             sampleAudioUrl: '/voice-previews/charon-sample.mp3', // Placeholder
             type: 'AI Studio',
             language: 'en', // Check actual language support
             gender: 'female',
         },
         // Add other AI Studio voices if known...

         // Example structure for custom/cloned voices (you'd manage these in your DB)
        //  {
        //      id: 'my-clone-1',
        //      name: 'Andy Clone',
        //      platformVoiceId: 'custom-voice-id-from-another-platform-if-integrated', // Or marker indicating custom
        //      description: 'A voice cloned from Andy.',
        //      avatarUrl: '/custom-voices/andy-clone-avatar.jpg', // Your asset
        //      sampleAudioUrl: '/custom-voices/andy-clone-sample.mp3', // Your asset
        //      type: 'Custom',
        //      language: 'en',
        //      gender: 'male',
        //  },
     ];

     // Simulate a network delay
     await new Promise(resolve => setTimeout(resolve, 200));

     return voices; // Return the curated list
}


// Removed the non-standard Promise.prototype modifications
// Using a flag 'turnIsResolved' within getAiStreamResponse is a safer approach.