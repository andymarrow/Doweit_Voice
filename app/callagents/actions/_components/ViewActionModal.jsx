// /app/callagents/actions/_components/ViewActionModal.jsx
"use client";

import React, { useEffect, useRef } from 'react';
import { FiX, FiBookOpen, FiList, FiCheckCircle, FiXCircle, FiPhoneCall } from 'react-icons/fi';

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants';

// Helper function to render action details for viewing based on action.config (from DB)
// Updated to use 'config' instead of 'details'
const renderFullActionDetails = (action) => {
     // Check action.config instead of action.details
     if (!action || !action.config) {
         return <p className={`text-sm italic ${uiColors.textSecondary}`}>No configuration details available.</p>;
     }

     // Use 'config' variable for clarity within the switch
     const config = action.config;
     const detailType = config.type; // Access type from the config JSONB

     switch (detailType) {
         case 'Text':
             return (
                 <div className="space-y-2">
                     <p className={`text-sm ${uiColors.textSecondary}`}>Type: <span className={`${uiColors.textPrimary} font-medium`}>Open Question (Text)</span></p>
                     {/* Add other text-specific details from config if you stored them */}
                     {/* Example: if you had config.placeholder */}
                     {/* {config.placeholder && <p className={`text-sm ${uiColors.textSecondary}`}>Placeholder: <span className={`${uiColors.textPrimary}`}>{config.placeholder}</span></p>} */}
                 </div>
             );
         case 'Boolean':
              return (
                 <div className="space-y-2">
                      <p className={`text-sm ${uiColors.textSecondary}`}>Type: <span className={`${uiColors.textPrimary} font-medium`}>Boolean (Yes/No)</span></p>
                      {/* Access trueLabel and falseLabel from config */}
                      <p className={`text-sm ${uiColors.textSecondary}`}>"True" Label: <span className={`${uiColors.textPrimary}`}>{config.trueLabel || 'Yes'}</span></p>
                      <p className={`text-sm ${uiColors.textSecondary}`}>"False" Label: <span className={`${uiColors.textPrimary}`}>{config.falseLabel || 'No'}</span></p>
                 </div>
              );
         case 'Choice':
              return (
                  <div className="space-y-2">
                      <p className={`text-sm ${uiColors.textSecondary}`}>Type: <span className={`${uiColors.textPrimary} font-medium`}>Multiple Choice</span></p>
                       <p className={`text-sm ${uiColors.textSecondary}`}>Choices:</p>
                      {/* Access options from config and check if it's an array */}
                      <ul className="list-disc list-inside ml-2">
                          {Array.isArray(config.options) && config.options.length > 0 ? (
                               // Ensure options have a label property before accessing
                               config.options.map((opt, index) => (
                                   <li key={opt.id || index} className={`text-sm ${uiColors.textPrimary}`}>{opt.label || 'Unnamed choice'}</li>
                               ))
                          ) : (
                              <li className={`text-sm italic ${uiColors.textSecondary}`}>No choices defined.</li>
                          )}
                      </ul>
                  </div>
              );
          case 'Action': // For general 'Action Type'
               return (
                   <div className="space-y-2">
                       <p className={`text-sm ${uiColors.textSecondary}`}>Type: <span className={`${uiColors.textPrimary} font-medium`}>Custom Action</span></p>
                        {/* Display specific nested config details if available */}
                       {action.name === 'transfer_to_human' && config.config?.number && ( // Check config.config
                            <p className={`text-sm ${uiColors.textSecondary}`}>Transfer Number: <span className={`${uiColors.textPrimary}`}>{config.config.number}</span></p>
                       )}
                       {action.name === 'send_sms_confirmation' && config.config?.templateId && ( // Check config.config
                            <p className={`text-sm ${uiColors.textSecondary}`}>SMS Template ID: <span className={`${uiColors.textPrimary}`}>{config.config.templateId}</span></p>
                       )}
                        {/* Add more cases for other action types */}
                   </div>
               );
         default:
              // Fallback for unhandled config types
             return <p className={`text-sm italic ${uiColors.textSecondary}`}>Details for this type ({detailType}) are not fully displayed here.</p>;
     }
};


function ViewActionModal({ isOpen, onClose, action }) {
     const modalRef = useRef(null);

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


     // Only render if open and action data is available
     if (!isOpen || !action) return null;

     return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
             <div
                 ref={modalRef} // Attach ref
                 className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] flex flex-col`}
                 onClick={(e) => e.stopPropagation()}
             >
                 {/* Header */}
                 <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4 flex-shrink-0`}>
                     <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>View Action Details</h3>
                     <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                         <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                     </button>
                 </div>

                 {/* Content (Scrollable area) */}
                 <div className="flex-grow overflow-y-auto pr-2 -mr-2 hide-scrollbar space-y-4">
                     <div>
                         <p className={`text-sm ${uiColors.textSecondary}`}>Action Name: <span className={`font-medium ${uiColors.textPrimary}`}>{action.name || 'N/A'}</span></p>
                         <p className={`text-sm ${uiColors.textSecondary}`}>Broad Type: <span className={`font-medium ${uiColors.textPrimary}`}>{action.type || 'N/A'}</span></p>
                          {/* Display the description if it exists */}
                          {action.description && (
                              <p className={`text-sm ${uiColors.textSecondary}`}>Description: <span className={`font-normal italic ${uiColors.textPrimary}`}>{action.description}</span></p>
                          )}
                     </div>

                     <div>
                         <h4 className={`text-base font-semibold mb-2 ${uiColors.textPrimary}`}>Configuration Details:</h4>
                         {/* Pass the action object to the helper, which now uses action.config */}
                         {renderFullActionDetails(action)}
                     </div>

                     {/* Optional: Add other action properties if they exist, like source, creation date, etc. */}
                     <div className={`text-sm ${uiColors.textSecondary} space-y-1`}>
                          <p>Source: <span className={`${uiColors.textPrimary}`}>{action.source || 'N/A'}</span></p>
                          <p>Created At: <span className={`${uiColors.textPrimary}`}>{action.createdAt ? new Date(action.createdAt).toLocaleString() : 'N/A'}</span></p>
                          {/* Add updated at if relevant */}
                     </div>

                 </div>

                 {/* Footer */}
                 <div className={`flex justify-end border-t ${uiColors.borderPrimary} pt-3 mt-4 flex-shrink-0`}>
                     <button
                          onClick={onClose}
                          className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                     >
                         Close
                     </button>
                 </div>
             </div>
         </div>
     );
}

export default ViewActionModal;