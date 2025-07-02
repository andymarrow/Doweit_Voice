// app/callagents/knowledgebase/[knowledgebaseid]/_components/KbContentUploadFile.jsx
"use client";

import React, { useState } from 'react';
import { FiArrowLeft, FiUpload, FiLoader, FiAlertTriangle } from 'react-icons/fi'; // Icons
import { toast } from 'react-hot-toast'; // Assuming toast

// Import constants
import { uiColors } from '../../../_constants/uiConstants'; // Adjust path


// Receive handlers for back navigation and adding content, plus adding state
function KbContentUploadFile({ onBack, onAddContent, isAdding }) {

    // State for the selected file object
    const [selectedFile, setSelectedFile] = useState(null);
    // State for the content read from the file
    const [fileContent, setFileContent] = useState('');
    // State for the file reading process
    const [isReadingFile, setIsReadingFile] = useState(false);
    // State for file specific error (e.g., wrong type, read error)
    const [fileError, setFileError] = useState(null);


    // Handler for file input change
    const handleFileChange = (e) => {
        const file = e.target.files ? e.target.files[0] : null;

        // Clear previous states and errors
        setSelectedFile(null);
        setFileContent('');
        setFileError(null);
        setIsReadingFile(false);

        if (!file) return; // No file selected

        // *** File Type Validation ***
        // Check if the file name ends with .txt (basic check)
        if (!file.name.toLowerCase().endsWith('.txt')) {
            setFileError('Please select a .txt file.');
            toast.error('Only .txt files are allowed.');
            return;
        }

        // *** Read File Content ***
        setSelectedFile(file); // Store the file object
        setIsReadingFile(true); // Indicate reading is starting

        const reader = new FileReader();

        reader.onload = (event) => {
            // Content is read successfully
            setFileContent(event.target.result);
            setIsReadingFile(false);
             console.log(`[KbContentUploadFile] Successfully read ${file.name}`);
        };

        reader.onerror = (event) => {
            // Handle read error
            console.error("[KbContentUploadFile] Error reading file:", event.target?.error);
            setFileError(`Error reading file: ${event.target?.error?.message || 'Unknown error'}`);
            toast.error(`Error reading file: ${event.target?.error?.message || 'Unknown error'}`);
            setIsReadingFile(false);
            setFileContent(''); // Clear content on error
            setSelectedFile(null); // Clear file on error
        };

        // Read the file as text
        reader.readAsText(file);
    };

     // Handler for the "Upload File" (Add Content) button
     const handleAddClick = () => {
         // Check if we have a selected file, content read, and not currently adding/reading
         if (!selectedFile || !fileContent || isAdding || isReadingFile) {
              // Button should be disabled by isButtonDisabled, but this is a safeguard
              console.warn("[KbContentUploadFile] Add button clicked while invalid state.");
             return;
         }

         console.log(`[KbContentUploadFile] Preparing to add content from ${selectedFile.name}`);

         // *** Call parent handler with the read text content and file metadata ***
         // The parent's handleAddContent will structure this data for the KB content array
          onAddContent({
              type: 'file-upload-text', // Indicate source and type
              value: fileContent, // Pass the actual text content
              metadata: {
                  filename: selectedFile.name,
                  size: selectedFile.size,
                   // Add other file details if needed
              }
              // The parent will add id, addedAt, status (e.g., processing)
          });

         // Parent will handle the async API call (isAdding state), state updates, and back navigation.
         // Do NOT reset local state here immediately. Let parent handle success and state reset.
     };

     // Determine if inputs/buttons are disabled
     const isFormDisabled = isAdding || isReadingFile;
     // Button is disabled if adding, reading, no file selected, or file reading failed
     const isButtonDisabled = isAdding || isReadingFile || !selectedFile || fileError !== null;


    return (
        <div className="space-y-6">
            {/* File Input */}
             <div>
                 <label htmlFor="kbFileInput" className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>
                     Select .txt File
                 </label>
                  <input
                       type="file"
                       id="kbFileInput"
                       onChange={handleFileChange}
                       disabled={isFormDisabled} // Disable input
                       accept=".txt" // Suggest only .txt files in file picker
                       className={`block w-full text-sm ${uiColors.fileInput} disabled:opacity-50 disabled:cursor-not-allowed`}
                   />
                  {selectedFile && !isReadingFile && !fileError && (
                       <p className={`mt-2 text-sm ${uiColors.textSecondary}`}>Selected file: <span className="font-medium">{selectedFile.name}</span> ({selectedFile.size} bytes)</p>
                  )}
                  {isReadingFile && (
                       <p className={`mt-2 text-sm ${uiColors.textSecondary} flex items-center`}>
                            <FiLoader className="animate-spin mr-2" /> Reading file content...
                       </p>
                  )}
                  {fileError && (
                       <p className={`mt-2 text-sm ${uiColors.textDanger} flex items-center`}>
                            <FiAlertTriangle className="mr-2" /> {fileError}
                       </p>
                  )}
             </div>

            {/* Preview Area (Optional) */}
            {fileContent && !isReadingFile && !fileError && (
                <div>
                    <label className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>
                        File Content Preview
                    </label>
                     <div className={`p-3 text-sm rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary} max-h-40 overflow-y-auto whitespace-pre-wrap ${uiColors.textPrimary}`}>
                         {/* Show a truncated preview */}
                         {fileContent.length > 500 ? fileContent.substring(0, 500) + '\n...' : fileContent}
                     </div>
                </div>
            )}


            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
                 {/* Back Button */}
                <button
                    type="button"
                    onClick={onBack} // Call parent handler to go back
                     disabled={isFormDisabled} // Disable button
                     className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                     <FiArrowLeft className="mr-2 w-4 h-4" /> Back
                 </button>
                 {/* Add Content Button */}
                 <button
                     type="button"
                     onClick={handleAddClick} // Call handler to add content
                      disabled={isButtonDisabled} // Use disabled state
                     className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                 >
                     {isAdding || isReadingFile ? <FiLoader className="mr-2 w-4 h-4 animate-spin" /> : <FiUpload className="mr-2 w-4 h-4" />}
                     {isReadingFile ? 'Reading...' : (isAdding ? 'Adding...' : 'Upload & Add')}
                 </button>
             </div>

        </div>
    );
}

export default KbContentUploadFile;