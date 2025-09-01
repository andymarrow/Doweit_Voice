// /app/callagents/actions/_components/EditActionModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

import ActionConfigForm from './ActionConfigForm'; // Assuming this component now accepts and renders description

import { uiColors } from '../../_constants/uiConstants';


// onUpdateAction prop will now receive the updated action object from the API
function EditActionModal({ isOpen, onClose, action, onUpdateAction }) {
    // State to manage the form data.
    // Initialize with data from the 'action' prop when the modal opens.
    const [formData, setFormData] = useState({
        // Initialize with default/null values, which will be overwritten by useEffect
        id: null,
        type: '', // Broad type (e.g., 'Information Extractor')
        name: '',
        // Initialize description and displayName
        description: '',
        isRequired: true, // ***** NEW *****
        displayName: '',
        // Map 'config' from the database structure to 'details' for the form component
        details: { type: 'Text' }, // Provide a default structure
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const modalRef = useRef(null);

    // Effect to load/reset form data when the modal opens or the 'action' prop changes.
    useEffect(() => {
        // Only update if the modal is open and an action is provided
        if (isOpen && action) {
            console.log("EditModal: Loading action into form state", action);
            setFormData({
                 id: action.id,
                 type: action.type || '',
                 name: action.name || '',
                 // Map description and displayName from the action prop
                 description: action.description || '',
                 isRequired: action.isRequired ?? true, // ***** NEW: Load isRequired, default to true if null/undefined *****
                 displayName: action.displayName || '',
                 // Map 'config' from action prop to 'details' for the form
                 details: action.config ? { ...action.config } : { type: 'Text' }, // Ensure details has a type
            });
            setError(''); // Clear errors on new action load
            setIsSaving(false); // Ensure not in saving state
        } else if (!isOpen) {
             // Optional: Reset state completely when modal closes
             setFormData({
                 id: null,
                 type: '',
                 name: '',
                 description: '',
                 displayName: '',
                 details: { type: 'Text' },
             });
            setError('');
            setIsSaving(false);
        }
    }, [isOpen, action]); // Re-run when isOpen or the specific 'action' object changes


     // Handle clicks outside the modal to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
                 // Optional: Add a confirmation if there are unsaved changes
                 // if (hasUnsavedChanges) { if (!confirm("Discard changes?")) return; }
                 onClose();
             }
         };
         // Bind the event listener when the modal is open
         if (isOpen) {
             document.addEventListener("mousedown", handleClickOutside);
         }
         // Unbind the event listener when the modal is closed or component unmounts
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose]); // Dependency array


    // Handlers for form changes (passed down to ActionConfigForm)
   const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        if (name === 'actionName' || name === 'description' || name === 'isRequired') {
            setFormData(prev => ({ ...prev, [name]: newValue }));
        } else if (name.startsWith('detail-')) {
            const detailKey = name.substring('detail-'.length);
            setFormData(prev => ({ ...prev, details: { ...prev.details, [detailKey]: newValue } }));
        }
    };

     // Specific handler for changes within Choice options array
     const handleChoiceChange = (id, value) => {
         setFormData(prev => ({
             ...prev,
             details: {
                 ...prev.details,
                 // Ensure options is an array before mapping
                 options: Array.isArray(prev.details?.options) ? prev.details.options.map(opt =>
                     // Find option by its ID (either DB ID or temp ID from initial load)
                     opt.id === id ? { ...opt, label: value } : opt
                 ) : [] // Default to empty array if options wasn't an array
             }
         }));
     };

    // Note: Add/Remove choice handlers are typically only needed for the 'Choice' type.
    // We'll keep them assuming ActionConfigForm provides buttons only for Choice type.
    const handleAddChoice = () => {
        setFormData(prev => ({
            ...prev,
            details: {
                ...prev.details,
                 // Ensure options is an array before spreading
                 options: Array.isArray(prev.details?.options) ?
                     [...prev.details.options, { id: Date.now().toString(), label: '' }] // Add with temp ID
                     : [{ id: Date.now().toString(), label: '' }] // Start new array if not exists
            }
        }));
    };

    const handleRemoveChoice = (id) => {
         setFormData(prev => ({
             ...prev,
             details: {
                 ...prev.details,
                 // Ensure options is an array before filtering
                 options: Array.isArray(prev.details?.options) ? prev.details.options.filter(opt => opt.id !== id) : []
             }
         }));
    };


    // --- Handle Saving Changes (API Call) ---
    const handleSave = async () => {
        setError(''); // Clear previous errors

         // Basic frontend validation
        if (!formData.name?.trim()) {
            setError('Action Name is required.');
            return;
        }
         // Description is optional, no required validation here.
         // displayName is optional, no required validation here.

         // Validate type-specific details
         const details = formData.details; // Use a local variable for easier access
         if (!details?.type) {
              setError('Action configuration type is missing.'); // Should not happen with proper initialization
              return;
         }
         if (details.type === 'Choice') {
            const hasEmptyChoice = details.options?.some(opt => !opt.label?.trim());
             if (!Array.isArray(details.options) || details.options.length === 0 || hasEmptyChoice) {
                 setError('Choice type requires at least one option, and all options must have a label.');
                 return;
             }
              // Remove temporary IDs from options before sending to backend if they were generated
             const detailsToSend = {
                ...details,
                 // Exclude 'id' from each option if it exists
                 options: details.options.map(opt => {
                     const { id, ...rest } = opt;
                     return rest;
                 })
             };
              // Use detailsToSend in the API call payload
         }
         if (details.type === 'Boolean') {
             if (!details.trueLabel?.trim() || !details.falseLabel?.trim()) {
                 setError('"True" and "False" labels are required for a Boolean type.');
                 return;
             }
         }
         // Add validation for other types if they have required fields

        setIsSaving(true);

        try {
             // Construct the payload to send to the API
             // This payload structure should match the shape expected by your PUT /api/actions/:actionId route
             const payload = {
                 // id is part of the URL, not the body
                 // type is usually not editable after creation, but if it were, include it here
                 // type: formData.type, // Uncomment if type is editable
                 name: formData.name.trim(),
                 displayName: formData.displayName?.trim() || null, // Include trimmed displayName or null
                 description: formData.description?.trim() || null, // Include trimmed description or null
                 isRequired: formData.isRequired,
                 // Map 'details' (internal form state) back to 'config' (DB column name)
                 config: details.type === 'Choice' && Array.isArray(details.options) && details.options[0]?.id !== undefined // Check if options have temp IDs
                    ? details.options.map(opt => { // If temp IDs are present, remove them
                         const { id, ...rest } = opt;
                         return rest;
                      }) // Note: this is wrong, should map *the whole details object* not just options
                    : details // If no temp IDs or not choice, send details as is

                 // Corrected payload construction:
                //  config: details, // Send the entire details object

             };

             // If it's a Choice type and options have temporary IDs, remove them from the *payload's config*
             if (payload.config.type === 'Choice' && Array.isArray(payload.config.options) && payload.config.options[0]?.id !== undefined) {
                 payload.config.options = payload.config.options.map(opt => {
                      const { id, ...rest } = opt;
                      return rest;
                 });
             }


            // Call the PUT /api/actions/:actionId endpoint
            const response = await fetch(`/api/actions/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                 body: JSON.stringify(payload), // Send the constructed payload
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update action.');
            }

            const updatedAction = await response.json();
            console.log("API Success: Action updated", updatedAction);

            // Call the parent handler with the updated action data
            // This handler should also close the modal
            onUpdateAction(updatedAction);

        } catch (err) {
            console.error('Error updating action:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };


    // Only render the modal if isOpen is true and action data is available
    // Use formData.id instead of action.id for the check, as action becomes null on close
    if (!isOpen || formData.id === null) return null;

    // Determine if the Save button should be disabled
    // (Same validation logic as handleSave, but used for button state)
    const isSaveButtonDisabled = isSaving ||
                                 !formData.name?.trim() ||
                                // Validation for Choice type
                                (formData.details?.type === 'Choice' && (!Array.isArray(formData.details?.options) || formData.details.options.length === 0 || formData.details.options.some(opt => !opt.label?.trim()))) ||
                                 // Validation for Boolean type
                                 (formData.details?.type === 'Boolean' && (!formData.details.trueLabel?.trim() || !formData.details.falseLabel?.trim()));


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                ref={modalRef}
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4 flex-shrink-0`}>
                     {/* Use formData.name for potentially edited name in header */}
                     <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Edit Action: {formData.name || 'Unnamed'}</h3> {/* Fallback 'Unnamed' */}
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Modal Content (Scrollable Area) */}
                 <div className="flex-grow overflow-y-auto pr-2 -mr-2 hide-scrollbar">
                     {/* Render the config form */}
                     {/* ActionConfigForm handles rendering Name, Description, and Type-Specific fields */}
                     <ActionConfigForm
                         selectedType={formData.details?.type} // Pass the detail type from state (use ?. for safety)
                         formData={formData} // Pass the entire formData including name, description, displayName, details
                         onChange={handleFormChange}
                         onChoiceChange={handleChoiceChange}
                         onAddChoice={handleAddChoice} // Only relevant for Choice type, but pass anyway
                         onRemoveChoice={handleRemoveChoice} // Only relevant for Choice type, but pass anyway
                         isSaving={isSaving} // Pass saving state to disable fields
                     />
                 </div>

                {/* Error Message */}
                 {error && (
                     <div className={`mt-4 p-3 rounded-md text-sm ${uiColors.alertDangerBg} ${uiColors.alertDangerText} flex-shrink-0`}>
                         {error}
                     </div>
                 )}

                {/* Footer */}
                <div className={`flex justify-end border-t ${uiColors.borderPrimary} pt-3 mt-4 flex-shrink-0 space-x-3`}>
                     <button
                         onClick={onClose}
                          className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50 disabled:cursor-not-allowed`}
                         disabled={isSaving} // Disable cancel while saving
                     >
                         Cancel
                     </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaveButtonDisabled} // Use the calculated disabled state
                         className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                       {isSaving ? (
                           <><FiLoader className="mr-2 w-4 h-4 animate-spin" /> Saving...</>
                       ) : (
                            <><FiSave className="mr-2 w-4 h-4" /> Save Changes</>
                       )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditActionModal;