export const dynamic = "force-dynamic";
// app/api/phonebooks/route.js
//
// GET  → list phone books owned by the authenticated user.
// POST → create a phone book with optional entries.
//
// Phone books are simple: a name + a JSONB array of
// { number, condition } pairs that the agent uses to decide
// when to transfer a live call.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { phoneBooks } from "@/lib/db/schemaCharacterAI";
import { eq, desc } from "drizzle-orm";

function normalizeEntries(rawEntries) {
	if (!Array.isArray(rawEntries)) return [];
	return rawEntries
		.map((e) => {
			const number = typeof e?.number === "string" ? e.number.trim() : "";
			const condition = typeof e?.condition === "string" ? e.condition.trim() : "";
			if (!number) return null;
			return {
				id: e?.id || `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				number,
				condition,
			};
		})
		.filter(Boolean);
}

export async function GET() {
	const { user } = await getSession(await headers());
	const userId = user?.id;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const books = await db.query.phoneBooks.findMany({
			where: eq(phoneBooks.creatorId, userId),
			orderBy: [desc(phoneBooks.updatedAt)],
		});
		return NextResponse.json(books, { status: 200 });
	} catch (error) {
		console.error("[API /api/phonebooks GET]", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function POST(req) {
	const { user } = await getSession(await headers());
	const userId = user?.id;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const name = typeof body?.name === "string" ? body.name.trim() : "";
		if (!name) {
			return NextResponse.json({ error: "Phone book name is required" }, { status: 400 });
		}
		const description = typeof body?.description === "string" ? body.description.trim() : null;
		const entries = normalizeEntries(body?.entries);

		const [created] = await db
			.insert(phoneBooks)
			.values({ creatorId: userId, name, description, entries })
			.returning();

		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		if (error?.message?.includes("phone_book_creator_name_unq")) {
			return NextResponse.json(
				{ error: "You already have a phone book with that name." },
				{ status: 409 },
			);
		}
		console.error("[API /api/phonebooks POST]", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
