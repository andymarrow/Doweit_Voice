// app/api/trainee/agents/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { traineeProgress, callAgents } from "@/lib/db/schemaCharacterAI";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req) {
    const { user } = await getSession(await headers());
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Fetch progress records joined with agent details
        // Note: Drizzle's query API handles the relation defined in schema
        const myTrainingAgents = await db.query.traineeProgress.findMany({
            where: eq(traineeProgress.userId, user.id),
            with: {
                agent: {
                    columns: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        type: true
                    }
                }
            },
            orderBy: [desc(traineeProgress.lastTrainedAt)]
        });

        // Flatten the structure for the frontend
        const formattedList = myTrainingAgents.map(record => ({
            id: record.agent.id,
            title: record.agent.name,
            avatarUrl: record.agent.avatarUrl,
            xp: record.totalXp,
            level: record.level,
            lastPlayed: record.lastTrainedAt ? new Date(record.lastTrainedAt).toLocaleDateString() : "New"
        }));

        return NextResponse.json(formattedList, { status: 200 });

    } catch (error) {
        console.error("Trainee Agents Fetch Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}