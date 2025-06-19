// voice-agents-CallAgents/[agentid]/actions/_components/ActionTabs.jsx
"use client";

import React from 'react';
// No Link needed as these are internal tab switches
// import Link from 'next/link';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; 

// Define action tab structure
const actionTabs = [
    { name: 'Before the Call', key: 'before' },
    { name: 'During the Call', key: 'during' },
    { name: 'After the Call', key: 'after' },
];

// Receive activeTab string, onTabChange function, and counts object
function ActionTabs({ activeTab, onTabChange, counts }) {

    return (
        <div className={`flex border-b ${uiColors.borderPrimary} mb-6`}> {/* Container with bottom border */}
            {actionTabs.map((tab) => {
                 const isActive = activeTab === tab.key;
                 const count = counts[tab.key] || 0; // Get count for the tab

                return (
                     <button
                         key={tab.key}
                         onClick={() => onTabChange(tab.key)} // Call parent handler
                          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] // Offset border
                                       ${isActive
                                            ? `${uiColors.accentPrimary} border-${uiColors.accentPrimaryText}` // Use accent color for active
                                            : `${uiColors.textSecondary} border-transparent ${uiColors.hoverText}` // Default and hover
                                        }`}
                     >
                         {tab.name} {/* Tab name */}
                         <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${isActive ? `${uiColors.accentBadgeBg} ${uiColors.accentBadgeText}` : `${uiColors.bgSecondary} ${uiColors.textPrimary}`}`}> {/* Count badge */}
                             {count}
                         </span>
                     </button>
                );
            })}
        </div>
    );
}

export default ActionTabs;