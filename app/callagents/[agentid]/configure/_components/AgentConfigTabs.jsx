"use client";

import React from 'react';
import {
    FiSettings, FiVolume2, FiPhoneCall // Icons for tabs
} from 'react-icons/fi';

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Correct import path

const configTabs = [
    { name: 'General', key: 'general', icon: FiSettings },
    { name: 'Voice', key: 'voice', icon: FiVolume2 },
    { name: 'Call Configuration', key: 'call-configuration', icon: FiPhoneCall },
];

// Receiving activeTab and onTabChange from the parent page
function AgentConfigTabs({ activeTab, onTabChange }) {

    return (
        <div className={`flex border-b ${uiColors.borderPrimary} mb-6`}>
            {configTabs.map((tab) => {
                 const isActive = activeTab === tab.key;

                return (
                     // Use a button to trigger the parent's state update
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