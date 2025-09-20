// app/callagents/[agentid]/layout.jsx
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/database";
import { callAgents } from '@/lib/db/schemaCharacterAI';
import { eq, and } from 'drizzle-orm';
import AgentDetailLayoutClient from './AgentLayoutClient';

// Utility to safely parse agentId from params
function parseAgentId(params) {
    const id = parseInt(params.agentid, 10);
    return isNaN(id) ? null : id;
}

// ***** THIS IS THE CORRECTED FUNCTION *****
async function getAgentDataWithKb(agentId, userId) {
    if (!agentId || !userId) {
        return null;
    }
    console.log(`[AGENT LAYOUT SERVER] Fetching agent ID ${agentId} AND its Knowledge Base for user ${userId}`);

    try {
        // Direct DB query in Server Component that JOINS the knowledge base
        const agent = await db.query.callAgents.findFirst({
            where: and(
                eq(callAgents.id, agentId),
                eq(callAgents.creatorId, userId)
            ),
            // This `with` clause tells Drizzle to also fetch the related knowledge base
            // and attach it to the agent object as `agent.knowledgeBase`
            with: {
                knowledgeBase: true,
            },
        });

        if (agent) {
            console.log(`[AGENT LAYOUT SERVER] Found Agent: ${agent.name}. Knowledge Base attached: ${!!agent.knowledgeBase}`);
        } else {
            console.log(`[AGENT LAYOUT SERVER] Agent not found for ID ${agentId}.`);
        }

        return agent;

    } catch (error) {
        console.error(`[AGENT LAYOUT SERVER] Database error fetching agent ${agentId} for user ${userId}:`, error);
        return null;
    }
}

// This Server Component layout fetches data and renders the Client wrapper
export default async function AgentDetailLayout({ children, params }) {
    const { userId } = auth();

    if (!userId) {
        notFound();
    }

    const agentId = parseAgentId(params);

    if (!agentId) {
        notFound();
    }

    // Fetch the agent data ON THE SERVER using the corrected function
    const agent = await getAgentDataWithKb(agentId, userId);

    // If agent is not found for this user, render a 404 page
    if (!agent) {
        notFound();
    }

    // Pass the fetched agent data (which now includes the full knowledge base object)
    // to the Client Component wrapper
    return (
        <AgentDetailLayoutClient agent={agent}>
            {children}
        </AgentDetailLayoutClient>
    );
}