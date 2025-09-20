// app/api/callagents/[agentid]/integrations/google-sheets/setup/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { google } from "googleapis";
import { db } from "@/configs/db";
import {
	callAgents,
	calls,
	callActionValues,
} from "@/lib/db/schemaCharacterAI";
import { getAuthenticatedClient } from "@/lib/google/googleAuth";
import { prepareCallDataForExport } from "@/lib/exportEngine";
import { ensureHeaderRow, appendRows } from "@/lib/google/sheetsHelper";
import { eq, and, isNotNull } from "drizzle-orm";

// This is the background job that exports pre-analyzed calls after setup.
async function exportExistingAnalyzedCalls(userId, agentId, spreadsheetId) {
	console.log(
		`[G-Sheets Background Job] Checking for pre-analyzed calls to export for agent ${agentId}`,
	);

	// Find calls for this agent that have action values but have not been exported yet.
	const callsToExport = await db
		.selectDistinct({ id: calls.id })
		.from(calls)
		.leftJoin(callActionValues, eq(calls.id, callActionValues.callId))
		.where(
			and(
				eq(calls.agentId, agentId),
				eq(calls.isExported, false),
				isNotNull(callActionValues.id), // This ensures the call has been analyzed
			),
		);

	const callIds = callsToExport.map((c) => c.id);

	if (callIds.length === 0) {
		console.log(
			`[G-Sheets Background Job] No pre-analyzed calls found to export.`,
		);
		return;
	}

	console.log(
		`[G-Sheets Background Job] Found ${callIds.length} calls to export.`,
	);

	try {
		const authClient = await getAuthenticatedClient(userId);
		const { headers, rows } = await prepareCallDataForExport(callIds);

		await ensureHeaderRow(authClient, spreadsheetId, headers);
		await appendRows(authClient, spreadsheetId, rows);

		// Mark these calls as exported in the database
		await db
			.update(calls)
			.set({ isExported: true, updatedAt: new Date() })
			.where(and(eq(calls.agentId, agentId), inArray(calls.id, callIds)));

		console.log(
			`[G-Sheets Background Job] Successfully exported ${callIds.length} pre-analyzed calls.`,
		);
	} catch (error) {
		console.error(
			`[G-Sheets Background Job] Failed to export pre-analyzed calls for agent ${agentId}:`,
			error,
		);
		// We log the error but don't throw, as this is a background task.
	}
}

// The main API route handler for the "Setup" button
export async function POST(req, { params }) {
	const { user } = await getSession(await headers());
	const userId = user?.id;

	const agentId = parseInt(params.agentid, 10);

	if (!userId)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (isNaN(agentId))
		return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });

	try {
		const agent = await db.query.callAgents.findFirst({
			where: and(eq(callAgents.id, agentId), eq(callAgents.creatorId, userId)),
		});

		if (!agent)
			return NextResponse.json({ error: "Agent not found" }, { status: 404 });

		if (agent.integrationConfig?.googleSheets?.spreadsheetId) {
			console.log(`[G-Sheets Setup] Agent ${agentId} is already configured.`);
			return NextResponse.json(agent.integrationConfig.googleSheets);
		}

		const authClient = await getAuthenticatedClient(userId);
		const sheets = google.sheets({ version: "v4", auth: authClient });

		console.log(
			`[G-Sheets Setup] Creating new spreadsheet for agent: ${agent.name}`,
		);
		const spreadsheet = await sheets.spreadsheets.create({
			resource: { properties: { title: `Call Logs - ${agent.name}` } },
			fields: "spreadsheetId,spreadsheetUrl",
		});

		const newSheetData = {
			spreadsheetId: spreadsheet.data.spreadsheetId,
			spreadsheetUrl: spreadsheet.data.spreadsheetUrl,
		};

		await db
			.update(callAgents)
			.set({
				integrationConfig: {
					...agent.integrationConfig,
					googleSheets: newSheetData,
				},
				updatedAt: new Date(),
			})
			.where(eq(callAgents.id, agentId));

		console.log(
			`[G-Sheets Setup] Linked sheet ${newSheetData.spreadsheetId} for agent ${agentId}.`,
		);

		// "Fire and forget" the background job to export existing calls.
		exportExistingAnalyzedCalls(userId, agentId, newSheetData.spreadsheetId);

		return NextResponse.json(newSheetData, { status: 201 });
	} catch (error) {
		console.error(`[G-Sheets Setup] API Error for agent ${agentId}:`, error);
		if (error.message.includes("connection not found")) {
			return NextResponse.json(
				{ error: "Google connection not found." },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

