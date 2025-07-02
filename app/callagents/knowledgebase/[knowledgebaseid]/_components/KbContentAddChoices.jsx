// app/callagents/knowledgebase/[knowledgebaseid]/_components/KbContentAddChoices.jsx
"use client";

import React from 'react';
import { FiUpload, FiLink, FiEdit3 } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../../_constants/uiConstants'; // Adjust path


// Content method keys (must match keys used in the parent page component)
const CONTENT_METHODS = {
    MANUAL: 'manual',
    UPLOAD: 'upload',
    PASTE_URL: 'paste-url',
};

// Receive handler to select a method and isAdding state
function KbContentAddChoices({ onSelectMethod, isAdding }) { // *** isAdding prop ***

    // Determine if buttons are disabled
    const areButtonsDisabled = isAdding;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4">
            {/* Choice Card: Manual Input */}
            <button
                onClick={() => onSelectMethod(CONTENT_METHODS.MANUAL)} // Call handler with method key
                 disabled={areButtonsDisabled} // Disable button
                 className={`flex flex-col items-center justify-center p-6 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.hoverBgSubtle} transition-colors space-y-3 text-center disabled:opacity-50 disabled:cursor-not-allowed`}
             >
                 <FiEdit3 className={`w-8 h-8 ${uiColors.textAccent}`} />
                 <span className={`font-semibold ${uiColors.textPrimary}`}>Manual Input</span>
                 <p className={`text-sm ${uiColors.textSecondary}`}>Type or paste text directly.</p>
            </button>

            {/* Choice Card: Upload File */}
            <button
                onClick={() => onSelectMethod(CONTENT_METHODS.UPLOAD)} // Call handler with method key
                 disabled={areButtonsDisabled} // Disable button
                 className={`flex flex-col items-center justify-center p-6 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.hoverBgSubtle} transition-colors space-y-3 text-center disabled:opacity-50 disabled:cursor-not-allowed`}
             >
                 <FiUpload className={`w-8 h-8 ${uiColors.textAccent}`} />
                 <span className={`font-semibold ${uiColors.textPrimary}`}>Upload from PC</span>
                 <p className={`text-sm ${uiColors.textSecondary}`}>Upload documents or files.</p>
            </button>

            {/* Choice Card: Paste URL */}
            <button
                onClick={() => onSelectMethod(CONTENT_METHODS.PASTE_URL)} // Call handler with method key
                 disabled={areButtonsDisabled} // Disable button
                 className={`flex flex-col items-center justify-center p-6 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.hoverBgSubtle} transition-colors space-y-3 text-center disabled:opacity-50 disabled:cursor-not-allowed`}
             >
                 <FiLink className={`w-8 h-8 ${uiColors.textAccent}`} />
                 <span className={`font-semibold ${uiColors.textPrimary}`}>Paste a URL</span>
                 <p className={`text-sm ${uiColors.textSecondary}`}>Fetch content from a web page.</p>
            </button>
        </div>
    );
}

export default KbContentAddChoices;