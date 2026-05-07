// lib/integrations/connections.js
// Centralised helper for reading/writing third-party credentials.
//
// All credentials are stored in `userConnections` keyed by (userId, provider).
// The `encryptedAccessToken` column holds *whatever* the provider needs to
// authenticate — for OAuth providers it's a token, for API-key providers it's
// the key itself, and for providers that need multiple values (SMTP, Slack
// OAuth response with team data) we JSON.stringify a small object before
// encrypting. That keeps the schema simple at the cost of one JSON parse.

import { db } from "@/lib/database";
import { userConnections } from "@/lib/db/schemaCharacterAI";
import { encrypt, decrypt } from "@/lib/utils/crypto";
import { eq, and } from "drizzle-orm";

export async function saveConnection(userId, provider, secret) {
    const payload = typeof secret === "string" ? secret : JSON.stringify(secret);
    const encrypted = encrypt(payload);

    await db
        .insert(userConnections)
        .values({
            userId,
            provider,
            encryptedAccessToken: encrypted,
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [userConnections.userId, userConnections.provider],
            set: {
                encryptedAccessToken: encrypted,
                updatedAt: new Date(),
            },
        });
}

export async function getConnection(userId, provider) {
    const row = await db.query.userConnections.findFirst({
        where: and(
            eq(userConnections.userId, userId),
            eq(userConnections.provider, provider),
        ),
    });
    if (!row) return null;
    const plain = decrypt(row.encryptedAccessToken);
    // Try parsing as JSON first (multi-value providers); fall back to raw string.
    try {
        return JSON.parse(plain);
    } catch {
        return plain;
    }
}

export async function deleteConnection(userId, provider) {
    await db
        .delete(userConnections)
        .where(
            and(
                eq(userConnections.userId, userId),
                eq(userConnections.provider, provider),
            ),
        );
}
