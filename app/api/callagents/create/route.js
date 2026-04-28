// app/api/callagents/create/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadFile } from "@/lib/uploadthing/server";
import { callAgents } from "@/lib/db/schemaCharacterAI";
import { db } from "@/lib/database";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- POST function ---
export async function POST(req) {
	const { user } = await getSession(await headers());
	const userId = user?.id;

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const contentType = req.headers.get("content-type") || "";

		// ---------------------------------------------------------
		// SCENARIO 1: JSON Payload (New Recruitment/Advanced Agents)
		// ---------------------------------------------------------
		if (contentType.includes("application/json")) {
			const body = await req.json();

			const {
				name,
				type = "recruiter", // Default for this flow
				avatarUrl,
				voiceConfig,
				recruitmentConfig,
				systemPrompt,
			} = body;

			if (!name || typeof name !== "string" || !name.trim()) {
				return NextResponse.json(
					{ error: "Agent name is required" },
					{ status: 400 },
				);
			}

			const [newAgent] = await db
				.insert(callAgents)
				.values({
					creatorId: userId,
					name: name.trim(),
					type: type,
					avatarUrl: avatarUrl || null, // URL passed from frontend (if pre-uploaded)

					// Defaults
					voiceEngine: "v2",
					aiModel: "gpt4o",
					timezone: "UTC",
					customVocabulary: [],
					useFillerWords: true,

					// Specifics from Wizard
					prompt: systemPrompt || "",
					greetingMessage: "Hello! Ready to begin the interview?", // Smart default

					// JSONB Configurations
					voiceConfig: voiceConfig || {},
					callConfig: {}, // Default empty
					recruitmentConfig: recruitmentConfig || {},
					marketplaceConfig: { isForSale: false, usageCount: 0 },

					status: "active", // Recruitment agents usually start active
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return NextResponse.json(newAgent, { status: 201 });
		}

		// ---------------------------------------------------------
		// SCENARIO 2: FormData Payload (Standard Call Agents)
		// ---------------------------------------------------------
		else {
			const formData = await req.formData();

			const agentName = formData.get("name");
			const agentType = formData.get("type");
			const agentImageFile = formData.get("image");

			if (!agentName || typeof agentName !== "string" || !agentName.trim()) {
				return NextResponse.json(
					{ error: "Agent name is required" },
					{ status: 400 },
				);
			}

			// Validate allowed types (Updated to include new types)
			const validTypes = [
				"inbound",
				"outbound",
				"recruiter",
				"trainee_clone",
			];
			if (!agentType || !validTypes.includes(agentType)) {
				return NextResponse.json(
					{ error: "Valid agent type is required" },
					{ status: 400 },
				);
			}

			let avatarUrl = null;
			if (agentImageFile instanceof File) {
				try {
					avatarUrl = await uploadFile(
						agentImageFile,
						userId,
						"agent-avatars",
					);
					if (!avatarUrl) {
						console.error(
							`[API CREATE] Failed to upload agent image for user ${userId}`,
						);
						return NextResponse.json(
							{ error: "Failed to upload agent image" },
							{ status: 500 },
						);
					}
				} catch (uploadError) {
					console.error(
						`[API CREATE] UploadThing error for user ${userId}:`,
						uploadError,
					);
					return NextResponse.json(
						{ error: "Error uploading agent image" },
						{ status: 500 },
					);
				}
			}

			const [newAgent] = await db
				.insert(callAgents)
				.values({
					creatorId: userId,
					name: agentName.trim(),
					type: agentType,
					avatarUrl: avatarUrl,
					voiceEngine: "v2",
					aiModel: "gpt4o",
					timezone: "UTC",
					customVocabulary: [],
					useFillerWords: true,
					prompt: "",
					greetingMessage: '"Hello..."',
					voiceConfig: {},
					callConfig: {},
					recruitmentConfig: {}, // Empty for standard agents
					marketplaceConfig: { isForSale: false, usageCount: 0 },
					knowledgeBaseId: null,
					status: "draft",
				})
				.returning();

			if (!newAgent) {
				return NextResponse.json(
					{ error: "Failed to create agent in database" },
					{ status: 500 },
				);
			}

			console.log(
				`[API CREATE] Agent created successfully for user ${userId}. ID: ${newAgent.id}`,
			);

			return NextResponse.json(newAgent, { status: 201 });
		}
	} catch (error) {
		console.error(
			`[API CREATE] Unexpected API Error for user ${userId}:`,
			error,
		);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// --- GET function ---
export async function GET() {
	const { user } = await getSession(await headers());
	const userId = user?.id;

	if (!userId) {
		console.log("[API GET] Unauthorized: No userId from auth.");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		console.log(`[API GET] Fetching agents for creatorId: ${userId}`);
		const agents = await db.query.callAgents.findMany({
			where: eq(callAgents.creatorId, userId),
			orderBy: (callAgents, { desc }) => [desc(callAgents.createdAt)],
		});

		return NextResponse.json(agents, { status: 200 });
	} catch (error) {
		console.error(`[API GET] Unexpected API Error for user ${userId}:`, error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}