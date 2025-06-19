// app/api/upload-avatar/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadFileToFirebase } from '@/lib/firebase/upload'; // Your upload utility

// Ensure the route handler doesn't use body-parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
    const { userId } = auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Use req.formData() to parse the incoming FormData
        const formData = await req.formData();
        const avatarFile = formData.get('avatar'); // Get the file with name 'avatar'

        if (!avatarFile || typeof avatarFile === 'string') {
             // Check if avatarFile exists and is not just a string (e.g., 'null' from frontend)
             return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
        }

        // Call the Firebase upload utility
        // avatarFile is a File object which is compatible with Blob/File expected by uploadBytes
        const downloadUrl = await uploadFileToFirebase(avatarFile, userId, 'character-avatars');

        if (!downloadUrl) {
             // uploadFileToFirebase logs its own error
             return NextResponse.json({ error: 'Failed to upload image to storage' }, { status: 500 });
        }

        // Return the public URL
        return NextResponse.json({ url: downloadUrl }, { status: 200 });

    } catch (error) {
        console.error("API Error /api/upload-avatar:", error);
        return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
    }
}