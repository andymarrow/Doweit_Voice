// app/callagents/knowledgebase/[knowledgebaseid]/_components/KbDetailsForm.jsx
"use client";

import React from 'react';
import { FiSave, FiLoader } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../../_constants/uiConstants'; // Adjust path


// Receive KB data (for display/initial state), editable state, handlers, and ownership/saving status
function KbDetailsForm({ kb, editState, onEditStateChange, onSave, isSaving, isOwner, isDirty }) {

    // Determine if the form fields should be disabled (not owner or currently saving)
    const isFormDisabled = !isOwner || isSaving;

    // Note: `kb` holds the original/last-saved data. `editState` holds current input values.
    // We display `kb` data if not owned, and `editState` data if owned (as it's editable).

    return (
        <div className="space-y-6">
            {/* Name Input/Display */}
            <div>
                <label htmlFor="kbName" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                    Name {isOwner && <span className="text-red-500">*</span>} {/* Indicate required only if editable */}
                </label>
                 {/* Display read-only value if not owner, otherwise use input */}
                 {!isOwner ? (
                     <p className={`text-base ${uiColors.textPrimary} p-2`}>{kb.name || 'Unnamed'}</p>
                 ) : (
                     <input
                         type="text"
                         id="kbName"
                         value={editState.name} // Use value from editState
                         onChange={(e) => onEditStateChange('name', e.target.value)} // Call parent handler
                         disabled={isFormDisabled}
                         className={`block w-full sm:max-w-md p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                         placeholder="Knowledge Base Name"
                          required={isOwner} // HTML5 required only if owner
                     />
                 )}
            </div>

            {/* Description Textarea/Display */}
            <div>
                <label htmlFor="kbDescription" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                    Description
                </label>
                 {/* Display read-only value if not owner, otherwise use textarea */}
                {!isOwner ? (
                     <p className={`text-base ${uiColors.textPrimary} p-2 whitespace-pre-wrap`}>{kb.description || 'No description provided.'}</p>
                 ) : (
                     <textarea
                         id="kbDescription"
                         value={editState.description} // Use value from editState
                         onChange={(e) => onEditStateChange('description', e.target.value)} // Call parent handler
                         disabled={isFormDisabled}
                         className={`block w-full sm:max-w-md h-24 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y disabled:opacity-50 disabled:cursor-not-allowed`}
                         placeholder="Briefly describe the purpose of this knowledge base."
                     ></textarea>
                 )}
            </div>

            {/* isPublic Toggle (Show and enable only if owner) */}
            {isOwner && (
                 <div className="flex items-center justify-between w-full sm:max-w-md">
                     <div>
                         <label htmlFor="kbIsPublicToggle" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                              Make Public
                         </label>
                         <p className={`text-xs ${uiColors.textPlaceholder}`}>
                              Allow other users to view and use this Knowledge Base as a template.
                         </p>
                     </div>
                     <button
                          id="kbIsPublicToggle"
                           // Use value from editState, pass toggled boolean to handler
                          onClick={() => onEditStateChange('isPublic', !editState.isPublic)}
                          disabled={isFormDisabled} // Disable button
                          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary} disabled:opacity-50 disabled:cursor-not-allowed
                                      ${editState.isPublic ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
                     >
                         <span className={`sr-only`}>Toggle public status</span>
                          <span
                             aria-hidden="true"
                             className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                         ${editState.isPublic ? 'translate-x-5' : 'translate-x-0'}`}
                         ></span>
                     </button>
                </div>
            )}


            {/* Save Button (Show only if owner, dirty, and not saving) */}
            {isOwner && isDirty && !isSaving && ( // Show only if owner AND dirty AND not saving
                 <div className="flex justify-end">
                     <button
                         type="button"
                         onClick={onSave} // Call parent save handler
                         disabled={isSaving || !isDirty || !editState.name.trim()} // Disable if saving, not dirty, or name is empty
                          className={`inline-flex items-center px-6 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                         {isSaving ? <FiLoader className="mr-2 w-4 h-4 animate-spin" /> : <FiSave className="mr-2 w-4 h-4" />}
                         Save Changes
                     </button>
                 </div>
            )}
             {/* Optional: Show Saving... state even if button hidden */}
             {isSaving && isOwner && (
                  <div className="flex justify-end">
                      <span className={`inline-flex items-center px-6 py-2 text-sm font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${uiColors.bgSecondary} ${uiColors.textPrimary}`}>
                           <FiLoader className="mr-2 w-4 h-4 animate-spin" /> Saving...
                      </span>
                  </div>
             )}


        </div>
    );
}

export default KbDetailsForm;