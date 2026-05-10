export const dynamic = 'force-dynamic';
// app/api/recruiter/voices/route.js

import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('[Recruiter Voices] GET request received');

        const elevenLabsKey =
            process.env.ELEVENLABS_API_KEY ||
            process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

        // ❌ No API key → return empty (no fake voices)
        if (!elevenLabsKey) {
            return NextResponse.json({
                voices: [],
                provider: 'elevenlabs',
                apiKeyRequired: true,
                message: 'Missing ElevenLabs API key'
            });
        }

        // ✅ Fetch voices
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': elevenLabsKey
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('[Recruiter Voices] ElevenLabs API error:', response.status);

            return NextResponse.json({
                voices: [],
                provider: 'elevenlabs',
                apiKeyRequired: false,
                error: 'Failed to fetch voices from ElevenLabs'
            }, { status: 500 });
        }

        const data = await response.json();
        const voices = data.voices || [];

        // ✅ Process + filter voices
        const processedVoices = voices
            .filter((voice) => {
                return (
                    voice &&
                    voice.voice_id &&
                    voice.name &&
                    !voice.is_cloned &&                  // remove cloned
                    voice.category !== 'cloned'          // extra safety
                );
            })
            .slice(0, 20) // limit to 20 voices
            .map((voice) => ({
                id: voice.voice_id,
                name: voice.name,

                // category (fallback safe)
                category: voice.category || 'general',

                // labels (IMPORTANT: ElevenLabs uses this)
                gender: voice.labels?.gender || 'unknown',
                age: voice.labels?.age || 'unknown',
                accent: voice.labels?.accent || 'neutral',
                use_case: voice.labels?.use_case || 'general',
                language: voice.labels?.language || 'en',

                description: voice.labels?.description || '',

                preview_url: voice.preview_url || null,

                is_multilingual: voice.labels?.multilingual || false,
                is_cloned: voice.is_cloned || false
            }))
            .sort((a, b) => {
                if (a.category !== b.category) {
                    return a.category.localeCompare(b.category);
                }
                return a.name.localeCompare(b.name);
            });

        console.log(`[Recruiter Voices] Loaded ${processedVoices.length} voices`);

        return NextResponse.json({
            voices: processedVoices,
            provider: 'elevenlabs',
            total: processedVoices.length
        });

    } catch (error) {
        console.error('[Recruiter Voices] Unexpected error:', error);

        return NextResponse.json({
            voices: [],
            provider: 'elevenlabs',
            error: 'Internal server error'
        }, { status: 500 });
    }
}