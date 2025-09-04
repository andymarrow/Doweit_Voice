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
        <div className={`flex border-b ${uiColors.borderPrimary} mb-4 flex-shrink-0`}>
            {detailTabs.map((tab) => {
                 const isActive = activeTab === tab.key;

                return (
                     <button
                         key={tab.key}
                         onClick={() => onTabChange(tab.key)}
                          // FIX: Replaced dynamic border class with static classes Tailwind can detect.
                          className={`flex-grow text-center px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1.5px]
                                       ${isActive
                                            ? `${uiColors.accentPrimary} border-cyan-500 dark:border-purple-500`
                                            : `${uiColors.textSecondary} border-transparent ${uiColors.hoverBgSubtle} hover:text-gray-800 dark:hover:text-gray-200`
                                        }`}
                     >
                         {tab.name}
                     </button>
                );
            })}
        </div>
    );
}

export default CallDetailTabs;