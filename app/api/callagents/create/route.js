// app/api/callagents/create/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadFileToFirebase } from '@/lib/firebase/upload';
// Correct import path for your combined schema file
import { callAgents } from '@/lib/db/schemaCharacterAI'; // <--- Ensure this path is correct for your project
import { db } from '@/configs/db'; // Your Drizzle DB instance
import { eq } from 'drizzle-orm';

// Configure Next.js to not parse the body, so we can use req.formData()
export const config = {
  api: {
    bodyParser: false,
  },
};

// --- POST function (already looks correct based on your setup) ---
export async function POST(req) {
    const { userId } = auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();

        const agentName = formData.get('name');
        const agentType = formData.get('type');
        const agentImageFile = formData.get('image');

        if (!agentName || typeof agentName !== 'string' || !agentName.trim()) {
            return NextResponse.json({ error: 'Agent name is required' }, { status: 400 });
        }
        if (!agentType || (agentType !== 'inbound' && agentType !== 'outbound')) {
             return NextResponse.json({ error: 'Valid agent type is required' }, { status: 400 });
        }

        let avatarUrl = null;
        if (agentImageFile instanceof File) {
            try {
                 avatarUrl = await uploadFileToFirebase(agentImageFile, userId, 'agent-avatars');
                 if (!avatarUrl) {
                     console.error(`[API CREATE] Failed to upload agent image for user ${userId}`);
                     return NextResponse.json({ error: 'Failed to upload agent image' }, { status: 500 });
                 }
                 console.log(`[API CREATE] Image uploaded successfully for user ${userId}: ${avatarUrl}`);
            } catch (uploadError) {
                 console.error(`[API CREATE] Firebase upload error for user ${userId}:`, uploadError);
                 return NextResponse.json({ error: 'Error uploading agent image' }, { status: 500 });
            }
        } else {
             console.log(`[API CREATE] No image file provided for user ${userId}`);
        }


        const newAgents = await db.insert(callAgents).values({
             creatorId: userId,
             name: agentName.trim(),
             type: agentType,
             avatarUrl: avatarUrl,
             voiceEngine: 'v2',
             aiModel: 'gpt4o',
             timezone: 'UTC',
             customVocabulary: [],
             useFillerWords: true,
             prompt: '',
             greetingMessage: '"Hello..."',
             voiceConfig: {},
             callConfig: {},
             knowledgeBaseId: null,
             status: 'draft',
        }).returning();

        if (!newAgents || newAgents.length === 0) {
            console.error(`[API CREATE] DB Insert failed for user ${userId}. Insert result:`, newAgents);
             return NextResponse.json({ error: 'Failed to create agent in database' }, { status: 500 });
        }

        const newAgent = newAgents[0];
        console.log(`[API CREATE] Agent created successfully for user ${userId}. ID: ${newAgent.id}`);

        return NextResponse.json(newAgent, { status: 201 });

    } catch (error) {
        console.error(`[API CREATE] Unexpected API Error for user ${userId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// --- GET function (Adding logging here) ---
export async function GET() {
    const { userId } = auth();

    console.log(`[API GET] Attempting to fetch agents. Current userId from auth: ${userId}`);

    if (!userId) {
        console.log('[API GET] Unauthorized: No userId from auth.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[API GET] Fetching agents for creatorId: ${userId}`);
        const agents = await db.query.callAgents.findMany({
            where: eq(callAgents.creatorId, userId),
             orderBy: (callAgents, { desc }) => [desc(callAgents.createdAt)],
        });

        console.log(`[API GET] Drizzle query executed for user ${userId}. Found ${agents.length} agents.`);
        // Log the fetched agents themselves (be mindful of sensitive data in logs)
        // console.log('[API GET] Fetched Agents:', agents);


        // Return the list of agents
        return NextResponse.json(agents, { status: 200 });

    } catch (error) {
        console.error(`[API GET] Unexpected API Error for user ${userId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}