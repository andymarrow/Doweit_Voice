// voice-agents-dashboard/_components/CreateAgentFromScratchModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi'; // Added FiLoader for saving state

// Import the ImageUploadSection component
import ImageUploadSection from '@/app/characterai/create/_components/ImageUploadSection'; // Adjust path!

// Import constants - Adjusted path as necessary
import { accentButtonClasses, uiAccentClasses } from '../_constants/uiConstants'; // Adjust path

// This component will handle the Name and Image input for a new agent
// It receives the agentType selected in the previous modal
function CreateAgentFromScratchModal({ isOpen, onClose, agentType, onAgentCreated }) {
    const [agentName, setAgentName] = useState('');
    const [agentImageFile, setAgentImageFile] = useState(null); // State to hold the File object
    const [isSaving, setIsSaving] = useState(false); // State for saving/loading
    const [error, setError] = useState(''); // State for errors

    const modalRef = useRef(null); // Ref for modal content

    // Reset state when the modal opens
    useEffect(() => {
        if (isOpen) {
            setAgentName('');
            setAgentImageFile(null);
            setError(''); // Clear errors
            setIsSaving(false);
        }
    }, [isOpen]); // Reset when modal opens

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


    if (!isOpen) return null;

    const handleCreateAgent = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(''); // Clear previous errors

        if (!agentName.trim()) {
            setError('Agent Name is required.');
            return;
        }

        setIsSaving(true);

        const formData = new FormData();
        formData.append('name', agentName.trim());
        formData.append('type', agentType); // Include the selected type
        // Only append the file if one was selected
        if (agentImageFile) {
            formData.append('image', agentImageFile); // Use 'image' as the key, match API expectation
        }

        try {
            // Call the new API route to create the agent
            const response = await fetch('/api/callagents/create', {
                method: 'POST',
                body: formData, // Send FormData directly
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create agent.');
            }

            const newAgent = await response.json();
            console.log('Agent created successfully:', newAgent);

            // Notify the parent component and close the modal
            onAgentCreated(newAgent);
            onClose(); // Close the modal

        } catch (err) {
            console.error('Error creating agent:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            {/* Modal Container */}
            <div
                 ref={modalRef} // Attach ref
                 className={`${uiAccentClasses.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-md relative`}
                 onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing
            >
                {/* Close Button */}
                <button
                    className={`absolute top-4 right-4 p-2 rounded-md transition-colors ${uiAccentClasses.hoverBgSubtle}`}
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <FiX className={uiAccentClasses.textSecondary} size={20} />
                </button>

                {/* Modal Header */}
                <h2 className={`text-2xl font-bold mb-6 ${uiAccentClasses.textPrimary}`}>
                    Create New {agentType ? agentType.charAt(0).toUpperCase() + agentType.slice(1) + ' Assistant' : 'Agent'}
                </h2>

                {/* Form */}
                <form onSubmit={handleCreateAgent} className="space-y-6">
                    {/* Agent Name Input */}
                    <div>
                        <label htmlFor="newAgentName" className={`block text-md font-medium mb-1 ${uiAccentClasses.textPrimary}`}>
                            Agent Name
                        </label>
                         <input
                             type="text"
                             id="newAgentName"
                             value={agentName}
                             onChange={(e) => setAgentName(e.target.value)}
                             className={`block w-full p-2 rounded-md ${uiAccentClasses.bgSecondary} ${uiAccentClasses.textPrimary} border ${uiAccentClasses.borderColor} outline-none ${uiAccentClasses.ringAccentShade} focus:ring-1`}
                             placeholder="e.g., Customer Support Agent"
                             required
                             disabled={isSaving}
                         />
                    </div>

                    {/* Image Upload Section */}
                    {/* Pass null for existingImageUrl initially */}
                    <ImageUploadSection onImageSelect={setAgentImageFile} existingImageUrl={null} />

                    {/* Error Message */}
                    {error && (
                        <div className={`p-3 text-sm rounded-md ${uiAccentClasses.alertDangerBg} ${uiAccentClasses.alertDangerText}`}>
                            {error}
                        </div>
                    )}

                    {/* Create Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving || !agentName.trim()} // Disable if saving or name is empty
                             className={`inline-flex items-center px-6 py-2 rounded-md font-semibold text-white transition-opacity ${accentButtonClasses} ${isSaving || !agentName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSaving ? (
                                <>
                                    <FiLoader className="mr-2 w-4 h-4 animate-spin" /> Creating...
                                </>
                             ) : (
                                 <>
                                     <FiSave className="mr-2 w-4 h-4" /> Create Agent
                                 </>
                             )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default CreateAgentFromScratchModal;