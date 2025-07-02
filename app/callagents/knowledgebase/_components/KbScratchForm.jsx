// app/callagents/knowledgebase/_components/KbScratchForm.jsx
"use client";

import React, { useState } from 'react';
import { FiPlusCircle, FiLoader } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../_constants/uiColors'; // Adjust path

// Receive handler to create the KB
function KbScratchForm({ onCreateKb }) { // Receive the creation handler from the modal/page

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    // You might add state for initial content here if desired

    // Handler for the form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!name.trim()) {
            alert("Knowledge Base name is required."); // Or use toast
            return;
        }
        // Call the parent handler with the form data
        onCreateKb({
            name: name.trim(),
            description: description.trim(),
            content: [], // Start with empty content for scratch
            isPublic: false, // Default to private when creating from scratch
            // Include any other necessary fields
        });
        // Parent will handle the async creation and modal closing
    };


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
                    className={`block w-full sm:max-w-md p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
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
                    className={`block w-full sm:max-w-md h-24 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y`}
                    placeholder="Briefly describe the purpose of this knowledge base."
                ></textarea>
            </div>

            {/* Optional: Initial Content Input */}
            {/* You could add a text area here for initial content if starting from scratch might involve pasting text */}
             {/* <div>
                 <label htmlFor="kbInitialContent" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Initial Content (Optional)
                 </label>
                 <textarea
                     id="kbInitialContent"
                     // Add state and onChange
                     className={`block w-full sm:max-w-md h-32 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y`}
                     placeholder="Paste initial text or links here."
                 ></textarea>
             </div> */}


            {/* Create Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                     // Disable button while creation is in progress (state managed by parent modal)
                     // Use isCreating prop passed from modal/page if available
                     // disabled={isCreating} // Assuming isCreating is passed down
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                     {/* {isCreating ? <FiLoader className="mr-2 animate-spin" /> : <FiPlusCircle className="mr-2 w-4 h-4" />} */} {/* Use isCreating prop */}
                     <FiPlusCircle className="mr-2 w-4 h-4" /> Create Knowledge Base
                </button>
            </div>
        </form>
    );
}

export default KbScratchForm;