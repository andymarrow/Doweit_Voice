import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
    const { user } = await getSession(await headers());
    
    // Ensure user is authenticated
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Key from Env
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    // Return key to frontend (securely, only for this auth'd session)
    return NextResponse.json({ apiKey }, { status: 200 });
}