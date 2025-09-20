// app/api/callagents/[agentid]/calls/export-to-sheets/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/configs/db";
import { callAgents, calls } from "@/lib/db/schemaCharacterAI";
import { getAuthenticatedClient } from "@/lib/google/googleAuth";
import { prepareCallDataForExport } from "@/lib/exportEngine";
import { ensureHeaderRow, appendRows } from "@/lib/google/sheetsHelper";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req, { params }) {
	const { user } = await getSession(await headers());
	const userId = user?.id;

	const agentId = parseInt(params.agentid, 10);

	if (!userId)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (isNaN(agentId))
		return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });

	try {
		const { callIds } = await req.json();

		if (!Array.isArray(callIds) || callIds.length === 0) {
			return NextResponse.json(
				{ error: "An array of callIds is required." },
				{ status: 400 },
			);
		}

		// 1. Verify user owns the agent and get its G-Sheets config
		const agent = await db.query.callAgents.findFirst({
			where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)),
		});

		if (!agent) {
			return NextResponse.json(
				{ error: "Agent not found or not authorized" },
				{ status: 404 },
			);
		}

		const spreadsheetId = agent.integrationConfig?.googleSheets?.spreadsheetId;
		if (!spreadsheetId) {
			return NextResponse.json(
				{
					error: "Google Sheets integration is not configured for this agent.",
				},
				{ status: 400 },
			);
		}

		// 2. Fetch and format the data using our export engine
		console.log(
			`[G-Sheets Export] Preparing to export ${callIds.length} calls for agent ${agentId}.`,
		);
		const { headers, rows } = await prepareCallDataForExport(callIds);

		if (rows.length === 0) {
			return NextResponse.json({
				message: "No valid call data found for the provided IDs.",
			});
		}

		// 3. Authenticate with Google and send the data
		const authClient = await getAuthenticatedClient(userId);

		await ensureHeaderRow(authClient, spreadsheetId, headers);
		await appendRows(authClient, spreadsheetId, rows);

		// 4. Mark the exported calls as such in our database
		await db
			.update(calls)
			.set({ isExported: true, updatedAt: new Date() })
			.where(and(eq(calls.agentId, agentId), inArray(calls.id, callIds)));

		console.log(
			`[G-Sheets Export] Successfully exported ${rows.length} calls.`,
		);

		return NextResponse.json({ success: true, exportedCount: rows.length });
	} catch (error) {
		console.error(`[G-Sheets Export] API Error for agent ${agentId}:`, error);
		return NextResponse.json(
			{ error: "Internal server error during export" },
			{ status: 500 },
		);
	}
}

