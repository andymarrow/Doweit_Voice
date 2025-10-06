// app/api/integrations/connect/google/route.js
import { NextResponse } from "next/server";
import { getGoogleAuthClient, GOOGLE_AUTH_SCOPES } from "@/lib/google/googleAuth";

export async function GET(req) {
    try {
        const oauth2Client = getGoogleAuthClient();

        // Generate the URL for the consent screen.
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline', // IMPORTANT: This is required to get a refresh_token
            scope: GOOGLE_AUTH_SCOPES,
            prompt: 'consent', // Forces the consent screen to show, ensuring a refresh_token is issued
        });

        // Redirect the user to the Google consent screen.
        return NextResponse.redirect(authUrl);

    } catch (error) {
        console.error("[Google Connect API] Error generating auth URL:", error);
        // Redirect back to the integrations page with an error
        const redirectUrl = new URL('/callagents/Integrations', req.url);
        redirectUrl.searchParams.set('error', 'google_setup_failed');
        return NextResponse.redirect(redirectUrl);
    }
}