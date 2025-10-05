// lib/firebase/storage.js
import { ref, deleteObject } from "firebase/storage";
import { storage } from "@/configs/firebaseConfig";

/**
 * Deletes a file from Firebase Storage using its full download URL.
 * @param {string} fileUrl The full HTTPS URL of the file to delete.
 */
export const deleteFileFromFirebase = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        // Firebase Storage reference cannot be created from a URL directly.
        // We must create a reference from the path.
        const fileRef = ref(storage, fileUrl);

        // Delete the file
        await deleteObject(fileRef);
        console.log(`Successfully deleted file from Firebase Storage: ${fileUrl}`);
    } catch (error) {
        // It's common for this to fail if the file doesn't exist. We can safely ignore that error.
        if (error.code === 'storage/object-not-found') {
            console.warn(`File not found in Firebase Storage (might be already deleted): ${fileUrl}`);
        } else {
            console.error(`Error deleting file from Firebase Storage: ${fileUrl}`, error);
            throw error; // Re-throw other errors
        }
    }
};