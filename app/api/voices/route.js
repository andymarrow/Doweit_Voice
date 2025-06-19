// app/api/voices/route.js
import { NextResponse } from 'next/server';
import { getAvailableVoices } from '@/lib/google-ai/gemini-chat-stream'; // Your AI utility

export async function GET() {
    try {
        // Call the utility to get the list of voices
        const voices = await getAvailableVoices();

        // Return the list as JSON
        return NextResponse.json({ voices }, { status: 200 });

    } catch (error) {
        console.error("API Error /api/voices:", error);
        return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
    }
}