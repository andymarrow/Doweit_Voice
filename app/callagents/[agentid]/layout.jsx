// app/callagents/[agentid]/layout.jsx
// This is a Server Component by default

import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server'; // Use server-side auth
import { db } from '@/configs/db'; // Direct DB access in Server Component
// Assuming your combined schema is in schemaCharacterAI.js
import { callAgents } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';

// Import the Client Component wrapper
import AgentDetailLayoutClient from './AgentLayoutClient';

// Utility to safely parse agentId from params
function parseAgentId(params) {
    const id = parseInt(params.agentid, 10);
    return isNaN(id) ? null : id;
}

// Fetch agent data on the server
async function getAgentData(agentId, userId) {
    if (!agentId || !userId) {
        return null;
    }
    console.log(`[AGENT DETAIL LAYOUT] Server fetching agent ID ${agentId} for user ${userId}`);

    try {
        // Direct DB query in Server Component for performance
        const agent = await db.query.callAgents.findFirst({
            where: and(
                eq(callAgents.id, agentId),
                eq(callAgents.creatorId, userId)
            ),
            // Select specific fields needed for the layout and child components
            columns: {
                 id: true,
                 name: true,
                 type: true, // Needed for display
                 avatarUrl: true, // Needed for display
                 voiceEngine: true, // Needed for display
                 phoneNumber: true, // Needed for the alert banner on dashboard page
                 // ... include any other fields required immediately by sidebar or dashboard
                 // If you need full config, remove the columns filter
                 config: true, // Include config for pages that need it
                 voiceConfig: true, // Include voice config
                 callConfig: true, // Include call config
                 prompt: true, // Include prompt
                 greetingMessage: true, // Include greeting
                 knowledgeBaseId: true, // Include KB link
                 status: true, // Include status
                 createdAt: true, // Include timestamps
                 updatedAt: true,
            }
        });

        console.log(`[AGENT DETAIL LAYOUT] Fetch result for agent ID ${agentId}:`, agent ? `Found Agent: ${agent.name}` : 'Not Found');

        return agent;

    } catch (error) {
        console.error(`[AGENT DETAIL LAYOUT] Database error fetching agent ${agentId} for user ${userId}:`, error);
        // In a real app, you might log this error more robustly
        return null; // Return null if DB error occurs
    }
}


// This Server Component layout fetches data and renders the Client wrapper
export default async function AgentDetailLayout({ children, params }) {
    const { userId } = auth(); // Get user ID in Server Component

    // Handle unauthenticated access immediately on the server
    if (!userId) {
        // Use next/navigation redirect or notFound if appropriate
         console.warn("[AGENT DETAIL LAYOUT] User not authenticated. Redirecting or showing not found.");
        notFound(); // Or redirect('/sign-in');
    }

    const agentId = parseAgentId(params); // Get agent ID from params

    // If agentId is not valid or missing, render 404
     if (!agentId) {
         console.warn(`[AGENT DETAIL LAYOUT] Invalid or missing agentId in params: ${params.agentid}. Showing not found.`);
         notFound();
     }

    // Fetch the agent data on the server
    const agent = await getAgentData(agentId, userId);

    // If agent is not found for this user, render a 404 page
    if (!agent) {
        console.warn(`[AGENT DETAIL LAYOUT] Agent data null for ID ${agentId}, user ${userId}. Showing not found.`);
        notFound();
    }

    // Pass the fetched agent data to the Client Component wrapper
    return (
        <AgentDetailLayoutClient agent={agent}>
            {children} {/* The specific page component (dashboard, configure, etc.) */}
        </AgentDetailLayoutClient>
    );
}