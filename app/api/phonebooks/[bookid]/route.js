export const dynamic = "force-dynamic";
// app/api/phonebooks/[bookid]/route.js
//
// GET    → fetch a single phone book (must be owned by caller).
// PATCH  → update name / description / entries.
// DELETE → remove the phone book.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database";
import { phoneBooks } from "@/lib/db/schemaCharacterAI";
import { and, eq } from "drizzle-orm";
import { resolvePhoneBookId } from "@/lib/utils/publicId";

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

async function loadOwned(bookid, userId) {
	const id = await resolvePhoneBookId(bookid);
	if (!id) return null;
	const book = await db.query.phoneBooks.findFirst({
		where: and(eq(phoneBooks.id, id), eq(phoneBooks.creatorId, userId)),
	});
	return book ?? null;
}

export async function GET(req, { params }) {
	const { user } = await getSession(await headers());
	const userId = user?.id;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const book = await loadOwned(params.bookid, userId);
	if (!book) {
		return NextResponse.json({ error: "Phone book not found" }, { status: 404 });
	}
	return NextResponse.json(book, { status: 200 });
}

export async function PATCH(req, { params }) {
	const { user } = await getSession(await headers());
	const userId = user?.id;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const existing = await loadOwned(params.bookid, userId);
	if (!existing) {
		return NextResponse.json({ error: "Phone book not found" }, { status: 404 });
	}

	try {
		const body = await req.json();
		const updates = {};
		if (typeof body?.name === "string") {
			const name = body.name.trim();
			if (!name) {
				return NextResponse.json({ error: "Phone book name cannot be empty" }, { status: 400 });
			}
			updates.name = name;
		}
		if (body?.description !== undefined) {
			updates.description =
				typeof body.description === "string" ? body.description.trim() : null;
		}
		if (body?.entries !== undefined) {
			updates.entries = normalizeEntries(body.entries);
		}

		if (Object.keys(updates).length === 0) {
			return NextResponse.json({ message: "No changes" }, { status: 200 });
		}

		const [updated] = await db
			.update(phoneBooks)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(phoneBooks.id, existing.id))
			.returning();

		return NextResponse.json(updated, { status: 200 });
	} catch (error) {
		if (error?.message?.includes("phone_book_creator_name_unq")) {
			return NextResponse.json(
				{ error: "You already have a phone book with that name." },
				{ status: 409 },
			);
		}
		console.error("[API /api/phonebooks/[bookid] PATCH]", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	const { user } = await getSession(await headers());
	const userId = user?.id;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const existing = await loadOwned(params.bookid, userId);
	if (!existing) {
		return NextResponse.json({ error: "Phone book not found" }, { status: 404 });
	}

	try {
		await db.delete(phoneBooks).where(eq(phoneBooks.id, existing.id));
		return NextResponse.json({ success: true, deletedId: existing.publicId }, { status: 200 });
	} catch (error) {
		console.error("[API /api/phonebooks/[bookid] DELETE]", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
