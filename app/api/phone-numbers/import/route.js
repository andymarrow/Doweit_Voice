export const dynamic = "force-dynamic";
export const maxDuration = 60;
// app/api/phone-numbers/import/route.js
//
// POST { provider: 'twilio' | 'vapi', e164?: string }
//
// 'twilio' with an `e164`: imports that single Twilio number into Vapi (BYO),
//   and saves a row to phone_numbers. This is the path the user takes after
//   connecting Twilio and clicking "Import" on a row in our UI.
//
// 'twilio' without `e164`: returns the live list from Twilio so the UI can
//   display "available to import" rows (does NOT mutate anything).
//
// 'vapi': imports the list of Vapi-hosted phone numbers (call this after
//   buying a number directly on vapi.ai) and upserts our local rows.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { phoneNumbers } from "@/lib/db/schemaCharacterAI";
import { eq, and } from "drizzle-orm";
import { getConnection } from "@/lib/integrations/connections";
import { listIncomingNumbers } from "@/lib/integrations/adapters/twilio";
import {
    listVapiNumbers,
    importTwilioNumber,
    getVapiNumber,
} from "@/lib/integrations/adapters/vapiNumbers";

export async function POST(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const provider = body?.provider;

    if (provider === "twilio") {
        return importFromTwilio(userId, body);
    }
    if (provider === "vapi") {
        return importFromVapi(userId);
    }
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
}

async function importFromTwilio(userId, { e164 }) {
    const conn = await getConnection(userId, "twilio");
    if (!conn?.accountSid) {
        return NextResponse.json(
            { error: "Connect Twilio on the workspace Integrations page first." },
            { status: 400 },
        );
    }

    // Mode 1: just list (no e164) — for the picker UI.
    if (!e164) {
        try {
            const upstream = await listIncomingNumbers(conn);
            // Mark which ones we already have locally.
            const existing = await db.query.phoneNumbers.findMany({
                where: and(
                    eq(phoneNumbers.userId, userId),
                    eq(phoneNumbers.provider, "twilio"),
                ),
            });
            const existingByE164 = new Set(existing.map((p) => p.e164));
            return NextResponse.json({
                available: upstream.map((n) => ({
                    e164: n.phoneNumber,
                    friendlyName: n.friendlyName,
                    twilioSid: n.sid,
                    capabilities: n.capabilities,
                    alreadyImported: existingByE164.has(n.phoneNumber),
                })),
            });
        } catch (e) {
            return NextResponse.json(
                { error: e?.message || "Failed to list Twilio numbers" },
                { status: 500 },
            );
        }
    }

    // Mode 2: import a specific number — register with Vapi (BYO), persist locally.
    let vapiRecord;
    try {
        vapiRecord = await importTwilioNumber({
            twilioAccountSid: conn.accountSid,
            twilioAuthToken: conn.authToken,
            phoneNumber: e164,
            name: `Twilio ${e164}`,
        });
    } catch (e) {
        // Vapi 400 "Has Identical" means the number is already registered there
        // (e.g. our local DB was wiped but Vapi still has the record). Extract the
        // existing Vapi ID from the error message and re-sync it locally.
        const existingIdMatch = e?.detail?.message?.match(
            /Existing Phone Number ([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\s+Has Identical/i,
        );
        if (e?.status === 400 && existingIdMatch) {
            try {
                vapiRecord = await getVapiNumber(existingIdMatch[1]);
            } catch (fetchErr) {
                console.error("[PHONE NUMBERS IMPORT TWILIO] re-sync fetch failed", fetchErr);
                return NextResponse.json(
                    { error: "Number already exists in Vapi but could not be fetched for re-sync." },
                    { status: 500 },
                );
            }
        } else {
            console.error("[PHONE NUMBERS IMPORT TWILIO]", e);
            return NextResponse.json(
                { error: e?.message || "Failed to import Twilio number into Vapi" },
                { status: 500 },
            );
        }
    }

    try {
        const [row] = await db
            .insert(phoneNumbers)
            .values({
                userId,
                provider: "twilio",
                e164,
                friendlyName: vapiRecord.name || e164,
                capabilities: { voice: true, sms: true },
                providerIds: { vapiNumberId: vapiRecord.id },
            })
            .onConflictDoUpdate({
                target: [phoneNumbers.userId, phoneNumbers.e164],
                set: {
                    providerIds: { vapiNumberId: vapiRecord.id },
                    updatedAt: new Date(),
                },
            })
            .returning();

        return NextResponse.json({ phoneNumber: row });
    } catch (e) {
        console.error("[PHONE NUMBERS IMPORT TWILIO] db upsert failed", e);
        return NextResponse.json(
            { error: e?.message || "Failed to save phone number" },
            { status: 500 },
        );
    }
}

async function importFromVapi(userId) {
    try {
        const upstream = await listVapiNumbers();
        // Filter to numbers owned by this user. Vapi uses an account-level
        // secret key, so this returns the whole workspace's numbers — we
        // accept that on the assumption one Doweit user == one Vapi account.
        // Persist (or upsert) each as provider='vapi'.
        const inserted = [];
        for (const n of upstream) {
            if (!n?.number) continue;
            const [row] = await db
                .insert(phoneNumbers)
                .values({
                    userId,
                    provider: n.provider === "twilio" ? "twilio" : "vapi",
                    e164: n.number,
                    friendlyName: n.name || n.number,
                    capabilities: { voice: true, sms: false },
                    providerIds: { vapiNumberId: n.id },
                })
                .onConflictDoUpdate({
                    target: [phoneNumbers.userId, phoneNumbers.e164],
                    set: {
                        providerIds: { vapiNumberId: n.id },
                        friendlyName: n.name || n.number,
                        updatedAt: new Date(),
                    },
                })
                .returning();
            inserted.push(row);
        }
        return NextResponse.json({ numbers: inserted });
    } catch (e) {
        console.error("[PHONE NUMBERS IMPORT VAPI]", e);
        return NextResponse.json(
            { error: e?.message || "Failed to import Vapi numbers" },
            { status: 500 },
        );
    }
}
