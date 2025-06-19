// voice-agents-CallAgents/[agentid]/_components/AgentConfigTabs.jsx
"use client";

import React from 'react';
// Remove usePathname and Link imports as we'll use buttons
// import { usePathname } from 'next/navigation';
// import Link from 'next/link';

import {
    FiSettings, FiVolume2, FiPhoneCall // Icons for tabs
} from 'react-icons/fi';

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Ensure correct import path

const configTabs = [
    { name: 'General', key: 'general', icon: FiSettings },
    { name: 'Voice', key: 'voice', icon: FiVolume2 },
    { name: 'Call Configuration', key: 'call-configuration', icon: FiPhoneCall },
];

// No need for agentId prop here anymore, it's only used to construct URLs in the sidebar
// function AgentConfigTabs({ agentId, activeTab, onTabChange }) {
function AgentConfigTabs({ activeTab, onTabChange }) { // Remove agentId prop

    // usePathname is no longer needed here
    // const pathname = usePathname();

    return (
        <div className={`flex border-b ${uiColors.borderPrimary} mb-6`}>
            {configTabs.map((tab) => {
                 const isActive = activeTab === tab.key;

                return (
                     // Use a button instead of a Link
                     <button
                         key={tab.key}
                         onClick={() => onTabChange(tab.key)} // Call parent handler
                          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] // Offset border
                                       ${isActive
                                            ? `${uiColors.accentPrimary} border-${uiColors.accentPrimaryText}`
                                            : `${uiColors.textSecondary} border-transparent ${uiColors.hoverText}`
                                        }`}
                     >
                         <tab.icon className="mr-2 w-4 h-4" />
                         {tab.name}
                     </button>
                );
            })}
        </div>
    );
}

export default AgentConfigTabs;