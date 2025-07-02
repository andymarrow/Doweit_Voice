"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    FiX, FiSearch, FiCheck, FiLock, FiDownload, FiHeart, FiBookOpen, // General icons
    FiCopy, FiLoader // Added FiLoader for KB upload simulation
} from 'react-icons/fi'; // Import necessary icons

// Import constants - Adjust path as necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants';

// Simulate available templates (replace with API call)
const mockMarketplaceTemplates = [
    {
        id: 'template-hospital',
        locked: true, // Example locked template
        name: 'Hospital Appointment Setter',
        author: 'Doweit voice Team',
        lines: 120,
        downloads: 500,
        likes: 150,
        promptText: `# Hospital Appointment Setter

## Agent Information
Agent Name: [Hospital Name] Scheduler
Personality: Calm, clear, empathetic
Role: Schedule, confirm, or reschedule patient appointments

## Conversation Flow
1. Greet patient, confirm identity (DOB/name).
2. Ask purpose (schedule, reschedule, confirm).
3. If scheduling: Get patient details, doctor, required date/time, reason for visit. Check availability. Offer options.
4. If rescheduling: Confirm existing appointment, find new time.
5. If confirming: Provide details, ask if any questions.
6. Handle cancellations.
7. Confirm all details at the end.
... (more prompt text)`
    },
    {
        id: 'template-restaurant',
        locked: false,
        name: 'Restaurant Order Taker',
        author: 'Community Contributor',
        lines: 80,
        downloads: 1200,
        likes: 350,
        promptText: `# Restaurant Order Taker Prompt

## Agent Information
Agent Name: [Restaurant Name] Order Bot
Personality: Friendly, efficient, clear
Role: Take customer food orders

## Conversation Flow
1. Greet the customer, ask for their order.
2. Confirm items and quantities.
3. Ask about special instructions or modifications.
4. Confirm delivery/pickup details.
5. Calculate total (placeholder).
6. Thank the customer.
... (more prompt text)`
    },
     {
        id: 'template-realestate',
        locked: false,
        name: 'Real Estate Lead Qualifier',
        author: 'Doweit voice Partner',
        lines: 150,
        downloads: 800,
        likes: 250,
        promptText: `# Real Estate Lead Qualifier Prompt

## Agent Information
Agent Name: [Brokerage Name] Assistant
Personality: Professional, knowledgeable, polite
Role: Qualify real estate leads via phone

## Conversation Flow
1. Introduce yourself and the brokerage.
2. Ask about their interest (buying, selling, renting).
3. If buying: budget, location, property type, timeline, pre-approved?
4. If selling: property address, type, size, condition, desired price, timeline.
5. Offer to connect with an agent or schedule a follow-up.
... (more prompt text)`
    },
    // Add more mock templates...
];

function UseTemplateModal({ isOpen, onClose, onUseTemplate, onAddKnowledgeBase }) {
    const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' or 'knowledgeBase'
    const [marketplaceSearchTerm, setMarketplaceSearchTerm] = useState('');
    const [marketplaceTemplates, setMarketplaceTemplates] = useState([]); // State for loaded templates
    const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(true);

    // State for the Knowledge Base tab
    const [kbMethod, setKbMethod] = useState('paste'); // 'paste' or 'upload'
    const [kbTextInput, setKbTextInput] = useState('');
    const [kbFile, setKbFile] = useState(null); // Placeholder for file object
    const [isReadingFile, setIsReadingFile] = useState(false); // State for file reading

    // State for the Preview Modal
    const [showPreview, setShowPreview] = useState(false);
    const [previewPromptText, setPreviewPromptText] = useState('');

    const modalRef = useRef(null); // Ref for the main modal content

    // Effect to load marketplace data when the modal opens
    useEffect(() => {
        if (isOpen && activeTab === 'marketplace' && marketplaceTemplates.length === 0) {
            setIsLoadingMarketplace(true);
            // --- Simulate API Call to fetch templates ---
            setTimeout(() => {
                setMarketplaceTemplates(mockMarketplaceTemplates); // Load mock data
                setIsLoadingMarketplace(false);
            }, 500); // Simulate network delay
            // --- End Simulate API Call ---
        }
         // Reset states when modal opens
         if (isOpen) {
            // Don't reset activeTab immediately on open, user might want KB tab
            // setMarketplaceSearchTerm(''); // Maybe keep search term?
             setKbMethod('paste'); // Reset KB method
             setKbTextInput(''); // Clear KB text input
             setKbFile(null); // Clear KB file input
             setShowPreview(false); // Hide preview
             setPreviewPromptText(''); // Clear preview text
             setIsReadingFile(false); // Reset file reading state
         }
    }, [isOpen, activeTab, marketplaceTemplates.length]); // Depend on isOpen, activeTab, and whether templates are already loaded


     // Handle clicks outside the modal to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             // Only close if the click is outside the main modal AND outside the preview
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !showPreview) {
                 onClose();
             }
         };
         if (isOpen) {
             document.addEventListener("mousedown", handleClickOutside);
         }
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose, showPreview]); // Re-run if isOpen, onClose, or showPreview changes


    // Filter marketplace templates based on search term
    const filteredMarketplaceTemplates = marketplaceTemplates.filter(template =>
        template.name.toLowerCase().includes(marketplaceSearchTerm.toLowerCase()) ||
        template.author.toLowerCase().includes(marketplaceSearchTerm.toLowerCase())
        // Could also search within promptText if desired/feasible
    );

    // Handlers for marketplace actions
    const handlePreviewClick = (promptText) => {
        setPreviewPromptText(promptText);
        setShowPreview(true);
    };

    const handleUseTemplateClick = (promptText) => {
         onUseTemplate(promptText); // Call the passed handler from the parent
         // The parent handler is responsible for closing the modal if desired
         // onClose(); // Uncomment this line if the parent handler *doesn't* close the modal
    };

    // Handlers for Knowledge Base actions
     const handleKbMethodChange = (method) => {
         setKbMethod(method);
         setKbTextInput(''); // Clear text when switching method
         setKbFile(null); // Clear file when switching
         setIsReadingFile(false); // Reset file reading state
     };

     const handleKbFileChange = (e) => {
         const file = e.target.files[0];
         if (file) {
              setKbFile(file);
              // Read file content for preview/processing
              setIsReadingFile(true);
              const reader = new FileReader();
              reader.onload = (event) => {
                   setKbTextInput(event.target.result); // Put file content in text area for preview
                   setIsReadingFile(false);
              };
              reader.onerror = (event) => {
                   console.error("Error reading file:", event.target.error);
                   setKbTextInput(`Error reading file: ${event.target.error.message}`);
                   setIsReadingFile(false);
              };
              reader.readAsText(file); // Read as text assuming text/markdown files
         } else {
             setKbFile(null);
              setKbTextInput('');
              setIsReadingFile(false);
         }
     };

    const handleUseKnowledgeBaseClick = () => {
         let contentToUse = '';
         if (kbMethod === 'paste' && kbTextInput.trim()) {
             contentToUse = kbTextInput.trim();
         } else if (kbMethod === 'upload' && kbFile && kbTextInput.trim()) {
             // Use the content read from the file (stored in kbTextInput)
             // You might want to prefix it with file name or structure it
             contentToUse = `## Content from ${kbFile.name}\n\n` + kbTextInput.trim();
         }

        if (contentToUse) {
            onAddKnowledgeBase(contentToUse); // Call the passed handler from the parent
             // The parent handler is responsible for closing the modal if desired
             // onClose(); // Uncomment this line if the parent handler *doesn't* close the modal
         } else {
             // Improve error message based on method
             if (kbMethod === 'paste') {
                 alert("Please paste content into the text area.");
             } else if (kbMethod === 'upload') {
                  if (!kbFile) alert("Please select a file to upload.");
                  else if (isReadingFile) alert("Please wait for the file to finish reading.");
                  else alert("Could not read content from the selected file.");
             } else {
                  alert("Please provide content to add to Knowledge Base.");
             }
         }
    };


    if (!isOpen) return null; // Don't render anything if not open

    return (
        // Backdrop Overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>

            {/* Main Modal Content */}
            <div
                ref={modalRef} // Attach ref
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col`} // Increased max-w, added max-h, flex-col
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} px-6 py-4 flex-shrink-0`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Use a Template / Knowledge Base</h3>
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${uiColors.borderPrimary} px-6 flex-shrink-0`}>
                    <button
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px]
                            ${activeTab === 'marketplace'
                                ? `${uiColors.accentPrimary} border-${uiColors.accentPrimaryText}`
                                : `${uiColors.textSecondary} border-transparent ${uiColors.hoverText}`
                            }`}
                        onClick={() => setActiveTab('marketplace')}
                    >
                        Marketplace Suggestions
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px]
                            ${activeTab === 'knowledgeBase'
                                ? `${uiColors.accentPrimary} border-${uiColors.accentPrimaryText}`
                                : `${uiColors.textSecondary} border-transparent ${uiColors.hoverText}`
                            }`}
                        onClick={() => setActiveTab('knowledgeBase')}
                    >
                        Knowledge Base
                    </button>
                </div>

                {/* Content Area (Scrollable) */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">

                    {/* Marketplace Tab Content */}
                    {activeTab === 'marketplace' && (
                        <div className="space-y-6">
                            {/* Search */}
                            <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                                <FiSearch className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={marketplaceSearchTerm}
                                    onChange={(e) => setMarketplaceSearchTerm(e.target.value)}
                                    className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none`}
                                />
                            </div>

                            {/* Template List/Grid */}
                            {isLoadingMarketplace ? (
                                <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                                     <FiLoader className="animate-spin mx-auto w-6 h-6 mb-3" />
                                     Loading templates...
                                </div>
                            ) : filteredMarketplaceTemplates.length === 0 ? (
                                <div className={`text-center py-10 ${uiColors.textSecondary}`}>No templates found.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredMarketplaceTemplates.map(template => (
                                        <div key={template.id} className={`${uiColors.bgSecondary} rounded-lg border ${uiColors.borderPrimary} p-4 space-y-2`}>
                                            {/* Header: Name & Lock Status */}
                                            <div className="flex items-center justify-between">
                                                 <h4 className={`font-semibold text-sm ${uiColors.textPrimary}`}>{template.name}</h4>
                                                 {template.locked && <FiLock className={`w-4 h-4 ${uiColors.textSecondary}`} title="Locked" />}
                                            </div>
                                             {/* Author */}
                                             <div className={`text-xs ${uiColors.textSecondary}`}>by {template.author}</div>
                                             {/* Stats */}
                                             <div className={`flex items-center text-xs ${uiColors.textPlaceholder} space-x-3`}>
                                                <span>{template.lines} lines</span>
                                                 <span className="flex items-center"><FiDownload className="mr-1 w-3 h-3" /> {template.downloads}</span>
                                                 <span className="flex items-center"><FiHeart className="mr-1 w-3 h-3" /> {template.likes}</span>
                                             </div>
                                            {/* Actions (if not locked) */}
                                            {!template.locked && (
                                                <div className="flex space-x-2 mt-3">
                                                     <button
                                                         onClick={() => handlePreviewClick(template.promptText)}
                                                         className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${uiColors.bgPrimary} ${uiColors.textSecondary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`}
                                                    >
                                                        Preview
                                                    </button>
                                                     <button
                                                         onClick={() => handleUseTemplateClick(template.promptText)} // Calls parent handler
                                                         className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white`}
                                                     >
                                                         Use Template
                                                     </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Knowledge Base Tab Content */}
                    {activeTab === 'knowledgeBase' && (
                        <div className="space-y-6">
                            {/* Method Selection */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>Add Knowledge Base Content</label>
                                <div className="flex space-x-4">
                                    <label className={`inline-flex items-center cursor-pointer ${uiColors.textSecondary}`}>
                                        <input
                                            type="radio"
                                            name="kbMethod"
                                            value="paste"
                                            checked={kbMethod === 'paste'}
                                            onChange={() => handleKbMethodChange('paste')}
                                            className={`form-radio h-4 w-4 ${uiColors.accentPrimary} focus:ring-${uiColors.accentPrimaryText} border-gray-300`}
                                        />
                                        <span className="ml-2 text-sm">Paste Text / Link</span>
                                    </label>
                                    <label className={`inline-flex items-center cursor-pointer ${uiColors.textSecondary}`}>
                                        <input
                                            type="radio"
                                            name="kbMethod"
                                            value="upload"
                                            checked={kbMethod === 'upload'}
                                            onChange={() => handleKbMethodChange('upload')}
                                            className={`form-radio h-4 w-4 ${uiColors.accentPrimary} focus:ring-${uiColors.accentPrimaryText} border-gray-300`}
                                        />
                                        <span className="ml-2 text-sm">Upload File</span>
                                    </label>
                                </div>
                            </div>

                            {/* Input Area (conditional based on method) */}
                            {kbMethod === 'paste' && (
                                <div>
                                     <label htmlFor="kbPasteInput" className="sr-only">Paste your prompt or knowledge base content</label>
                                    <textarea
                                         id="kbPasteInput"
                                        placeholder="Paste your prompt or knowledge base content here..."
                                        value={kbTextInput}
                                        onChange={(e) => setKbTextInput(e.target.value)}
                                         className={`block w-full h-48 p-3 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y`}
                                    ></textarea>
                                </div>
                            )}

                            {kbMethod === 'upload' && (
                                 <div>
                                      <label htmlFor="kbUploadInput" className="sr-only">Upload knowledge base file</label>
                                     <input
                                          type="file"
                                          id="kbUploadInput"
                                          onChange={handleKbFileChange}
                                          className={`block w-full text-sm ${uiColors.fileInput}`} // Apply custom file input styling from uiColors
                                      />
                                       {isReadingFile && (
                                             <p className={`mt-2 text-sm ${uiColors.textSecondary} flex items-center`}>
                                                  <FiLoader className="animate-spin mr-2" /> Reading file...
                                             </p>
                                       )}
                                      {kbFile && !isReadingFile && <p className={`mt-2 text-sm ${uiColors.textSecondary}`}>Selected file: {kbFile.name}</p>}
                                      {/* Optional: Textarea to preview file content if read */}
                                       {/* Show text area preview if file was read into text input */}
                                        {kbMethod === 'upload' && kbTextInput && !isReadingFile && (
                                            <textarea
                                                readOnly // Read-only preview
                                                 placeholder="File content preview..."
                                                value={kbTextInput}
                                                 className={`block w-full h-32 mt-4 p-3 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none resize-y cursor-text`}
                                            ></textarea>
                                       )}

                                 </div>
                            )}

                             {/* Action button for KB tab - positioned logically within the tab content */}
                             <div className="flex justify-end">
                                 <button
                                     onClick={handleUseKnowledgeBaseClick} // Calls parent handler
                                     disabled={isReadingFile || (kbMethod === 'paste' && !kbTextInput.trim()) || (kbMethod === 'upload' && (!kbFile || !kbTextInput.trim()))} // Disable if reading file, or inputs empty
                                     className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} ${isReadingFile || (kbMethod === 'paste' && !kbTextInput.trim()) || (kbMethod === 'upload' && (!kbFile || !kbTextInput.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                 >
                                      <FiBookOpen className="mr-2 w-4 h-4" /> Add Knowledge Base to Prompt
                                 </button>
                             </div>
                        </div>
                    )}

                </div> {/* End Scrollable Content Area */}

                 {/* Preview Modal (Nested within the main modal structure) */}
                 {showPreview && (
                     <div className="absolute inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"> {/* Full overlay */}
                         <div className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col`}> {/* Content area */}
                             {/* Header */}
                             <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} px-6 py-4 flex-shrink-0`}>
                                 <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Prompt Preview</h3>
                                  <button onClick={() => setShowPreview(false)} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close Preview">
                                     <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                 </button>
                             </div>
                              {/* Scrollable Prompt Text */}
                             <div className="flex-grow overflow-y-auto p-6">
                                  {/* Use prose for basic markdown-like styling if uiColors supports it */}
                                   {/* <div className={`prose prose-sm max-w-none ${uiColors.textPrimary}`}> */}
                                       <pre className={`${uiColors.bgSecondary} p-4 rounded-md whitespace-pre-wrap break-words ${uiColors.textPrimary} text-sm`}> {/* Use pre for preserving formatting */}
                                            {previewPromptText}
                                       </pre>
                                  {/* </div> */}
                              </div>
                         </div>
                     </div>
                 )}


            </div> {/* End Main Modal Content */}
        </div> // End Backdrop Overlay
    );
}

export default UseTemplateModal;