// app/callagents/knowledgebase/[knowledgebaseid]/_components/KbContentManualInput.jsx
"use client";

import React, { useState } from 'react';
import { FiArrowLeft, FiSave, FiLoader } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../../_constants/uiConstants'; // Adjust path


// Receive handlers for back navigation and adding content, plus adding state
function KbContentManualInput({ onBack, onAddContent, isAdding }) { // *** isAdding prop ***

    const [manualTextInput, setManualTextInput] = useState('');

    const handleAddClick = () => {
        if (manualTextInput.trim()) {
             // Call parent handler with the text, parent handles isAdding state and API call
            onAddContent(manualTextInput.trim());
            // Do NOT reset local state or isAdding here. Parent handles success & state reset.
        } else {
            toast.error("Please enter some text content."); // Use toast
        }
    };

     // Determine if inputs/buttons are disabled
     const isFormDisabled = isAdding;
     const isButtonDisabled = isFormDisabled || !manualTextInput.trim();


    return (
        <div className="space-y-6">
            {/* Text Area for Manual Input */}
            <div>
                 <label htmlFor="manualKbInput" className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>
                     Paste or Type Text
                 </label>
                <textarea
                    id="manualKbInput"
                    value={manualTextInput}
                    onChange={(e) => setManualTextInput(e.target.value)}
                    disabled={isFormDisabled} // Disable input
                     className={`block w-full h-64 p-3 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Enter your knowledge base content here..."
                ></textarea>
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
                     {isAdding ? <FiLoader className="mr-2 w-4 h-4 animate-spin" /> : <FiSave className="mr-2 w-4 h-4" />}
                     Add Content
                 </button>
             </div>

        </div>
    );
}

export default KbContentManualInput;