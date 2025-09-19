// lib/google/googleAuth.js
import { google } from 'googleapis';
import { db } from '@/configs/db';
import { userConnections } from '@/lib/db/schemaCharacterAI';
import { decrypt } from '@/lib/utils/crypto'; // Make sure you have a decrypt function
import { eq } from 'drizzle-orm';

// This function remains the same
export function getGoogleAuthClient() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
        throw new Error("Google API credentials are not configured in environment variables.");
    }

    return new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );
}

// These are the "scopes" or permissions we are asking the user for.
export const GOOGLE_AUTH_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email', // To get their email address
    'https://www.googleapis.com/auth/userinfo.profile', // To get their basic profile info
    'https://www.googleapis.com/auth/drive.file', // Create and manage files created by our app
    'https://www.googleapis.com/auth/spreadsheets' // Read and write to their spreadsheets
];

// --- ADD THIS NEW HELPER FUNCTION ---
// This function gets an authenticated client for a user who has already granted permission.
export async function getAuthenticatedClient(userId) {
    if (!userId) {
        throw new Error("User ID is required to get authenticated client.");
    }

    // 1. Find the user's Google connection
    const connection = await db.query.userConnections.findFirst({
        where: eq(userConnections.userId, userId)
    });

    if (!connection) {
        throw new Error("Google connection not found for this user.");
    }

    // 2. Decrypt the stored refresh token
    const refreshToken = decrypt(connection.encryptedAccessToken);

    // 3. Create a new client and set the credentials
    const oauth2Client = getGoogleAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    return oauth2Client;
}