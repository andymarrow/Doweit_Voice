// app/api/vapi-webhook/route.js
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { calls } from "@/lib/db/schemaCharacterAI";
import { eq } from "drizzle-orm";

// This is the endpoint Vapi will call when a recording is ready.
export async function POST(req) {
	try {
		const body = await req.json();

		// Log the entire incoming webhook payload for debugging
		console.log("[VAPI WEBHOOK] Received webhook:", JSON.stringify(body, null, 2));

		// Check for the specific message type for a ready recording
		if (body.message?.type === "call-ended-webhook") {
			const callData = body.message.call;

			// Vapi will send the full call object, including the recordingUrl
			const vapiCallId = callData?.id;
			const recordingUrl = callData?.recordingUrl;

			if (!vapiCallId) {
				console.warn("[VAPI WEBHOOK] Webhook received without a Vapi call ID.");
				// Return 200 OK so Vapi doesn't retry
				return NextResponse.json({ received: true, status: "No Call ID" });
			}

			if (!recordingUrl) {
				console.log(
					`[VAPI WEBHOOK] Call ${vapiCallId} ended, but no recordingUrl was provided.`,
				);
				return NextResponse.json({
					received: true,
					status: "No recording URL",
				});
			}

			console.log(
				`[VAPI WEBHOOK] Processing recording for Vapi Call ID: ${vapiCallId}`,
			);

			// Now, find the call in our database. We stored the vapiCallId in the rawCallData field.
			// Drizzle's ->> operator is used to query inside a JSONB field.
			const result = await db
				.update(calls)
				.set({
					recordingUrl: recordingUrl,
				})
				.where(eq(calls.rawCallData.path("vapiCallId"), vapiCallId))
				.returning({ id: calls.id });

			if (result.length > 0) {
				console.log(
					`[VAPI WEBHOOK] Successfully updated call ${result[0].id} with recording URL.`,
				);
			} else {
				console.warn(
					`[VAPI WEBHOOK] Could not find a matching call in DB for Vapi Call ID: ${vapiCallId}`,
				);
			}
		}

		// Always return a 200 OK to Vapi to acknowledge receipt of the webhook
		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("[VAPI WEBHOOK] Error processing webhook:", error);
		// Return a server error, but Vapi might retry
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}