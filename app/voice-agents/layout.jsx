// c:/Users/Samson/OneDrive/Desktop/doweitvoice/DoweitV3/app/voice-agents/layout.jsx

import React from 'react';
import Header from './_components/header';

// --- ADD THESE IMPORTS ---
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/configs/db';
import { users } from '@/lib/db/schemaCharacterAI';
import { eq } from 'drizzle-orm';

// --- CONVERT THE COMPONENT TO ASYNC ---
export default async function VoiceAgentsLayout({ children }) {
    
    // --- USER SYNC LOGIC ---
    // 1. Get the Clerk user ID from the session.
    const { userId } = auth();

    // 2. If a user is logged in, check if they exist in our database.
    if (userId) {
        try {
            const userInDb = await db.query.users.findFirst({
                where: eq(users.id, userId),
            });

            // 3. If the user is not in our database, create them.
            if (!userInDb) {
                console.log(`User ${userId} not found in DB. Creating new user...`);
                
                // Fetch the full user object from Clerk to get email, name, etc.
                const clerkUser = await currentUser();

                if (clerkUser) {
                    await db.insert(users).values({
                        id: clerkUser.id,
                        email: clerkUser.emailAddresses[0]?.email_address,
                        username: clerkUser.username,
                        profileImageUrl: clerkUser.imageUrl,
                    }).onConflictDoNothing(); // Safety check: if user was created in a race, do nothing.

                    console.log(`Successfully created user ${clerkUser.id} in the database.`);
                }
            }
        } catch (error) {
            console.error("Error during user sync:", error);
            // Decide how to handle this error. Maybe redirect to an error page.
        }
    }
    // --- END USER SYNC LOGIC ---

    return (
        <div>
            <Header />
            <div className="">
                {children}
            </div>
        </div>
    );
}