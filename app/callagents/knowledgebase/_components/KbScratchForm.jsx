// app/callagents/knowledgebase/_components/KbScratchForm.jsx
"use client";

import React, { useState } from 'react';
import { FiPlusCircle, FiLoader } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../_constants/uiConstants'; // Adjust path

// Receive handler to create the KB and the isCreating state
function KbScratchForm({ onCreateKb, isCreating }) { // *** isCreating prop ***

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    // No state for initial content for now

    // Handler for the form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!name.trim()) {
            toast.error("Knowledge Base name is required."); // Use toast
            return;
        }
         // Check if already creating (should be disabled by the prop, but extra check)
         if (isCreating) return;

        // Call the parent handler with the form data
        onCreateKb({
            name: name.trim(),
            description: description.trim(),
            content: [], // Start with empty content for scratch
            isPublic: false, // Default to private when creating from scratch
        });
        // Parent will handle the async creation and modal closing/navigation
        // Do NOT reset form state here, let parent handle success and modal close
    };

    // Determine if form fields/button should be disabled
    const isFormDisabled = isCreating;
    const isButtonDisabled = isFormDisabled || !name.trim();


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
                <label htmlFor="kbName" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                    Knowledge Base Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="kbName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                     disabled={isFormDisabled} // Disable input
                    className={`block w-full sm:max-w-md p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="e.g., Product FAQs"
                    required // HTML5 validation
                />
            </div>

            {/* Description Textarea */}
            <div>
                <label htmlFor="kbDescription" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                    Description
                </label>
                <textarea
                    id="kbDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                     disabled={isFormDisabled} // Disable textarea
                    className={`block w-full sm:max-w-md h-24 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Briefly describe the purpose of this knowledge base."
                ></textarea>
            </div>

            {/* Create Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                     disabled={isButtonDisabled} // Use disabled state
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                     {isCreating ? <FiLoader className="mr-2 w-4 h-4 animate-spin" /> : <FiPlusCircle className="mr-2 w-4 h-4" />}
                     Create Knowledge Base
                </button>
            </div>
        </form>
    );
}

export default KbScratchForm;