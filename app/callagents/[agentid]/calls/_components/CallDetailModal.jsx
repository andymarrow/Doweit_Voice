// voice-agents-CallAgents/[agentid]/calls/_components/CallDetailModal.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi'; // Icons

// Import tab components
import CallDetailTabs from './CallDetailTabs';
import TranscriptTab from './TranscriptTab';
import ActionsDataTab from './ActionsDataTab';
import DownloadDeleteTab from './DownloadDeleteTab';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants';

const tabContentComponents = {
    transcript: TranscriptTab,
    actions: ActionsDataTab,
    download: DownloadDeleteTab,
};

// FIX: Accept agentName as a prop
function CallDetailModal({ isOpen, onClose, callData, onDeleteCall, isDeleting, agentName, agentId }) {

    const [activeTab, setActiveTab] = useState('transcript'); // Default active tab
    const modalRef = useRef(null); // Ref for modal content

    // Reset active tab and scroll position when modal opens/callData changes
    useEffect(() => {
        if (isOpen && callData) {
             setActiveTab('transcript'); // Always start on the Transcript tab
             // Reset scroll position if needed - often handled by overflow styles
        }
         // Reset scroll position of the modal content area on tab change
         const contentArea = modalRef.current?.querySelector('.flex-grow.overflow-y-auto');
         if (contentArea) {
             contentArea.scrollTop = 0;
         }
    // FIX: Removed `activeTab` from the dependency array to stop the flashing/resetting bug.
    }, [isOpen, callData]);


     // Handle clicks outside the modal to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             // Only close if the click is outside the modal content AND not during deletion
             if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !isDeleting) { // *** Added !isDeleting ***
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
     }, [isOpen, onClose, isDeleting]); // Depend on isOpen, onClose, isDeleting


    // Render nothing if not open or no data
    if (!isOpen || !callData) return null;

    // Get the content component based on the active tab
    const CurrentTabComponent = tabContentComponents[activeTab];

    // Format start time and duration for display in the header
     const formattedStartTime = callData.startTime ? new Date(callData.startTime).toLocaleString() : 'N/A';
     const formattedDuration = callData.duration !== undefined && callData.duration !== null ? `${callData.duration}s` : callData.duration || 'N/A'; // Assuming duration is in seconds if number

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                ref={modalRef} // Attach ref
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col ${isDeleting ? 'pointer-events-none' : ''}`} // Max width, height, flex column, *** Disable pointer events when deleting ***
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} px-6 py-4 flex-shrink-0`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Call Details ({callData.id})</h3> {/* Display call ID */}
                    {/* Disable close button when deleting */}
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`} title="Close" disabled={isDeleting}> {/* *** Disable when deleting *** */}
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Agent/Caller Info (Optional - display summary here) */}
                 <div className={`px-6 py-3 text-sm ${uiColors.textSecondary} flex items-center justify-between border-b ${uiColors.borderPrimary} flex-shrink-0 flex-wrap gap-2`}> {/* Added flex-wrap and gap */}
                     {/* FIX: Prioritize name from callData, then fallback to prop */}
                     <span>Agent: <strong className={`${uiColors.textPrimary}`}>{callData.agent?.name || agentName || 'N/A'}</strong></span>
                     {/* Note: Your console shows customerName is inside rawCallData */}
                     <span>Caller: <strong className={`${uiColors.textPrimary}`}>{callData.customerName || callData.rawCallData?.customerName || callData.phoneNumber || 'Unknown'}</strong></span>
                      <span>Status: <strong className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                          callData.status === 'Completed' ? `${uiColors.statusBadgeSuccessBg} ${uiColors.statusBadgeSuccessText}` :
                          callData.status === 'Failed' ? `${uiColors.statusBadgeDangerBg} ${uiColors.statusBadgeDangerText}` :
                           callData.status ? `${uiColors.statusBadgeWarningBg} ${uiColors.statusBadgeWarningText}` : // Default/Other status
                           ''
                      }`}>{callData.status || 'N/A'}</strong></span> {/* Status badge */}
                      <span>Start: <strong className={`${uiColors.textPrimary}`}>{formattedStartTime}</strong></span>
                       <span>Duration: <strong className={`${uiColors.textPrimary}`}>{formattedDuration}</strong></span>
                 </div>


                {/* Tabs */}
                 <div className="px-6 pt-4 flex-shrink-0">
                    <CallDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />
                 </div>


                {/* Tab Content Area */}
                 <div className="flex-grow overflow-y-auto px-6 py-4 hide-scrollbar">
                     {CurrentTabComponent ? (
                         <CurrentTabComponent
                             callData={callData} // Pass all call data to tabs
                             onDeleteCall={onDeleteCall} // Pass delete handler only to Download/Delete tab
                             isDeleting={isDeleting} // *** Pass deleting state to tabs ***
                            agentId={agentId}
                         />
                     ) : (
                         <div className={`text-center ${uiColors.textDanger} py-10`}>
                             Error: Tab component not found.
                         </div>
                     )}
                 </div>

            </div>
        </div>
    );
}

export default CallDetailModal;