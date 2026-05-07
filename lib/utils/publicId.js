// lib/utils/publicId.js
//
// Utilities for the publicId migration. The four user-facing entities
// (callAgents, knowledgeBases, sdkApps, characters) each gained a
// `publicId` UUID column. URLs and internal links use that publicId; the
// numeric `id` stays as the primary key + foreign-key target everywhere
// internal.
//
// These helpers accept either form (numeric "1" or a real UUID) and load
// the row, so old bookmarks like /callagents/22 keep working through a
// server-side redirect at the page entry points. New traffic uses the
// UUID exclusively.

import { db } from "@/lib/database";
import {
    callAgents,
    knowledgeBases,
    sdkApps,
    characters,
    phoneBooks,
} from "@/lib/db/schemaCharacterAI";
import { eq } from "drizzle-orm";

// True when the given value is a string of digits — i.e. the legacy
// integer ID form. UUIDs always contain hyphens, so this discriminates
// cleanly between the two.
export function isNumericId(value) {
    return typeof value === "string" && /^\d+$/.test(value);
}

// Looks like a UUID (loose check — exact validation isn't worth it here).
export function isUuid(value) {
    return (
        typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    );
}

// Generic builder. Given the table + its publicId column + its id column,
// returns a function that resolves either form to a single row.
function makeFinder(table, publicIdCol, idCol, opts = {}) {
    return async function find(idOrPublicId, queryOpts = {}) {
        if (idOrPublicId === undefined || idOrPublicId === null) return null;
        const raw = String(idOrPublicId);
        const where = isNumericId(raw)
            ? eq(idCol, parseInt(raw, 10))
            : eq(publicIdCol, raw);
        return db.query[opts.queryName].findFirst({ ...queryOpts, where });
    };
}

// Lightweight resolver: returns just the integer id for a publicId/legacy
// param. Used by API routes that need the int to query foreign-key tables
// (agent_actions, calls, phone_numbers, etc.) without fetching the whole
// row. Returns null if the row doesn't exist.
function makeIdResolver(publicIdCol, idCol, queryName) {
    return async function resolveId(idOrPublicId) {
        if (idOrPublicId === undefined || idOrPublicId === null) return null;
        const raw = String(idOrPublicId);
        if (isNumericId(raw)) return parseInt(raw, 10);
        const row = await db.query[queryName].findFirst({
            where: eq(publicIdCol, raw),
            columns: { id: true },
        });
        return row?.id ?? null;
    };
}

export const resolveCallAgentId = makeIdResolver(
    callAgents.publicId,
    callAgents.id,
    "callAgents",
);
export const resolveKnowledgeBaseId = makeIdResolver(
    knowledgeBases.publicId,
    knowledgeBases.id,
    "knowledgeBases",
);
export const resolveSdkAppId = makeIdResolver(
    sdkApps.publicId,
    sdkApps.id,
    "sdkApps",
);
export const resolveCharacterId = makeIdResolver(
    characters.publicId,
    characters.id,
    "characters",
);
export const resolvePhoneBookId = makeIdResolver(
    phoneBooks.publicId,
    phoneBooks.id,
    "phoneBooks",
);

export const findCallAgent = makeFinder(
    callAgents,
    callAgents.publicId,
    callAgents.id,
    { queryName: "callAgents" },
);

export const findKnowledgeBase = makeFinder(
    knowledgeBases,
    knowledgeBases.publicId,
    knowledgeBases.id,
    { queryName: "knowledgeBases" },
);

export const findSdkApp = makeFinder(
    sdkApps,
    sdkApps.publicId,
    sdkApps.id,
    { queryName: "sdkApps" },
);

export const findCharacter = makeFinder(
    characters,
    characters.publicId,
    characters.id,
    { queryName: "characters" },
);

// Redirect helper for Server Components / layouts. If `raw` looks like a
// legacy integer id, this rewrites the current request path to use the
// publicId in the segment that contained the integer, then issues a
// server-side redirect. The current path comes from the Next.js-internal
// `x-invoke-path` header, with `next-url`/explicit fallback prefix as
// safety nets so we always have something to rewrite.
//
// Usage:
//   await maybeRedirectLegacyId({ raw, publicId, prefix: "/callagents" });
export async function maybeRedirectLegacyId({ raw, publicId, prefix, headersList }) {
    if (!isNumericId(String(raw))) return;
    const h = headersList || (await (await import("next/headers")).headers());
    const fullPath =
        h.get("x-invoke-path") ||
        h.get("next-url") ||
        `${prefix}/${raw}`;
    const newPath = fullPath.replace(`${prefix}/${raw}`, `${prefix}/${publicId}`);
    const { redirect } = await import("next/navigation");
    redirect(newPath);
}

