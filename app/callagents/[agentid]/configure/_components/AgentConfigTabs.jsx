// callagents/[agentid]/configure/_components/AgentConfigTabs.jsx
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

function AgentConfigTabs({ activeTab, onTabChange }) {

    return (
        // The outer container simply provides the bottom border.
        <div className={`border-b ${uiColors.borderPrimary} mb-6`}>
            {/* --- KEY CHANGE HERE --- */}
            {/* This new wrapper makes the tabs scrollable on small screens.
                - `overflow-x-auto`: Enables horizontal scrolling only when needed.
                - `whitespace-nowrap`: Prevents the tab buttons from wrapping to the next line.
                - `hide-scrollbar`: (Optional but recommended) A utility class to hide the scrollbar UI for a cleaner look.
            */}
            <div className="flex overflow-x-auto whitespace-nowrap hide-scrollbar">
                {configTabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            // `flex-shrink-0` is added to ensure buttons don't get squished by the flex container
                            className={`flex-shrink-0 flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px]
                                        ${isActive
                                            ? `${uiColors.accentPrimaryText} border-purple-600 dark:border-purple-400` // More direct color usage
                                            : `${uiColors.textSecondary} border-transparent ${uiColors.hoverText}`
                                        }`}
                        >
                            <tab.icon className="mr-2 w-4 h-4" />
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default AgentConfigTabs;