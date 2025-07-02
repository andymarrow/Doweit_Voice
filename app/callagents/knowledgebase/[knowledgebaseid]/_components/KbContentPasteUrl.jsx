// app/callagents/knowledgebase/[knowledgebaseid]/_components/KbContentPasteUrl.jsx
"use client";

import React, { useState } from 'react';
import { FiArrowLeft, FiLink, FiLoader } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../../_constants/uiConstants'; // Adjust path


// Receive handlers for back navigation and adding content, plus adding state
function KbContentPasteUrl({ onBack, onAddContent, isAdding }) { // *** isAdding prop ***

    const [urlInput, setUrlInput] = useState('');

     const handleAddClick = () => {
         if (urlInput.trim()) {
              console.log("Simulating fetching content from URL:", urlInput.trim());
             // Call parent handler with the URL string.
             // Parent will handle the actual fetching/processing API call and state updates.
              onAddContent({ type: 'url', value: urlInput.trim() }); // Pass the URL string
             // Do NOT reset local state or isAdding here. Parent handles success & state reset.
         } else {
             toast.error("Please enter a valid URL."); // Use toast
         }
     };

     // Determine if inputs/buttons are disabled
     const isFormDisabled = isAdding;
     const isButtonDisabled = isFormDisabled || !urlInput.trim();


    return (
        <div className="space-y-6">
            {/* URL Input */}
             <div>
                 <label htmlFor="kbUrlInput" className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>
                     Paste URL
                 </label>
                  <input
                       type="url" // Use type="url" for semantic correctness
                       id="kbUrlInput"
                       value={urlInput}
                       onChange={(e) => setUrlInput(e.target.value)}
                       disabled={isFormDisabled} // Disable input
                       className={`block w-full sm:max-w-md p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                       placeholder="e.g., https://yourwebsite.com/faq"
                   />
             </div>


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
                     {isAdding ? <FiLoader className="mr-2 w-4 h-4 animate-spin" /> : <FiLink className="mr-2 w-4 h-4" />}
                     Fetch and Add
                 </button>
             </div>

            {/* Optional: Placeholder for fetch/processing status */}
             {isAdding && <div className={`text-center ${uiColors.textSecondary} mt-4`}>Fetching content from URL...</div>}

        </div>
    );
}

export default KbContentPasteUrl;