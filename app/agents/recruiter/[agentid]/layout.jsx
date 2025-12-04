// app/agents/recruiter/[agentid]/layout.jsx
import { notFound } from "next/navigation";
import { db } from "@/lib/database";
import { callAgents } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";
import ClientLayout from "./ClientLayout";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";

// --- TEMPORARY MOCK DATA GENERATOR ---
// This ensures you can view the UI even if the agent doesn't exist in DB yet.
function getMockAgent(id) {
    return {
        id: id,
        name: "Senior React Developer (Demo)",
        type: "recruiter",
        avatarUrl: null,
        voiceEngine: "v2",
        status: "active",
        createdAt: new Date().toISOString(),
        // Mock Knowledge Base link
        knowledgeBase: {
            id: 999,
            name: "React Dev Job Description.pdf"
        },
        // Mock Recruit Config
        recruitmentConfig: {
            jobDescription: "Expert in React, Next.js, and Tailwind...",
            candidateLimit: 50
        }
    };
}

async function getRecruiterAgent(agentId, userId) {
    if (!agentId || !userId) return null;

    try {
        // 1. Try fetching from Real DB
        const agent = await db.query.callAgents.findFirst({
            where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)),
            with: {
                knowledgeBase: true,
            },
        });
        
        if (agent) return agent;

        // 2. FALLBACK: If not found in DB, return Mock Data (FOR DEVELOPMENT ONLY)
        // This allows you to click 'Agent 4' from the demo list and see the page.
        console.log(`[DEV MODE] Agent ${agentId} not found in DB. Using Mock Data.`);
        return getMockAgent(agentId);

    } catch (error) {
        console.error(`Error fetching recruiter agent ${agentId}:`, error);
        // Fallback on error too
        return getMockAgent(agentId);
    }
}

export default async function RecruiterAgentLayout({ children, params }) {
    // 1. Authenticate
    const { user } = await getSession(await headers());
    // For Dev UI visualization, you might even comment this out if auth isn't set up fully yet
    if (!user) {
        // return notFound(); // Uncomment strict check later
        console.warn("[DEV] No user logged in, proceeding with mock context."); 
    }

    const agentId = parseInt(params.agentid, 10);
    if (isNaN(agentId)) notFound();

    // 2. Get Agent (Real or Mock)
    const agent = await getRecruiterAgent(agentId, user?.id || 'mock-user-id');
    
    if (!agent) notFound();

    return (
        <ClientLayout agent={agent}>
            {children}
        </ClientLayout>
    );
}