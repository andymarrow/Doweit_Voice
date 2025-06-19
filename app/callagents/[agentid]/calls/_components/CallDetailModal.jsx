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

const detailTabs = [
    { name: 'Transcript', key: 'transcript' },
    { name: 'Actions', key: 'actions' },
    { name: 'Download / Delete', key: 'download' },
];

const tabContentComponents = {
    transcript: TranscriptTab,
    actions: ActionsDataTab,
    download: DownloadDeleteTab,
};


function CallDetailModal({ isOpen, onClose, callData, onDeleteCall }) { // Receive callData and delete handler

    const [activeTab, setActiveTab] = useState('transcript'); // Default active tab
    const modalRef = useRef(null); // Ref for modal content

    // Reset active tab and scroll position when modal opens/callData changes
    useEffect(() => {
        if (isOpen && callData) {
             setActiveTab('transcript'); // Always start on the Transcript tab
             // Reset scroll position if needed - often handled by overflow styles
        }
    }, [isOpen, callData]); // Re-run when modal opens or a different call is selected

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


    // Render nothing if not open or no data
    if (!isOpen || !callData) return null;

    // Get the content component based on the active tab
    const CurrentTabComponent = tabContentComponents[activeTab];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                ref={modalRef} // Attach ref
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col`} // Max width, height, flex column layout
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} px-6 py-4 flex-shrink-0`}> {/* Padding adjusted */}
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Call Details</h3>
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Agent/Caller Info (Optional - display summary here) */}
                 <div className={`px-6 py-3 text-sm ${uiColors.textSecondary} flex items-center justify-between border-b ${uiColors.borderPrimary} flex-shrink-0`}>
                     <span>Agent: <strong className={`${uiColors.textPrimary}`}>{callData.agentName}</strong></span>
                     <span>Caller: <strong className={`${uiColors.textPrimary}`}>{callData.callerName || callData.callerNumber || 'Unknown'}</strong></span>
                      {/* Add more key details if desired */}
                 </div>


                {/* Tabs */}
                 <div className="px-6 pt-4 flex-shrink-0"> {/* Padding and prevent shrinking */}
                    <CallDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />
                 </div>


                {/* Tab Content Area */}
                {/* flex-grow to take remaining space, overflow-y-auto to make content scrollable */}
                 <div className="flex-grow overflow-y-auto px-6 py-4 hide-scrollbar"> {/* Added padding here */}
                     {/* Render the active tab component */}
                     {CurrentTabComponent ? (
                         <CurrentTabComponent
                             callData={callData} // Pass all call data to tabs
                             // Or pass specific data:
                             // transcript={callData.transcript}
                             // actionsData={callData.actionsData}
                             // audioUrl={callData.audioUrl}
                             onDeleteCall={onDeleteCall} // Pass delete handler to Download/Delete tab
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