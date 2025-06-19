// lib/firebase/upload.js
import { storage } from '@/configs/firebaseConfig'; // Your Firebase client config
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage.
 * @param {File | Blob | Buffer} file - The file data to upload.
 * @param {string} userId - The Clerk user ID (for organizing storage).
 * @param {string} folderPath - The specific folder path within the user's area (e.g., 'character-avatars').
 * @returns {Promise<string|null>} The download URL of the uploaded file, or null on error.
 */
export async function uploadFileToFirebase(file, userId, folderPath = 'uploads') {
    if (!file) {
        console.error("No file provided for upload.");
        return null;
    }
    if (!userId) {
        console.error("No user ID provided for upload.");
        return null;
    }

    // Generate a unique file name (timestamp + original extension if possible)
    const fileExtension = file.name?.split('.').pop() || 'jpg'; // Default to jpg if no extension
    const fileName = `${Date.now()}.${fileExtension}`;
    // Define the full path in storage: userId/folderPath/fileName
    const fullPath = `${userId}/${folderPath}/${fileName}`;

    const storageRef = ref(storage, fullPath);

    try {
        // Use uploadBytes for standard Blobs/Files/Uint8Arrays
        // If handling streams directly, uploadBytesResumable or uploadString might be needed depending on API route parsing
        const snapshot = await uploadBytes(storageRef, file);
        console.log('Uploaded a blob or file!');

        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.log('File available at', downloadUrl);

        return downloadUrl;

    } catch (error) {
        console.error("Error uploading file to Firebase:", error);
        // Depending on error details, you might want to clean up partial uploads
        return null;
    }
}

// Example usage in an API route:
// import { uploadFileToFirebase } from '@/lib/firebase/upload';
// import { auth } from '@clerk/nextjs/server'; // Assuming Clerk auth middleware/helper

// async function POST(req) {
//     const { userId } = auth(); // Get user ID from Clerk

//     if (!userId) {
//         return new Response('Unauthorized', { status: 401 });
//     }

//     const formData = await req.formData();
//     const avatarFile = formData.get('avatar'); // Get the file named 'avatar' from frontend FormData

//     if (!avatarFile) {
//         return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
//     }

//     // avatarFile is typically a File object in Next.js 13+ API routes with formData()
//     const downloadUrl = await uploadFileToFirebase(avatarFile, userId, 'character-avatars');

//     if (!downloadUrl) {
//          return new Response(JSON.stringify({ error: 'Failed to upload image' }), { status: 500 });
//     }

//     return new Response(JSON.stringify({ url: downloadUrl }), { status: 200 });
// }