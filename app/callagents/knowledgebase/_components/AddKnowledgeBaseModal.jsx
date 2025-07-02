// app/callagents/knowledgebase/_components/AddKnowledgeBaseModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiArrowLeft, FiLoader } from 'react-icons/fi'; // Icons

// Import nested components for modal content
import KbCreationChoices from './KbCreationChoices';
import KbScratchForm from './KbScratchForm';
import KbTemplateList from './KbTemplateList';
import KbDoweitChat from './KbDoweitChat';

// *** Import a Preview Modal component if you have one ***
// Example: import TemplatePreviewModal from './TemplatePreviewModal'; // Adjust path

// Import constants
import { uiColors } from '../../_constants/uiConstants';

// Define possible creation methods
const CREATION_METHODS = {
    CHOICES: 'choices', // Initial state showing options
    SCRATCH: 'scratch',
    TEMPLATE: 'template',
    CHAT: 'chat',
};

// Define content components mapping to methods
const methodComponents = {
    [CREATION_METHODS.CHOICES]: KbCreationChoices,
    [CREATION_METHODS.SCRATCH]: KbScratchForm,
    [CREATION_METHODS.TEMPLATE]: KbTemplateList,
    [CREATION_METHODS.CHAT]: KbDoweitChat,
};


// Receive isOpen, onClose, onCreateKb handler, and isCreating state
function AddKnowledgeBaseModal({ isOpen, onClose, onCreateKb, isCreating }) { // *** isCreating prop ***

    const [currentMethod, setCurrentMethod] = useState(CREATION_METHODS.CHOICES);
    const modalRef = useRef(null);

    // State for Template Preview Modal (handled within this modal for now)
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewTemplateData, setPreviewTemplateData] = useState(null);


    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentMethod(CREATION_METHODS.CHOICES); // Always start with choices
             setShowPreviewModal(false); // Hide preview
             setPreviewTemplateData(null); // Clear preview data
        }
         // Reset state on close
         if (!isOpen) {
             setCurrentMethod(CREATION_METHODS.CHOICES);
              setShowPreviewModal(false);
              setPreviewTemplateData(null);
         }
         // Note: isCreating state is managed by the parent page
    }, [isOpen]);


     // Handle clicks outside the modal to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             // Only close if the click is outside the main modal, AND not during the *parent's* creation process, AND not clicking within the preview modal if open.
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !isCreating && !showPreviewModal) {
                 onClose();
             }
         };
         if (isOpen) {
             document.addEventListener("mousedown", handleClickOutside);
         }
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose, isCreating, showPreviewModal]);


    // Handler for selecting a creation method
    const handleSelectMethod = (method) => {
        if (methodComponents[method]) {
            setCurrentMethod(method);
        } else {
            console.warn(`Attempted to select unknown KB creation method: ${method}`);
            setCurrentMethod(CREATION_METHODS.CHOICES); // Default
        }
    };

    // Handler to go back to the choices screen
    const handleBackToChoices = () => {
        setCurrentMethod(CREATION_METHODS.CHOICES);
         // No need to clear preview state here, it's handled by closePreviewModal
    };

     // Handler for viewing a template preview from the template list
     const handlePreviewTemplate = (templateData) => {
         setPreviewTemplateData(templateData);
         setShowPreviewModal(true);
     };

     // Handler for closing the template preview modal
     const handleClosePreviewModal = () => {
         setShowPreviewModal(false);
         setPreviewTemplateData(null);
     };


    // Handler for creating from scratch or using a template
    // This receives the data from the specific form/list component
    const handleCreationSubmit = (data) => {
        console.log("[AddKnowledgeBaseModal] Received creation data from component:", data);
        // Call the parent's onCreateKb handler with the data
        onCreateKb(data);
        // The parent page will handle the API call, loading state (isCreating), and modal closing on success.
    };


    // Get the component to render based on the current method
    const CurrentMethodComponent = methodComponents[currentMethod];

    // Determine modal title based on method
    const modalTitle = {
        [CREATION_METHODS.CHOICES]: 'Add Knowledge Base',
        [CREATION_METHODS.SCRATCH]: 'Create from Scratch',
        [CREATION_METHODS.TEMPLATE]: 'Explore Templates',
        [CREATION_METHODS.CHAT]: 'Generate with Doweit Chat',
    }[currentMethod];

     // Disable modal content interaction based on the parent's isCreating state
     const isModalDisabled = isCreating;

    // Only render the main modal if isOpen and not showing the preview modal
    if (!isOpen || showPreviewModal) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                ref={modalRef} // Attach ref
                 // Apply disabled styles based on parent's isCreating state
                 className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col ${isModalDisabled ? 'pointer-events-none opacity-50' : ''}`} // Added opacity
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} px-6 py-4 flex-shrink-0`}>
                     {/* Back Button (show unless on choices screen) */}
                     {currentMethod !== CREATION_METHODS.CHOICES && (
                          <button
                              onClick={handleBackToChoices}
                               // Disable back button if the *modal itself* is disabled by parent state
                              disabled={isModalDisabled}
                              className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} mr-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                              title="Back to Choices"
                          >
                              <FiArrowLeft className="w-5 h-5" />
                          </button>
                     )}
                     {/* Title */}
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary} ${currentMethod !== CREATION_METHODS.CHOICES ? 'flex-grow' : ''}`}>
                        {modalTitle}
                         {/* Show loader here if the modal is disabled by parent's isCreating */}
                        {isCreating && <FiLoader className="animate-spin ml-3 inline-block w-5 h-5" />}
                    </h3>
                    {/* Close Button */}
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} disabled:opacity-50 disabled:cursor-not-allowed`} title="Close" disabled={isModalDisabled}>
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area (Scrollable) */}
                 {/* No need to apply disabled state here, done on the container div */}
                <div className="flex-grow overflow-y-auto p-6 hide-scrollbar">
                    {CurrentMethodComponent ? (
                         <CurrentMethodComponent
                             onSelectMethod={handleSelectMethod} // Passed to KbCreationChoices
                             onCreateKb={handleCreationSubmit} // Passed to KbScratchForm & KbTemplateList & KbDoweitChat
                             onPreviewTemplate={handlePreviewTemplate} // Passed to KbTemplateList
                             // Pass the parent's isCreating state down to nested components
                             isCreating={isCreating} // *** Pass down isCreating state ***
                             // Pass other props as needed (e.g., agentId for chat)
                             // agentId={agentId}
                         />
                     ) : (
                         <div className={`text-center ${uiColors.textDanger} py-10`}>
                             Error: Component not found for method '{currentMethod}'.
                         </div>
                     )}
                 </div>

            </div>

            {/* Render the Template Preview Modal */}
             {/* Placeholder for Preview Modal - Replace with actual component if you build one */}
              {showPreviewModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                      <div className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6`}>
                          <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4`}>
                              <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Template Preview: {previewTemplateData?.name}</h3>
                              <button onClick={handleClosePreviewModal} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close Preview">
                                  <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </button>
                          </div>
                           <pre className={`${uiColors.bgSecondary} p-4 rounded-md whitespace-pre-wrap break-words ${uiColors.textPrimary} text-sm`}>
                               {previewTemplateData?.content?.[0]?.value || 'No preview content available.'} {/* Display content */}
                           </pre>
                      </div>
                  </div>
              )}


        </div>
    );
}

export default AddKnowledgeBaseModal;