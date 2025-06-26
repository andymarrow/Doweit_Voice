// configs/firebaseAdmin.js
// Initialize Firebase Admin SDK for backend operations

import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage'; // Import getStorage from admin SDK

// Load credentials from environment variables
// These should match the keys in your service account JSON file
// Ensure these environment variables are set SECURELY on your hosting platform
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY; // Store the private key securely
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL; // Store the client email securely

// Firebase Private Key often contains escaped newlines (\\n).
// The Admin SDK credential method expects actual newlines (\n).
// Replace '\\n' with '\n' if needed.
const privateKeyFormatted = firebasePrivateKey?.replace(/\\n/g, '\n');

// Construct the service account credentials object
const serviceAccount = {
  projectId: firebaseProjectId,
  privateKey: privateKeyFormatted,
  clientEmail: firebaseClientEmail,
};

// Get the storage bucket name.
// It's often PROJECT_ID.appspot.com. You can use the public project ID here.
const storageBucket = `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`;

// Check if essential credentials are missing
if (!firebaseProjectId || !privateKeyFormatted || !firebaseClientEmail || !storageBucket) {
    console.error("Firebase Admin credentials or storage bucket env vars are not fully set. Admin SDK initialization may fail.");
    // List the missing keys for easier debugging
    if (!firebaseProjectId) console.error("Missing FIREBASE_PROJECT_ID");
    if (!firebasePrivateKey) console.error("Missing FIREBASE_PRIVATE_KEY");
    if (!firebaseClientEmail) console.error("Missing FIREBASE_CLIENT_EMAIL");
    if (!storageBucket) console.error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID or storageBucket derived from it");
}


// Initialize the Firebase Admin app only if it hasn't been initialized yet.
// This is important for development mode with hot-reloading.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount), // Authenticate with the service account
      storageBucket: storageBucket, // Specify the storage bucket for Admin Storage operations
      // Optional: specify databaseURL if you use Firestore/RTDB with the Admin SDK
      // databaseURL: `https://${firebaseProjectId}.firebaseio.com`,
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    // Handle the error appropriately in a production app (e.g., throw, log to monitoring)
  }
} else {
    console.log('Firebase Admin SDK already initialized (likely due to hot-reloading).');
}


// Export the initialized admin app instance
export default admin;