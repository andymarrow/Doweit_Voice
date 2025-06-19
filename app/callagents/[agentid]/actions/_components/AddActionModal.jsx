// voice-agents-CallAgents/[agentid]/actions/_components/AddActionModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiPlusCircle, FiBookOpen, FiList, FiPhoneCall } from 'react-icons/fi'; // Icons

// Import constants - Adjust path as necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Using the path provided by the user

// Simulate available actions (replace with API call in a real app)
const availableActions = [
    { id: 'ie-firstname', type: 'Information Extractor', name: 'first_name', details: 'Open Question' },
    { id: 'ie-lastname', type: 'Information Extractor', name: 'last_name', details: 'Open Question' },
    { id: 'ie-phone', type: 'Information Extractor', name: 'preferred_phone_number', details: 'Open Question' },
    { id: 'ie-specialrequests', type: 'Information Extractor', name: 'special_requests', details: 'Open Question' },
    { id: 'ie-pickupdelivery', type: 'Information Extractor', name: 'pickup or delivery', details: 'Single Choice' },
    { id: 'ie-orderquantity', type: 'Information Extractor', name: 'capture order items and quantity', details: 'Open Question' },
    { id: 'ie-sidesdrinks', type: 'Information Extractor', name: 'sides or drinks', details: 'Open Question' },
    { id: 'ie-allergies', type: 'Information Extractor', name: 'have allergies or special requests', details: 'Open Question' },
    { id: 'ie-address', type: 'Information Extractor', name: 'users address', details: 'Open Question' },
    { id: 'at-transfer', type: 'Action Type', name: 'Transfer to Human', details: 'Connects to Agent' },
    { id: 'at-sms', type: 'Action Type', name: 'Send SMS', details: 'Message Template' },
     // Add more placeholder actions...
];

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


function AddActionModal({ isOpen, onClose, onAddActions }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedActionIds, setSelectedActionIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Simulate loading available actions

    const modalRef = useRef(null); // Ref for the modal content

    // Simulate loading available actions
    useEffect(() => {
         if (isOpen) {
             setIsLoading(true);
              // --- Simulate API Call ---
             setTimeout(() => {
                 // In a real app, you'd fetch available actions here
                 setIsLoading(false);
                 setSelectedActionIds([]); // Reset selections when opening
             }, 300); // Simulate load time
              // --- End Simulate API Call ---
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


    // Filter available actions based on search term
    const filteredActions = availableActions.filter(action =>
        action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.details.toLowerCase().includes(searchTerm.toLowerCase())
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
        const actionsToAdd = availableActions.filter(action => selectedActionIds.includes(action.id));
        if (actionsToAdd.length > 0) {
            onAddActions(actionsToAdd); // Pass selected actions back to parent
            onClose(); // Close the modal
        }
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
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Add Actions</h3>
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Search Input */}
                <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary} mb-4 flex-shrink-0`}>
                     <FiSearch className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                     <input
                         type="text"
                         placeholder="Search actions..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none`}
                     />
                </div>

                {/* Available Actions List */}
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 hide-scrollbar">
                    {isLoading ? (
                         <div className={`text-center py-10 ${uiColors.textSecondary}`}>Loading available actions...</div>
                    ) : filteredActions.length === 0 ? (
                        <div className={`text-center py-10 ${uiColors.textSecondary}`}>No actions found.</div>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {filteredActions.map(action => (
                                 <div key={action.id} className={`flex items-center ${uiColors.bgSecondary} rounded-md border ${uiColors.borderPrimary} p-3 cursor-pointer`} onClick={() => handleCheckboxChange(action.id)}>
                                     {/* Checkbox (visually hidden, controlled by div click) */}
                                     <input
                                         type="checkbox"
                                         id={`action-${action.id}`} // Added ID for accessibility
                                         checked={selectedActionIds.includes(action.id)}
                                         onChange={() => handleCheckboxChange(action.id)}
                                          className={`form-checkbox h-4 w-4 text-blue-600 rounded ${uiColors.accentPrimary} focus:ring-${uiColors.accentPrimaryText} border-gray-300 rounded`}
                                     />
                                     {/* Action Details */}
                                      {/* Label targeting the checkbox ID */}
                                       <label htmlFor={`action-${action.id}`} className="ml-3 flex-grow cursor-pointer">
                                          <div className={`font-semibold text-sm ${uiColors.textPrimary}`}>{action.name}</div>
                                          <div className={`flex items-center text-xs ${uiColors.textSecondary}`}>
                                              {getDetailIcon(action.details)}
                                               <span className="ml-1">{action.details}</span>
                                           </div>
                                           <div>
                                                <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded ${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}`}>
                                                    {action.type}
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
                         // Removed || isSaving from the disabled condition
                         disabled={selectedActionIds.length === 0 || isLoading}
                         className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} ${selectedActionIds.length === 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                         <FiPlusCircle className="mr-2 w-4 h-4" /> Add {selectedActionIds.length > 0 ? `(${selectedActionIds.length})` : ''} Action{selectedActionIds.length !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddActionModal;