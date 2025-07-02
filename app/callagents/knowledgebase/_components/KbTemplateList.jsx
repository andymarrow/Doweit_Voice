// app/callagents/knowledgebase/_components/KbTemplateList.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiHeart, FiLoader, FiGlobe, FiLock, FiEye, FiAlertTriangle } from 'react-icons/fi'; // Icons
import { motion } from 'framer-motion';

// Import constants
import { uiColors } from '../../_constants/uiConstants'; // Adjust path
import { itemVariants } from '../../_constants/uiConstants'; // Assuming variants


// --- API Helper Function ---
// Helper function to fetch PUBLIC knowledge bases
const fetchPublicKnowledgeBases = async () => {
    console.log("[KbTemplateList] Calling GET /api/knowledgebases/templates...");
    // *** Call your backend API endpoint for templates ***
    const response = await fetch('/api/knowledgebases/templates');
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch templates');
    }
    const templates = await response.json();
     console.log("[KbTemplateList] Fetched templates:", templates);
     // API is expected to return an array of public KBs, including `isOwner: false` and potentially `author` field
    return templates;
};


// Receive handler to create a KB (onCreateKb), handler for preview, and isCreating state
function KbTemplateList({ onCreateKb, onPreviewTemplate, isCreating }) { // *** isCreating prop ***

    const [searchTerm, setSearchTerm] = useState('');
    const [publicTemplates, setPublicTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Loading templates list
    const [fetchError, setFetchError] = useState(null); // Error for fetching templates


    // --- Fetch Public Knowledge Bases (Templates) on mount ---
    useEffect(() => {
        const loadTemplates = async () => {
            setIsLoading(true);
            setFetchError(null); // Clear previous fetch errors
            try {
                // Call the API helper
                 const fetchedTemplates = await fetchPublicKnowledgeBases();
                setPublicTemplates(fetchedTemplates);
            } catch (err) {
                console.error('[KbTemplateList] Error loading templates:', err);
                setFetchError(err.message);
                setPublicTemplates([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadTemplates();
    }, []); // Empty dependency array: fetch only on initial render of this component


    // Filter templates based on search term
    const filteredTemplates = publicTemplates.filter(template =>
        (template.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.author || '').toLowerCase().includes(searchTerm.toLowerCase()) // Search author too
        // Could also search content if feasible/desired and API supports it
    );

    // Handler for clicking "Use Template" button
    const handleUseTemplateClick = (template) => {
        console.log("[KbTemplateList] Using template:", template.name);
         // Check if already creating (should be disabled by the prop, but extra check)
         if (isCreating || isLoading) return;

        // Prepare data for creating a new KB based on this template
        const newKbData = {
            name: `Copy of ${template.name}`, // Suggest a name
            description: template.description || 'Created from template.',
            content: template.content || [], // Copy content from template
            isPublic: false, // User's copy is private by default
             status: 'processing', // New KB might need processing
             // Include any other relevant fields from template necessary for creation
        };
        // Call the parent handler (onCreateKb) with the data needed to create the new KB
        onCreateKb(newKbData); // Parent handles the async creation AND modal closing/navigation
        // Do NOT reset state or close modal here
    };

    // Handler for Previewing a template
     const handlePreviewClick = (template) => {
         // Check if already creating or loading
         if (isCreating || isLoading) return;

         console.log("[KbTemplateList] Previewing template:", template.name);
         // Call parent's preview handler (if passed down from modal/page)
          if (onPreviewTemplate) {
              onPreviewTemplate(template); // Pass the template data for preview
          } else {
             // Fallback placeholder if no handler is provided
             alert("Simulating template preview for: " + template.name);
         }
     };

     // Determine if buttons are disabled (during parent's creation or this component's loading)
     const areButtonsDisabled = isCreating || isLoading;


    // --- Render ---
    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                <FiSearch className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading} // Disable search while fetching templates
                    className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                />
            </div>

             {fetchError && ( // Display fetch error message
                  <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     <FiAlertTriangle className="inline-block mr-2 w-5 h-5" /> Error loading templates: {fetchError}
                  </div>
             )}


            {/* Template List Grid */}
            {isLoading ? (
                 <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                     <FiLoader className="animate-spin mx-auto w-6 h-6 mb-3" /> Loading templates...
                 </div>
            ) : filteredTemplates.length === 0 && !fetchError ? ( // Show empty state if not loading, no error, and list empty
                <div className={`text-center py-10 ${uiColors.textSecondary}`}>No templates found matching your search.</div>
            ) : ( // Show grid if not loading and list not empty
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {filteredTemplates.map(template => (
                          <motion.div
                              key={template.id} // Use template ID as key
                              variants={itemVariants} // Optional animation
                               // Use bgPrimary for cards within modal for contrast
                              className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-4 space-y-3 flex flex-col`}
                          >
                             {/* Header: Name & Public Status */}
                             <div className="flex items-center justify-between">
                                  <h4 className={`font-semibold text-sm ${uiColors.textPrimary}`}>{template.name}</h4>
                                   {template.isPublic && <FiGlobe className={`w-4 h-4 ${uiColors.textSecondary}`} title="Public Template" />}
                             </div>
                             {/* Author (Added display) */}
                             {template.author && <div className={`text-xs ${uiColors.textSecondary}`}>by {template.author}</div>}
                             {/* Description */}
                             <p className={`text-xs ${uiColors.textSecondary} flex-grow`}>
                                {template.description || 'No description provided.'}
                             </p>

                             {/* Stats/Metadata */}
                             <div className={`flex items-center text-xs ${uiColors.textPlaceholder} space-x-3`}>
                                 {template.downloads !== undefined && <span className="flex items-center"><FiDownload className="mr-1 w-3 h-3" /> {template.downloads}</span>}
                                 {template.likes !== undefined && <span className="flex items-center"><FiHeart className="mr-1 w-3 h-3" /> {template.likes}</span>}
                             </div>

                             {/* Actions Buttons */}
                              <div className="flex space-x-2 mt-3">
                                   {/* Preview Button */}
                                   <button
                                       onClick={() => handlePreviewClick(template)} // Call preview handler
                                        disabled={areButtonsDisabled} // Disable button
                                        className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50 disabled:cursor-not-allowed`}
                                   >
                                       <FiEye className="mr-1 w-3 h-3" /> Preview
                                   </button>
                                   {/* Use Template Button */}
                                  <button
                                      onClick={() => handleUseTemplateClick(template)} // Call handler to use template
                                       disabled={areButtonsDisabled} // Disable button
                                       className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                      Use Template
                                  </button>
                              </div>
                         </motion.div>
                     ))}
                 </div>
            )}

            {/* Preview Modal is handled by the parent modal component */}

        </div>
    );
}

export default KbTemplateList;