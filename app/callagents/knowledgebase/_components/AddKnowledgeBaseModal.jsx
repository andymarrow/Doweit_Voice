// app/callagents/knowledgebase/_components/AddKnowledgeBaseModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiArrowLeft, FiLoader } from 'react-icons/fi'; // Icons

// Import nested components for modal content
import KbCreationChoices from './KbCreationChoices';
import KbScratchForm from './KbScratchForm';
import KbTemplateList from './KbTemplateList';
import KbDoweitChat from './KbDoweitChat';

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


function AddKnowledgeBaseModal({ isOpen, onClose, onCreateKb, isCreating }) { // Receive creation handler and state

    const [currentMethod, setCurrentMethod] = useState(CREATION_METHODS.CHOICES);
    const modalRef = useRef(null); // Ref for modal content

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentMethod(CREATION_METHODS.CHOICES); // Always start with choices
        }
         // Reset method to choices on close
         if (!isOpen) {
             setCurrentMethod(CREATION_METHODS.CHOICES);
         }
    }, [isOpen]);

     // Handle clicks outside the modal to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             // Only close if the click is outside the modal content AND not during creation
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !isCreating) {
                 onClose();
             }
         };
         if (isOpen) {
             document.addEventListener("mousedown", handleClickOutside);
         }
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose, isCreating]);


    // Handler for selecting a creation method from the initial screen
    const handleSelectMethod = (method) => {
        if (methodComponents[method]) {
            setCurrentMethod(method);
        } else {
            console.warn(`Attempted to select unknown KB creation method: ${method}`);
             // Optionally show an error or default to choices
            setCurrentMethod(CREATION_METHODS.CHOICES);
        }
    };

    // Handler to go back to the choices screen
    const handleBackToChoices = () => {
        setCurrentMethod(CREATION_METHODS.CHOICES);
    };

    // Handler for creating from scratch or using a template
    // This receives the data from the form or template selection
    const handleCreationSubmit = (data) => {
        // Data structure depends on the method ('scratch' form data, 'template' data)
        console.log("[AddKnowledgeBaseModal] Received creation data:", data);
        // Pass the data up to the parent page to handle the API call
        onCreateKb(data);
        // The parent page will close the modal after successful creation
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

     // Disable modal content interaction during the creation process
     const isModalDisabled = isCreating;


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                ref={modalRef} // Attach ref
                 className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col ${isModalDisabled ? 'pointer-events-none' : ''}`} // Add pointer-events-none when creating
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} px-6 py-4 flex-shrink-0`}>
                     {/* Back Button (show unless on choices screen) */}
                     {currentMethod !== CREATION_METHODS.CHOICES && (
                          <button
                              onClick={handleBackToChoices}
                              disabled={isModalDisabled} // Disable back button during creation
                              className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} mr-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                              title="Back to Choices"
                          >
                              <FiArrowLeft className="w-5 h-5" />
                          </button>
                     )}
                     {/* Title */}
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary} ${currentMethod !== CREATION_METHODS.CHOICES ? 'flex-grow' : ''}`}> {/* Flex-grow title when back button is present */}
                        {modalTitle}
                        {isCreating && <FiLoader className="animate-spin ml-3 inline-block w-5 h-5" />} {/* Show spinner next to title */}
                    </h3>
                    {/* Close Button */}
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} disabled:opacity-50 disabled:cursor-not-allowed`} title="Close" disabled={isModalDisabled}>
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area (Scrollable) */}
                <div className="flex-grow overflow-y-auto p-6 hide-scrollbar">
                    {/* Render the active method component */}
                    {CurrentMethodComponent ? (
                         <CurrentMethodComponent
                             // Pass relevant props to the active component
                             onSelectMethod={handleSelectMethod} // Passed to KbCreationChoices
                             onCreateKb={handleCreationSubmit} // Passed to KbScratchForm & KbTemplateList
                             // You might pass other props like agentId if context is needed for chat/templates
                             // agentId={agentId}
                             // For template list, maybe pass a filter prop or search state
                             // searchTerm={templateSearchTerm}
                             // onSearchChange={setTemplateSearchTerm}
                         />
                     ) : (
                         <div className={`text-center ${uiColors.textDanger} py-10`}>
                             Error: Component not found for method '{currentMethod}'.
                         </div>
                     )}
                 </div>

                 {/* No separate footer needed, buttons are within the content components */}
            </div>
        </div>
    );
}

export default AddKnowledgeBaseModal;