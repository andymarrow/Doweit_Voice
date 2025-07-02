// voice-agents-CallAgents/[agentid]/_components/UseTemplateModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    FiX, FiSearch, FiCheck, FiLock, FiDownload, FiHeart, FiBookOpen, // General icons
    FiCopy // For copy icon (optional)
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
        promptText: '... (Full prompt text for hospital)'
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
    const [isLoadingKB, setIsLoadingKB] = useState(false); // For loading file content

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
         // Reset states when modal opens/closes
         if (!isOpen) {
             setActiveTab('marketplace'); // Reset to marketplace on close
             setMarketplaceSearchTerm('');
             setKbMethod('paste');
             setKbTextInput('');
             setKbFile(null);
             setShowPreview(false);
             setPreviewPromptText('');
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
         onUseTemplate(promptText); // Use the passed handler
         // onClose(); // Handlers from parent are expected to close the modal
    };

    // Handlers for Knowledge Base actions
     const handleKbMethodChange = (method) => {
         setKbMethod(method);
         setKbTextInput(''); // Clear text when switching method
         setKbFile(null); // Clear file when switching
     };

     const handleKbFileChange = (e) => {
         const file = e.target.files[0];
         if (file) {
              setKbFile(file);
              // Optional: Read file content here if feasible (e.g., text files)
              // setIsLoadingKB(true);
              // const reader = new FileReader();
              // reader.onload = (event) => {
              //      setKbTextInput(event.target.result); // Put file content in text area
              //      setIsLoadingKB(false);
              // };
              // reader.readAsText(file); // Or readAsDataURL for other types
         } else {
             setKbFile(null);
              setKbTextInput('');
         }
     };

    const handleUseKnowledgeBaseClick = () => {
         let contentToUse = '';
         if (kbMethod === 'paste' && kbTextInput.trim()) {
             contentToUse = kbTextInput.trim();
         }
         // For upload method, you'd need to handle file reading.
         // This placeholder just uses the text input, even for upload method for now.
         if (kbMethod === 'upload' && kbFile) {
             // In a real app, read content from kbFile here
             // For simulation, maybe just use a placeholder or the text input value
             contentToUse = `## Content from ${kbFile.name}\n\n` + kbTextInput; // Placeholder structure
             // If you read file content fully, use that here
         }

        if (contentToUse) {
            onAddKnowledgeBase(contentToUse); // Use the passed handler
             // onClose(); // Handlers from parent are expected to close the modal
         } else {
             alert("Please provide content to add to Knowledge Base."); // Or show a less intrusive message
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
                                <div className={`text-center py-10 ${uiColors.textSecondary}`}>Loading templates...</div>
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
                                                         onClick={() => handleUseTemplateClick(template.promptText)}
                                                         className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white`}
                                                     >
                                                         Use
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
                                     <label htmlFor="kbPasteInput" className="sr-only">Paste your prompt or knowledge base content</label> {/* Accessible label */}
                                    <textarea
                                         id="kbPasteInput" // Added ID
                                        placeholder="Paste your prompt or knowledge base content here..."
                                        value={kbTextInput}
                                        onChange={(e) => setKbTextInput(e.target.value)}
                                         className={`block w-full h-48 p-3 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y`}
                                    ></textarea>
                                </div>
                            )}

                            {kbMethod === 'upload' && (
                                 <div>
                                      <label htmlFor="kbUploadInput" className="sr-only">Upload knowledge base file</label> {/* Accessible label */}
                                     <input
                                          type="file"
                                          id="kbUploadInput" // Added ID
                                          onChange={handleKbFileChange}
                                          className={`block w-full text-sm  file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold   file:transition-colors `} // Custom file input styling
                                      />
                                      {kbFile && <p className={`mt-2 text-sm ${uiColors.textSecondary}`}>Selected file: {kbFile.name}</p>}
                                      {/* Optional: Textarea to preview file content if read */}
                                       {kbMethod === 'upload' && kbTextInput && ( // Show text area preview if file was read into text input
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
                                     onClick={handleUseKnowledgeBaseClick}
                                     disabled={isLoadingKB || (kbMethod === 'paste' && !kbTextInput.trim()) || (kbMethod === 'upload' && !kbFile)} // Disable if loading or inputs empty
                                     className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} ${isLoadingKB || (kbMethod === 'paste' && !kbTextInput.trim()) || (kbMethod === 'upload' && !kbFile) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                 >
                                      <FiBookOpen className="mr-2 w-4 h-4" /> Add Knowledge Base
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
                                   <div className={`prose prose-sm max-w-none ${uiColors.textPrimary}`}>
                                       <pre className={`${uiColors.bgSecondary} p-4 rounded-md whitespace-pre-wrap break-words`}> {/* Use pre for preserving formatting */}
                                            {previewPromptText}
                                       </pre>
                                  </div>
                              </div>
                         </div>
                     </div>
                 )}


            </div> {/* End Main Modal Content */}
        </div> // End Backdrop Overlay
    );
}

export default UseTemplateModal;