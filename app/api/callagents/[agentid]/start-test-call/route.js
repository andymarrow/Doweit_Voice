// app/api/callagents/[agentid]/start-test-call/route.js

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database";
import { callAgents } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';

const VAPI_SECRET_KEY = process.env.VAPI_SECRET_KEY;

export async function POST(req, { params }) {
    try {
        const { userId } = auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const agentId = parseInt(params.agentid, 10);
        if (isNaN(agentId)) return NextResponse.json({ error: 'Invalid Agent ID' }, { status: 400 });

        const { phoneNumber, userName } = await req.json();
        if (!phoneNumber || !userName) return NextResponse.json({ error: 'Phone number and name are required' }, { status: 400 });

        const agent = await db.query.callAgents.findFirst({
            where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId))
        });

        if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

        // --- STEP 1: PREPARE THE VAPI ASSISTANT CONFIGURATION ---
        // This is the object that will be used to create a temporary assistant for the call.
        const assistantConfig = {
            // --- FIX #1: Create a shorter, unique name ---
            name: `Test Agent ${agent.id}-${Date.now()}`.slice(0, 40),
            model: {
                 provider: "google",
                    model: "gemini-1.5-flash",
                messages: [{
                    role: "system",
                    content: agent.prompt || "You are a helpful assistant.",
                }],
            },
            voice: {
                // We simply pass the provider and voiceId. VAPI handles the rest.
                provider: agent.voiceConfig.voiceProvider === 'elevenlabs' ? '11labs' : 'vapi',
                voiceId: agent.voiceConfig.voiceId,
            },
            firstMessage: agent.greetingMessage || "Hello!",
            serverUrl: process.env.VAPI_SERVER_URL_PLACEHOLDER || "https://api.vapi.ai/webhook-test",
        };
        
        // --- NOTE: ALL LOGIC FOR FETCHING/DECRYPTING/PASSING KEYS IS NOW REMOVED ---
        // It is not needed because the user must configure their key in the VAPI dashboard.

        // --- STEP 2: CREATE A TEMPORARY VAPI ASSISTANT ---
        console.log("Creating temporary VAPI assistant with payload:", JSON.stringify(assistantConfig, null, 2));
        const createAssistantResponse = await fetch('https://api.vapi.ai/assistant', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VAPI_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assistantConfig),
        });

        const assistantData = await createAssistantResponse.json();

        if (!createAssistantResponse.ok) {
            console.error("Error creating VAPI assistant:", assistantData);
            const errorMessage = assistantData.message?.join(', ') || assistantData.error || 'Failed to create VAPI assistant.';
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }

        const newAssistantId = assistantData.id;
        console.log(`Successfully created temporary assistant with ID: ${newAssistantId}`);

        // --- STEP 3: START THE PHONE CALL USING THE NEW ASSISTANT ID ---
        const callPayload = {
            assistantId: newAssistantId,
            phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
            customer: {
                number: phoneNumber,
                name: userName,
            },
        };

        console.log("Initiating phone call with VAPI...");
        const startCallResponse = await fetch('https://api.vapi.ai/call/phone', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VAPI_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(callPayload),
        });

        const callData = await startCallResponse.json();

        if (!startCallResponse.ok) {
            console.error("Error starting VAPI call:", callData);
            const errorMessage = callData.message?.join(', ') || callData.error || 'Failed to initiate call with VAPI.';
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }

        return NextResponse.json({ success: true, callId: callData.id }, { status: 200 });

    } catch (error) {
        console.error('[API START-TEST-CALL]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}