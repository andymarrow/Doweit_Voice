// voice-agents-CallAgents/[agentid]/calls/_components/CallDetailTabs.jsx
"use client";

import React from 'react';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; 

const detailTabs = [
    { name: 'Transcript', key: 'transcript' },
    { name: 'Actions', key: 'actions' },
    { name: 'Download / Delete', key: 'download' },
];

function CallDetailTabs({ activeTab, onTabChange }) {

    return (
        <div className={`flex border-b ${uiColors.borderPrimary} mb-4 flex-shrink-0`}> {/* Container with bottom border, prevent shrinking */}
            {detailTabs.map((tab) => {
                 const isActive = activeTab === tab.key;

                return (
                     <button
                         key={tab.key}
                         onClick={() => onTabChange(tab.key)} // Call parent handler
                          className={`flex-grow text-center px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] // Offset border
                                       ${isActive
                                            ? `${uiColors.accentPrimary} border-${uiColors.accentPrimaryText}` // Use accent color for active
                                            : `${uiColors.textSecondary} border-transparent ${uiColors.hoverText}` // Default and hover
                                        }`}
                     >
                         {tab.name} {/* Tab name */}
                     </button>
                );
            })}
        </div>
    );
}

export default CallDetailTabs;