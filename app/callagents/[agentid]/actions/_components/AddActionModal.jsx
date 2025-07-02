// voice-agents-CallAgents/[agentid]/actions/_components/AddActionModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiPlusCircle, FiBookOpen, FiList, FiPhoneCall, FiLoader } from 'react-icons/fi'; // Icons
import { toast } from 'react-hot-toast'; // Assuming toast is available

// Import constants - Adjust path as necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Using the path provided by the user

// Helper function to fetch available global actions
const fetchAvailableActions = async ({ agentId }) => {
    const response = await fetch(`/api/callagents/${agentId}/actions/actionspage`); // Call the new API endpoint
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch available actions');
    }
    return response.json(); // Returns array of global action objects
};

// Placeholder function to get icon based on detail type (can reuse from ActionList)
const getDetailIcon = (detail) => {
    switch (detail) {
        case 'Open Question':
            return <FiBookOpen className={`w-3 h-3 ${uiColors.textSecondary}`} />;
        case 'Single Choice':
            return <FiList className={`w-3 h-3 ${uiColors.textSecondary}`} />;
        case 'Connects to Agent':
             return <FiPhoneCall className={`w-3 h-3 ${uiColors.textSecondary}`} />;
        // Add more cases
        default:
            return null;
    }
};


// Receive isOpen, onClose, and onAddActions handler from parent
// Also receive isAddingActions state from parent to disable interaction
function AddActionModal({ isOpen, onClose, onAddActions, isAddingActions, agentId }) { // Removed agentId as it's not used here directly

    const [searchTerm, setSearchTerm] = useState('');
    const [availableActions, setAvailableActions] = useState([]); // State for fetched available actions
    const [isLoading, setIsLoading] = useState(true); // Simulate loading available actions
    const [fetchError, setFetchError] = useState(null); // State for fetch error

    // State for actions selected within the modal
    const [selectedActionIds, setSelectedActionIds] = useState([]);

    const modalRef = useRef(null); // Ref for the modal content

    // Effect to load available actions when the modal opens
    useEffect(() => {
         if (isOpen) {
             const loadAvailableActions = async () => {
                 setIsLoading(true);
                 setFetchError(null);
                 try {
                      console.log("[Add Action Modal] Fetching available actions...");
                      const fetchedActions = await fetchAvailableActions({ agentId });
                      console.log("[Add Action Modal] Fetched available actions:", fetchedActions);
                      setAvailableActions(fetchedActions);
                 } catch (err) {
                     console.error('[Add Action Modal] Error loading available actions:', err);
                     setFetchError(err.message);
                     setAvailableActions([]); // Clear list on error
                 } finally {
                     setIsLoading(false);
                      setSelectedActionIds([]); // Always reset selections when opening modal
                 }
             };
             loadAvailableActions();
         }
    }, [isOpen]); // Effect runs when modal opens

     // Handle clicks outside the modal to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             // Check if modalRef exists and if the click is outside the modal content
             // Also check if the modal is open and we are not currently adding actions
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !isAddingActions) {
                 onClose();
             }
         };
         // Add or remove the event listener based on modal state
         if (isOpen) {
             document.addEventListener("mousedown", handleClickOutside);
         }
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose, isAddingActions]); // Depend on isOpen, onClose, isAddingActions

    // Filter available actions based on search term
    const filteredActions = availableActions.filter(action =>
        (action.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (action.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) || // Search display name too
        (action.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (action.details || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle checkbox change
    const handleCheckboxChange = (actionId) => {
        setSelectedActionIds(prevSelected =>
            prevSelected.includes(actionId)
                ? prevSelected.filter(id => id !== actionId) // Deselect
                : [...prevSelected, actionId] // Select
        );
    };

    // Handle adding selected actions
    const handleAddSelected = () => {
        // Find the full action objects based on selected IDs
        const actionsToAdd = availableActions.filter(action => selectedActionIds.includes(action.id));
        if (actionsToAdd.length > 0) {
            onAddActions(actionsToAdd); // Pass selected action objects back to parent
            // Parent handles closing modal on success
        }
    };

    // Disable modal content interaction while saving/adding
    const isModalDisabled = isLoading || isAddingActions;


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                ref={modalRef} // Attach ref
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col ${isModalDisabled ? 'pointer-events-none' : ''}`} // Add pointer-events-none when disabled
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4 flex-shrink-0`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Add Actions</h3>
                    {/* Disable close button when adding */}
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${isAddingActions ? 'opacity-50 cursor-not-allowed' : ''}`} title="Close" disabled={isAddingActions}>
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Search Input */}
                <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary} mb-4 flex-shrink-0 ${isModalDisabled ? 'opacity-50' : ''}`}>
                     <FiSearch className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                     <input
                         type="text"
                         placeholder="Search actions..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none ${isModalDisabled ? 'cursor-not-allowed' : ''}`}
                         disabled={isModalDisabled}
                     />
                </div>

                 {/* Error message area */}
                 {fetchError && (
                     <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm flex-shrink-0`}>
                          Error loading actions: {fetchError}
                     </div>
                 )}


                {/* Available Actions List */}
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 hide-scrollbar">
                    {isLoading ? (
                         <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                             <FiLoader className="animate-spin mx-auto w-6 h-6 mb-3" /> Loading available actions...
                         </div>
                    ) : fetchError ? (
                         // If fetchError occurred, don't show actions list
                         null
                    ) : filteredActions.length === 0 ? (
                        <div className={`text-center py-10 ${uiColors.textSecondary}`}>No actions found matching your search.</div>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {filteredActions.map(action => (
                                 <div
                                      key={action.id} // Key is the global action ID
                                      className={`flex items-center rounded-md border p-3 cursor-pointer ${uiColors.bgSecondary} ${uiColors.borderPrimary} ${selectedActionIds.includes(action.id) ? uiColors.accentSubtleBg : uiColors.hoverBgSubtle} ${isAddingActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      onClick={() => !isAddingActions && handleCheckboxChange(action.id)} // Prevent click when adding
                                 >
                                     {/* Checkbox */}
                                     <input
                                         type="checkbox"
                                         id={`action-${action.id}`} // Added ID for accessibility
                                         checked={selectedActionIds.includes(action.id)}
                                         onChange={() => handleCheckboxChange(action.id)} // Keep this for standard form submission, but click handler on div is primary UX
                                          className={`form-checkbox h-4 w-4 rounded ${uiColors.accentPrimary} focus:ring-${uiColors.accentPrimaryText} border-gray-300 ${isAddingActions ? 'cursor-not-allowed' : ''}`}
                                          disabled={isAddingActions} // Disable checkbox when adding
                                     />
                                     {/* Action Details */}
                                      {/* Label targeting the checkbox ID */}
                                       <label htmlFor={`action-${action.id}`} className={`ml-3 flex-grow cursor-pointer ${isAddingActions ? 'cursor-not-allowed' : ''}`}>
                                          <div className={`font-semibold text-sm ${uiColors.textPrimary}`}>{action.name || action.displayName}</div> {/* Use display name if available */}
                                          <div className={`flex items-center text-xs ${uiColors.textSecondary}`}>
                                              {getDetailIcon(action.details)}
                                               <span className="ml-1">{action.details}</span>
                                           </div>
                                           <div>
                                                <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded ${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}`}>
                                                    {action.type} ({action.source}) {/* Show source too */}
                                                </span>
                                           </div>
                                       </label>

                                 </div>
                             ))}
                         </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex justify-end border-t ${uiColors.borderPrimary} pt-3 mt-4 flex-shrink-0`}>
                    <button
                         onClick={handleAddSelected}
                         disabled={selectedActionIds.length === 0 || isLoading || isAddingActions} // Disable if no selection, loading, or already adding
                         className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                         {isAddingActions ? (
                             <FiLoader className="animate-spin mr-2 w-4 h-4" />
                         ) : (
                             <FiPlusCircle className="mr-2 w-4 h-4" />
                         )}
                         {isAddingActions ? 'Adding...' : `Add ${selectedActionIds.length > 0 ? `(${selectedActionIds.length})` : ''} Action${selectedActionIds.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddActionModal;