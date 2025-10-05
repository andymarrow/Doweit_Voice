// app/api/callagents/[agentid]/delete/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";
import { deleteFileFromFirebase } from "@/lib/firebase/storage"; // We will create this helper

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- DELETE function ---
export async function DELETE(req, { params }) {
    // 1. Authenticate the user
    const { user } = await getSession(await headers());
    const userId = user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the agentId from the URL
    const { agentid: agentId } = params;
    if (!agentId) {
        return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    try {
        // 3. Find the agent to ensure it exists and belongs to the user before deleting
        const agentToDelete = await db.query.callAgents.findFirst({
            where: and(
                eq(callAgents.id, agentId),
                eq(callAgents.creatorId, userId)
            ),
            columns: {
                avatarUrl: true // We only need the avatarUrl for cleanup
            }
        });

        // If no agent is found, return a 404 error
        if (!agentToDelete) {
            return NextResponse.json({ error: "Agent not found or you do not have permission" }, { status: 404 });
        }

        // 4. Delete the agent from the database.
        // IMPORTANT: If you have other tables (like calls, logs, etc.) linked to this agent,
        // your database schema should be set up with "ON DELETE CASCADE" for the foreign key.
        // This ensures that when an agent is deleted, all its related records in other tables are automatically deleted too.
        // If not, you would need to delete those records here first within a database transaction.
        await db.delete(callAgents).where(eq(callAgents.id, agentId));

        // 5. If the agent had an avatar, delete it from Firebase Storage to save space
        if (agentToDelete.avatarUrl) {
            try {
                await deleteFileFromFirebase(agentToDelete.avatarUrl);
            } catch (storageError) {
                // Log the error but don't fail the request. The primary goal was deleting the DB record.
                console.warn(`[API DELETE] Failed to delete Firebase asset for agent ${agentId}, but DB record was deleted. URL: ${agentToDelete.avatarUrl}`, storageError);
            }
        }

        console.log(`[API DELETE] Agent ${agentId} deleted successfully by user ${userId}.`);
        return NextResponse.json({ message: "Agent deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error(`[API DELETE] Unexpected error for agent ${agentId} and user ${userId}:`, error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}// app/api/callagents/[agentid]/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";
import { deleteFileFromFirebase } from "@/lib/firebase/storage"; // We will create this helper

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- DELETE function ---
export async function DELETE(req, { params }) {
    // 1. Authenticate the user
    const { user } = await getSession(await headers());
    const userId = user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the agentId from the URL
    const { agentid: agentId } = params;
    if (!agentId) {
        return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    try {
        // 3. Find the agent to ensure it exists and belongs to the user before deleting
        const agentToDelete = await db.query.callAgents.findFirst({
            where: and(
                eq(callAgents.id, agentId),
                eq(callAgents.creatorId, userId)
            ),
            columns: {
                avatarUrl: true // We only need the avatarUrl for cleanup
            }
        });

        // If no agent is found, return a 404 error
        if (!agentToDelete) {
            return NextResponse.json({ error: "Agent not found or you do not have permission" }, { status: 404 });
        }

        // 4. Delete the agent from the database.
        // IMPORTANT: If you have other tables (like calls, logs, etc.) linked to this agent,
        // your database schema should be set up with "ON DELETE CASCADE" for the foreign key.
        // This ensures that when an agent is deleted, all its related records in other tables are automatically deleted too.
        // If not, you would need to delete those records here first within a database transaction.
        await db.delete(callAgents).where(eq(callAgents.id, agentId));

        // 5. If the agent had an avatar, delete it from Firebase Storage to save space
        if (agentToDelete.avatarUrl) {
            try {
                await deleteFileFromFirebase(agentToDelete.avatarUrl);
            } catch (storageError) {
                // Log the error but don't fail the request. The primary goal was deleting the DB record.
                console.warn(`[API DELETE] Failed to delete Firebase asset for agent ${agentId}, but DB record was deleted. URL: ${agentToDelete.avatarUrl}`, storageError);
            }
        }

        console.log(`[API DELETE] Agent ${agentId} deleted successfully by user ${userId}.`);
        return NextResponse.json({ message: "Agent deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error(`[API DELETE] Unexpected error for agent ${agentId} and user ${userId}:`, error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}