// /app/callagents/actions/_components/DeleteConfirmationModal.jsx
"use client";

import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiX, FiLoader, FiTrash2 } from 'react-icons/fi'; // Added FiLoader

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants';

// Added isDeleting prop
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, actionName, isDeleting }) {
    const modalRef = useRef(null);

    // Handle clicks outside the modal to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             // Only close if the click is outside the modal AND the modal is open
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
                 // Optional: Add a confirmation if deletion is in progress? Probably not necessary.
                 if (!isDeleting) { // Only allow closing on outside click if not currently deleting
                     onClose();
                 }
             }
         };
         if (isOpen) {
             document.addEventListener("mousedown", handleClickOutside);
         }
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose, isDeleting]); // Re-run effect if deleting state changes


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { if (!isDeleting) onClose(); }}> {/* Add condition to backdrop click */}
            <div
                 ref={modalRef}
                 className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-sm flex flex-col`}
                 onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4 flex-shrink-0`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Confirm Deletion</h3>
                     {/* Disable close button while deleting */}
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle} disabled:opacity-50 disabled:cursor-not-allowed`} title="Close" disabled={isDeleting}>
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex items-start space-x-4 mb-6">
                     <div className="flex-shrink-0">
                         <FiAlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400 mt-1" />
                     </div>
                     <div>
                         <p className={`text-sm ${uiColors.textSecondary}`}>
                             Are you sure you want to delete the action "<span className="font-semibold">{actionName}</span>"? This action cannot be undone.
                         </p>
                         {/* Optional: Add a warning if action is linked to agents */}
                         {/* <p className={`text-xs mt-2 ${uiColors.textWarning}`}>Warning: This action is currently used by X agents.</p> */}
                     </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                         className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={isDeleting} // Disable cancel while deleting
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm} // This calls the handleConfirmDelete in the parent
                         disabled={isDeleting} // Disable delete button while deleting
                         className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`} // Red color for delete button
                    >
                        {isDeleting ? (
                           <><FiLoader className="mr-2 w-4 h-4 animate-spin" /> Deleting...</>
                        ) : (
                           <><FiTrash2 className="mr-2 w-4 h-4" /> Delete</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmationModal;