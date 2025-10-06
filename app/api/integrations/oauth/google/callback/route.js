// app/api/integrations/oauth/google/callback/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { getGoogleAuthClient } from "@/lib/google/googleAuth";
import { db } from "@/lib/database";
import { userConnections } from "@/lib/db/schemaCharacterAI";
import { encrypt } from "@/lib/utils/crypto"; // You need an encrypt function
import { eq, and } from "drizzle-orm";

export async function GET(req) {
    const { user } = await getSession(await headers());
    const userId = user?.id;
    const redirectUrl = new URL('/callagents/Integrations', req.nextUrl.origin);

    if (!userId) {
        redirectUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(redirectUrl);
    }

    const code = req.nextUrl.searchParams.get('code');

    if (!code) {
        redirectUrl.searchParams.set('error', 'google_auth_failed');
        return NextResponse.redirect(redirectUrl);
    }

    try {
        const oauth2Client = getGoogleAuthClient();
        const { tokens } = await oauth2Client.getToken(code);
        
        const refreshToken = tokens.refresh_token;

        if (!refreshToken) {
            // This can happen if the user has already granted consent and 'prompt: consent' is not used.
            console.warn(`[Google Callback] No refresh token received for user ${userId}. This may be okay if they are re-authorizing.`);
            // You can still proceed if an access token is there, but saving is best.
            // For now, we will treat it as a success and assume the old token is still valid.
            redirectUrl.searchParams.set('status', 'success');
            return NextResponse.redirect(redirectUrl);
        }

        // Encrypt the refresh token before storing it in the database.
        const encryptedRefreshToken = encrypt(refreshToken);

        // Perform an "UPSERT" (update or insert) into the database.
        await db.insert(userConnections)
            .values({
                userId: userId,
                provider: 'google',
                encryptedAccessToken: encryptedRefreshToken, // Storing refresh token here
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [userConnections.userId, userConnections.provider],
                set: {
                    encryptedAccessToken: encryptedRefreshToken,
                    updatedAt: new Date(),
                }
            });

        console.log(`[Google Callback] Successfully stored Google refresh token for user ${userId}.`);

        redirectUrl.searchParams.set('status', 'success');
        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error("[Google Callback API] Error exchanging code for tokens:", error);
        redirectUrl.searchParams.set('error', 'google_token_exchange_failed');
        return NextResponse.redirect(redirectUrl);
    }
}