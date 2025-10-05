// In: voice-agents-CallAgents/[agentid]/configure/_components/AgentConfigTabs.jsx
"use client";

import React from 'react';
import {
    FiSettings, FiVolume2, FiPhoneCall
} from 'react-icons/fi';
import { uiColors } from '@/app/callagents/_constants/uiConstants';

const configTabs = [
    { name: 'General', key: 'general', icon: FiSettings },
    { name: 'Voice', key: 'voice', icon: FiVolume2 },
    { name: 'Call Configuration', key: 'call-configuration', icon: FiPhoneCall },
];

function AgentConfigTabs({ activeTab, onTabChange }) {
    return (
        // This outer container provides the bottom border and establishes a block context.
        <div className={`w-full border-b ${uiColors.borderPrimary} mb-6`}>
            
            {/* --- THE DEFINITIVE FIX IS HERE --- */}
            {/* This div is the key.
                - `overflow-x-auto`:  This is what enables horizontal scrolling.
                - `flex`:             Makes its direct children (the buttons) flex items.
                - `whitespace-nowrap`: Prevents the buttons from wrapping to a new line.
                - `hide-scrollbar`:   (Optional but recommended) Hides the ugly scrollbar.
            */}
            <div className="flex overflow-x-auto whitespace-nowrap hide-scrollbar">
                {configTabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            // `flex-shrink-0` is crucial to stop the buttons from being squashed.
                            className={`flex-shrink-0 flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px]
                                        ${isActive
                                            ? `text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400 font-semibold`
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