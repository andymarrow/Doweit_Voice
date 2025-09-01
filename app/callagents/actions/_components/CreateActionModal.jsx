// /app/callagents/actions/_components/CreateActionModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiArrowLeft, FiPlusCircle, FiLoader } from 'react-icons/fi';

import ActionTypeSelection from './ActionTypeSelection';
import ActionConfigForm from './ActionConfigForm';

import { uiColors } from '../../_constants/uiConstants';

const STEPS = {
    SELECT_TYPE: 'select_type',
    CONFIGURE_DETAILS: 'configure_details',
};


// onCreateAction prop will now receive the newly created action object from the API
function CreateActionModal({ isOpen, onClose, onCreateAction }) {
    const [currentStep, setCurrentStep] = useState(STEPS.SELECT_TYPE);
    const [selectedType, setSelectedType] = useState(null); // e.g., 'Boolean', 'Text', 'Choice'
    const [formData, setFormData] = useState({
        name: '',
        isRequired: true, // ***** NEW: Default isRequired to true *****
        // Add description to form state
        description: '',
        details: {}
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const modalRef = useRef(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(STEPS.SELECT_TYPE);
            setSelectedType(null);
            // Reset description state too
            setFormData({ name: '', description: '',isRequired: true, details: {} });
            setError('');
            setIsSaving(false);
        }
    }, [isOpen]);

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


    // --- Handlers for Step 1: Select Type ---
    const handleTypeSelect = (type) => {
        setSelectedType(type);
        let initialDetails = { type: type };
        switch (type) {
            case 'Boolean':
                 initialDetails.trueLabel = 'Yes';
                 initialDetails.falseLabel = 'No';
                 break;
            case 'Choice':
                 initialDetails.options = [{ id: Date.now().toString(), label: '' }];
                 break;
            case 'Action':
                 initialDetails.config = {};
                 break;
        }
         // Keep existing name and description when moving to next step
         setFormData(prev => ({
             ...prev,
             details: initialDetails
         }));
         setCurrentStep(STEPS.CONFIGURE_DETAILS);
    };


    // --- Handlers for Step 2: Configure Details ---
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        if (name === 'name' || name === 'description' || name === 'isRequired') {
            setFormData(prev => ({ ...prev, [name]: newValue }));
        } else if (name.startsWith('detail-')) {
            const detailKey = name.substring('detail-'.length);
            setFormData(prev => ({
                ...prev,
                details: { ...prev.details, [detailKey]: newValue }
            }));
        }
    };

     const handleChoiceChange = (id, value) => {
         setFormData(prev => ({
             ...prev,
             details: {
                 ...prev.details,
                 options: prev.details.options.map(opt =>
                     opt.id === id ? { ...opt, label: value } : opt
                 )
             }
         }));
     };

     const handleAddChoice = () => {
         setFormData(prev => ({
             ...prev,
             details: {
                 ...prev.details,
                 options: [...prev.details.options, { id: Date.now().toString(), label: '' }]
             }
         }));
     };

     const handleRemoveChoice = (id) => {
         setFormData(prev => ({
             ...prev,
             details: {
                 ...prev.details,
                 options: prev.details.options.filter(opt => opt.id !== id)
             }
         }));
     };

    const handleBackToTypeSelection = () => {
        setCurrentStep(STEPS.SELECT_TYPE);
        setSelectedType(null);
        // When going back, keep name/description but reset details based on default type
         setFormData(prev => ({ ...prev, details: {} })); // Reset details to empty
        setError('');
    };

    // --- Handle Final Creation (API Call) ---
    const handleCreate = async () => {
        setError('');

        // Basic frontend validation
        if (!formData.name?.trim()) { // Use optional chaining for safety
            setError('Action Name is required.');
            return;
        }
         // Description is optional, so no required check needed here, just trim before sending.

        if (formData.details.type === 'Choice') {
            const hasEmptyChoice = formData.details.options?.some(opt => !opt.label?.trim()); // Use optional chaining
            if (!Array.isArray(formData.details.options) || formData.details.options.length === 0 || hasEmptyChoice) {
                 setError('Choice type requires at least one option, and all options must have a label.');
                 return;
             }
             // Remove temporary IDs from options before sending to backend if they exist
             if (formData.details.options.length > 0 && formData.details.options[0].id !== undefined) {
                 const detailsToSend = {
                     ...formData.details,
                     options: formData.details.options.map(({ id, ...rest }) => rest) // Exclude 'id'
                 };
                  // Note: Don't modify formData state directly here before sending.
                  // Instead, build the payload with the modified details structure.
                  // Use detailsToSend in the API call body.
             }

        }
         if (formData.details.type === 'Boolean') {
              if (!formData.details.trueLabel?.trim() || !formData.details.falseLabel?.trim()) {
                  setError('"True" and "False" labels are required for a Boolean type.');
                  return;
              }
         }

        setIsSaving(true);

        try {
             // Construct the payload
             const payload = {
                 name: formData.name.trim(),
                 // Add description to the payload
                 description: formData.description?.trim() || null, // Send trimmed description or null if empty
                 isRequired: formData.isRequired,
                 type: 'Information Extractor', // Hardcoded broad type for this modal
                 details: formData.details,
             };

             // If it's a Choice type, ensure options have no temp IDs in the payload
             if (payload.details.type === 'Choice' && payload.details.options?.[0]?.id !== undefined) {
                  payload.details.options = payload.details.options.map(({ id, ...rest }) => rest);
             }


            // Call the POST /api/actions endpoint
            const response = await fetch('/api/actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // Send the constructed payload
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create action.');
            }

            const newAction = await response.json();
            console.log("API Success: New action created", newAction);

            // Call the parent handler with the newly created action data (including DB ID)
            onCreateAction(newAction); // This handler should also close the modal
onClose(); 
        } catch (err) {
            console.error('Error creating action:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };


    if (!isOpen) return null;

    // Determine if the Create button should be disabled (updated logic)
    const isCreateButtonDisabled = isSaving ||
                                  !formData.name?.trim() ||
                                  (formData.details.type === 'Choice' && (!Array.isArray(formData.details.options) || formData.details.options.length === 0 || formData.details.options.some(opt => !opt.label?.trim()))) ||
                                  (formData.details.type === 'Boolean' && (!formData.details.trueLabel?.trim() || !formData.details.falseLabel?.trim()));


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                ref={modalRef}
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4 flex-shrink-0`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>
                        {currentStep === STEPS.SELECT_TYPE ? 'Select Action Type' : `Configure Action: ${selectedType === 'Boolean' ? 'Boolean' : selectedType === 'Choice' ? 'Choice' : 'Text/Open Question'}`}
                    </h3>
                     <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Back Button (Only visible in Configure step) */}
                 {currentStep === STEPS.CONFIGURE_DETAILS && (
                     <button
                         onClick={handleBackToTypeSelection}
                         className={`inline-flex items-center text-sm ${uiColors.textSecondary} ${uiColors.hoverText} mb-4 transition-colors`}
                         disabled={isSaving}
                     >
                         <FiArrowLeft className="mr-1 w-4 h-4" /> Back to Select Type
                     </button>
                 )}


                {/* Modal Content (Scrollable Area) */}
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 hide-scrollbar">
                    {currentStep === STEPS.SELECT_TYPE ? (
                        <ActionTypeSelection onSelectType={handleTypeSelect} />
                    ) : ( // CONFIGURE_DETAILS step
                         <ActionConfigForm
                             selectedType={formData.details.type}
                             formData={formData} // Pass the entire formData including description
                             onChange={handleFormChange}
                             onChoiceChange={handleChoiceChange}
                             onAddChoice={handleAddChoice}
                             onRemoveChoice={handleRemoveChoice}
                             isSaving={isSaving} // Pass saving state to disable form fields
                         />
                    )}
                </div>

                {/* Error Message */}
                 {error && (
                     <div className={`mt-4 p-3 rounded-md text-sm ${uiColors.alertDangerBg} ${uiColors.alertDangerText} flex-shrink-0`}>
                         {error}
                     </div>
                 )}

                {/* Footer / Action Buttons */}
                 <div className={`flex justify-end border-t ${uiColors.borderPrimary} pt-3 mt-4 flex-shrink-0`}>
                    {currentStep === STEPS.CONFIGURE_DETAILS && (
                         <button
                             onClick={handleCreate}
                             disabled={isCreateButtonDisabled} // Use the calculated disabled state
                             className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} ${
                                 isCreateButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
                             }`}
                         >
                            {isSaving ? (
                                 <><FiLoader className="mr-2 w-4 h-4 animate-spin" /> Creating...</>
                            ) : (
                                 <><FiPlusCircle className="mr-2 w-4 h-4" /> Create Action</>
                            )}
                         </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateActionModal;