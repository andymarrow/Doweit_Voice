// app/callagents/knowledgebase/_components/KbTemplateList.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiHeart, FiLoader, FiGlobe, FiLock } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../_constants/uiColors'; // Adjust path
import { itemVariants } from '../../_constants/uiColors'; // Assuming variants


// --- Placeholder Mock Data (Replace with API Call later) ---
// Simulates fetching PUBLIC knowledge bases
const fetchPublicKnowledgeBases = async () => {
    console.log("Fetching mock public knowledge bases...");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    // Mock data structure matching the DB schema, specifically PUBLIC ones
    const mockPublicData = [
         {
            id: 101,
            creatorId: null, // System/Template creator
            name: 'General Business FAQs Template',
            description: 'A starting point for common business questions (hours, location, contact).',
            isPublic: true, // Must be public
            content: [{ type: 'text', value: '## Business Hours\n...\n## Location\n...' }], // Simulate content
            status: 'ready',
            createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
            // Add template-specific metadata if needed
            downloads: 1500,
            likes: 400,
         },
        {
            id: 102,
            creatorId: null,
            name: 'eCommerce Product Details Template',
            description: 'Structure for product descriptions and specifications.',
            isPublic: true,
             content: [{ type: 'text', value: '## Product Name: [Product Name]\n- Features: \n- Specs: \n- Price: ' }],
            status: 'ready',
            createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            downloads: 900,
            likes: 250,
        },
         {
            id: 103,
            creatorId: null,
            name: 'Basic Support Bot KB',
            description: 'Simple flows for troubleshooting common issues.',
            isPublic: true,
             content: [{ type: 'text', value: '## Troubleshooting Guide\n- Problem 1: Solution A\n- Problem 2: Solution B' }],
            status: 'ready',
            createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
            downloads: 2100,
            likes: 600,
        },
        // Add more mock public templates
    ];

    return mockPublicData; // Filtered to only include isPublic=true
};


// Receive handler to use a template
function KbTemplateList({ onCreateKb }) { // Reuse onCreateKb handler from the modal/page

    const [searchTerm, setSearchTerm] = useState('');
    const [publicTemplates, setPublicTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);


    // --- Fetch Public Knowledge Bases (Templates) ---
    useEffect(() => {
        const loadTemplates = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                // Replace with API call: const fetchedTemplates = await fetch('/api/knowledgebases?public=true');
                // Handle API response and errors...
                 const fetchedTemplates = await fetchPublicKnowledgeBases(); // Using mock data
                setPublicTemplates(fetchedTemplates);
                 console.log("[KbTemplateList] Fetched public templates:", fetchedTemplates);
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
        (template.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        // Could also search content if feasible/desired
    );

    // Handler for clicking "Use Template"
    const handleUseTemplateClick = (template) => {
        console.log("[KbTemplateList] Using template:", template.name);
        // Prepare data for creating a new KB based on this template
        const newKbData = {
            name: `Copy of ${template.name}`, // Suggest a name
            description: template.description || 'Created from template.',
            content: template.content || [], // Copy content
            isPublic: false, // User's copy is private by default
             // Add any other fields from template necessary for creation
        };
        // Call the parent handler to create the new KB using this data
        onCreateKb(newKbData);
        // Parent will handle the async creation and modal closing
    };

    // Optional: Handler for Previewing a template (similar to Prompt modal)
     const handlePreviewTemplate = (template) => {
         console.log("Previewing template:", template.name);
         // You would need a Preview Modal component for this
         // setPreviewTemplateData(template);
         // setIsPreviewModalOpen(true);
         alert("Simulating template preview for: " + template.name); // Placeholder
     };


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
                    className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none`}
                />
            </div>

             {fetchError && ( // Display fetch error message
                  <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     Error loading templates: {fetchError}
                  </div>
             )}


            {/* Template List Grid */}
            {isLoading ? (
                 <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                     <FiLoader className="animate-spin mx-auto w-6 h-6 mb-3" /> Loading templates...
                 </div>
            ) : filteredTemplates.length === 0 ? (
                <div className={`text-center py-10 ${uiColors.textSecondary}`}>No templates found matching your search.</div>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {filteredTemplates.map(template => (
                          // You can reuse KnowledgeBaseCard or create a simpler card for templates
                          <motion.div
                              key={template.id} // Use template ID as key
                              variants={itemVariants} // Optional animation
                              className={`${uiColors.bgSecondary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-4 space-y-3 flex flex-col`} // flex-col for layout
                          >
                             {/* Header: Name & Public Status */}
                             <div className="flex items-center justify-between">
                                  <h4 className={`font-semibold text-sm ${uiColors.textPrimary}`}>{template.name}</h4>
                                   {template.isPublic && <FiGlobe className={`w-4 h-4 ${uiColors.textSecondary}`} title="Public Template" />} {/* Show globe icon */}
                             </div>
                             {/* Description */}
                             <p className={`text-xs ${uiColors.textSecondary} flex-grow`}> {/* flex-grow pushes buttons down */}
                                {template.description || 'No description provided.'}
                             </p>

                             {/* Stats/Metadata (Example: Downloads/Likes) */}
                             <div className={`flex items-center text-xs ${uiColors.textPlaceholder} space-x-3`}>
                                 {template.downloads !== undefined && <span className="flex items-center"><FiDownload className="mr-1 w-3 h-3" /> {template.downloads}</span>}
                                 {template.likes !== undefined && <span className="flex items-center"><FiHeart className="mr-1 w-3 h-3" /> {template.likes}</span>}
                             </div>

                             {/* Actions Buttons */}
                              <div className="flex space-x-2 mt-3">
                                   {/* Preview Button (Optional) */}
                                   <button
                                       onClick={() => handlePreviewTemplate(template)} // Call preview handler
                                        className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${uiColors.bgPrimary} ${uiColors.textSecondary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`}
                                   >
                                       Preview
                                   </button>
                                   {/* Use Template Button */}
                                  <button
                                      onClick={() => handleUseTemplateClick(template)} // Call handler to use template
                                       className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white`}
                                  >
                                      Use Template
                                  </button>
                              </div>
                         </motion.div>
                     ))}
                 </div>
            )}

            {/* Optional: Preview Modal */}
             {/* Render a Preview Modal component here if implementing preview */}
             {/* {showPreviewModal && <TemplatePreviewModal ... />} */}

        </div>
    );
}

export default KbTemplateList;