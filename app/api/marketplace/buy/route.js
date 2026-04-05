export const dynamic = "force-dynamic";
// app/api/marketplace/buy/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { callAgents, traineeProgress, users } from "@/lib/db/schemaCharacterAI";
import { eq, sql } from "drizzle-orm";

export async function POST(req) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { agentId, type } = await req.json(); // type: 'owner' | 'train'

        // 1. Fetch Original Agent & User Credits
        const agentToBuy = await db.query.callAgents.findFirst({
            where: eq(callAgents.id, agentId)
        });
        
        const buyer = await db.query.users.findFirst({
            where: eq(users.id, user.id)
        });

        if (!agentToBuy) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

        // 2. Check Costs
        const cost = type === 'owner' 
            ? agentToBuy.marketplaceConfig.priceOwner 
            : agentToBuy.marketplaceConfig.priceTrain;

        if (buyer.credits < cost) {
            return NextResponse.json({ error: "Insufficient tokens" }, { status: 402 });
        }

        // 3. Deduct Credits
        await db.update(users)
            .set({ credits: sql`${users.credits} - ${cost}` })
            .where(eq(users.id, user.id));

        // 4. Fulfillment
        if (type === 'owner') {
            // CLONE STRATEGY: Duplicate the agent row
            const [clonedAgent] = await db.insert(callAgents).values({
                ...agentToBuy,
                id: undefined, // New ID
                creatorId: user.id, // New Owner
                name: `${agentToBuy.name} (Copy)`,
                createdAt: new Date(),
                updatedAt: new Date(),
                // Reset marketplace config so the clone isn't automatically for sale
                marketplaceConfig: { isForSale: false, usageCount: 0 }
            }).returning();
            
            return NextResponse.json({ success: true, newAgentId: clonedAgent.id, type: 'owner' });

        } else {
            // TRAIN STRATEGY: Create a progress record linked to the original
            await db.insert(traineeProgress).values({
                userId: user.id,
                agentId: agentId,
                totalXp: 0,
                level: 1,
                lastTrainedAt: new Date()
            });

            // Increment usage count on original agent
            // (Optional logic to pay the creator could go here)
            
            return NextResponse.json({ success: true, type: 'train' });
        }

    } catch (error) {
        console.error("Purchase Error:", error);
        return NextResponse.json({ error: "Transaction Failed" }, { status: 500 });
    }
}
