// app/callagents/[agentid]/configure/_components/SelectKnowledgeBaseModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCheck, FiGlobe, FiLock, FiLoader } from 'react-icons/fi'; // Icons
import { toast } from 'react-hot-toast';

// Import constants
import { uiColors } from '../../../_constants/uiConstants'; // Adjust path

// Import the KnowledgeBaseCard component (reuse from the main KB page)
// *** Adjust the import path based on your file structure ***
// Assuming it's relative to /[agentid]/configure/_components/
import KnowledgeBaseCard from '@/app/callagents/knowledgebase/_components/KnowledgeBaseCard';


// Helper function to fetch user's owned knowledge bases
// This calls the existing GET /api/knowledgebases endpoint
const fetchMyKnowledgeBases = async () => {
    console.log("[SelectKnowledgeBaseModal] Calling GET /api/knowledgebases...");
    const response = await fetch('/api/knowledgebases'); // Use the existing API
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch knowledge bases');
    }
    const kbs = await response.json();
     console.log("[SelectKnowledgeBaseModal] Fetched KBs:", kbs);
     // API is expected to return an array of KBs owned by the user, including `isOwner: true`
    return kbs;
};


// Receive isOpen, onClose, and onSelectKb handler
function SelectKnowledgeBaseModal({ isOpen, onClose, onSelectKb, selectedKbId }) { // *** Added selectedKbId prop ***

    const [myKnowledgeBases, setMyKnowledgeBases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const modalRef = useRef(null); // Ref for modal content

    // Effect to load user's KBs when the modal opens
    useEffect(() => {
         if (isOpen) {
             const loadKnowledgeBases = async () => {
                 setIsLoading(true);
                 setFetchError(null);
                 try {
                      // Call the API helper to fetch owned KBs
                      const fetchedKBs = await fetchMyKnowledgeBases();
                      setMyKnowledgeBases(fetchedKBs);
                 } catch (err) {
                     console.error('[SelectKnowledgeBaseModal] Error loading knowledge bases:', err);
                     setFetchError(err.message);
                     setMyKnowledgeBases([]); // Clear list on error
                 } finally {
                     setIsLoading(false);
                 }
             };
             loadKnowledgeBases();
         }
          // Reset state on close
          if (!isOpen) {
             setMyKnowledgeBases([]); // Clear list
             setIsLoading(true); // Reset loading state for next open
             setFetchError(null); // Clear error
          }
    }, [isOpen]); // Effect runs when modal opens

     // Handle clicks outside the modal to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
                 onClose();
             }
         };
         if (isOpen) {
             document.addEventListener("mousedown", handleClickOutside);
         }
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose]);


    // Handler for selecting a KB from the list
    const handleKbCardClick = (kb) => {
        console.log("[SelectKnowledgeBaseModal] KB selected:", kb);
         // Call the parent handler with the selected KB object (or just its ID)
        onSelectKb(kb); // Pass the selected KB object
        onClose(); // Close the modal after selection
    };

     // Handler for removing the link (selecting 'No Knowledge Base')
     const handleRemoveLink = () => {
         console.log("[SelectKnowledgeBaseModal] Removing KB link.");
         // Call parent handler with null to indicate no KB selected
         onSelectKb(null);
         onClose(); // Close the modal
     };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                ref={modalRef} // Attach ref
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4 flex-shrink-0`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Link Knowledge Base</h3>
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                 {/* Option to select 'No Knowledge Base' */}
                 <div className={`mb-4 px-4 py-3 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${selectedKbId === null ? `${uiColors.accentSubtleBg}` : `${uiColors.hoverBgSubtle}`} transition-colors cursor-pointer`}
                      onClick={handleRemoveLink}
                 >
                      <span className={`font-semibold ${selectedKbId === null ? uiColors.accentPrimary : uiColors.textPrimary}`}>No Knowledge Base</span>
                 </div>


                {/* Knowledge Base List */}
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 hide-scrollbar">
                    {fetchError && (
                         <div className={`text-center py-10 ${uiColors.textDanger}`}>
                             Error loading knowledge bases: {fetchError}
                         </div>
                    )}
                    {isLoading ? (
                         <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                             <FiLoader className="animate-spin mx-auto w-6 h-6 mb-3" /> Loading your knowledge bases...
                         </div>
                    ) : myKnowledgeBases.length === 0 && !fetchError ? (
                         <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                            You have no knowledge bases yet. Create one on the <a href="/callagents/knowledgebase" className={uiColors.textAccent}>Knowledge Base page</a>.
                         </div>
                    ) : (
                         <div className="space-y-4"> {/* Stack cards vertically */}
                             {myKnowledgeBases.map(kb => (
                                  <div
                                       key={kb.id}
                                       // Add selected styling
                                       className={`rounded-lg border ${uiColors.borderPrimary} p-4 cursor-pointer ${uiColors.bgPrimary} ${selectedKbId === kb.id ? `${uiColors.accentSubtleBg} ${uiColors.borderAccentPrimary}` : uiColors.hoverBgSubtle} transition-colors`}
                                       onClick={() => handleKbCardClick(kb)} // Call handler with the KB object
                                  >
                                       {/* Use relevant info from the KB object */}
                                       <div className="flex items-center justify-between">
                                            <h4 className={`font-semibold text-sm ${selectedKbId === kb.id ? uiColors.accentPrimary : uiColors.textPrimary}`}>{kb.name}</h4>
                                             {/* Indicate if this is the currently selected KB */}
                                             {selectedKbId === kb.id && <FiCheck className={`w-5 h-5 ${uiColors.accentPrimary}`} />}
                                             {/* Optional: Show public/private icon if needed here */}
                                             {/* {kb.isPublic ? <FiGlobe className="w-4 h-4 text-gray-500" /> : <FiLock className="w-4 h-4 text-gray-500" />} */}
                                       </div>
                                        <p className={`text-xs ${uiColors.textSecondary} mt-1`}>
                                            {kb.description || 'No description provided.'}
                                        </p>
                                       {/* Optional: Add other details like last updated */}
                                        {/* <div className={`text-xs ${uiColors.textPlaceholder} mt-1`}>
                                            Updated: {kb.updatedAt ? new Date(kb.updatedAt).toLocaleDateString() : 'N/A'}
                                        </div> */}
                                  </div>
                             ))}
                         </div>
                     )}
                </div>

                {/* Footer (Optional) - Can just have close button if needed */}
                {/* <div className={`flex justify-end border-t ${uiColors.borderPrimary} pt-3 mt-4 flex-shrink-0`}>
                    <button onClick={onClose} className={`px-4 py-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}>
                        Cancel
                    </button>
                </div> */}
            </div>
        </div>
    );
}

export default SelectKnowledgeBaseModal;