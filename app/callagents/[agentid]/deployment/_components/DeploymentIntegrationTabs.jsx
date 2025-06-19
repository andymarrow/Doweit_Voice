// voice-agents-CallAgents/[agentid]/deployment/_components/DeploymentIntegrationTabs.jsx
"use client";

import React from 'react';
// No Link needed as these are internal tab switches

// Import constants - Adjust path as necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; 
// Import integration icons if available, using placeholders for now
import { FiBarChart2, FiZap, FiGlobe } from 'react-icons/fi';


// Define integration tab structure
const integrationTabs = [
    { name: 'GoHighLevel', key: 'gohighlevel', icon: FiBarChart2 }, // Using FiBarChart2 as placeholder
    { name: 'Zapier', key: 'zapier', icon: FiZap },
    { name: 'Rest API', key: 'restapi', icon: FiGlobe }, // Using FiGlobe as placeholder
];

// Receive activeTab string and onTabChange function
function DeploymentIntegrationTabs({ activeTab, onTabChange }) {

    return (
        <div className={`flex border-b ${uiColors.borderPrimary} mb-6`}> {/* Container with bottom border */}
            {integrationTabs.map((tab) => {
                 const isActive = activeTab === tab.key;

                return (
                     <button
                         key={tab.key}
                         onClick={() => onTabChange(tab.key)} 
                          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] // Offset border
                                       ${isActive
                                            ? `${uiColors.accentPrimary} border-${uiColors.accentPrimaryText}` // Use accent color for active
                                            : `${uiColors.textSecondary} border-transparent ${uiColors.hoverText}` // Default and hover
                                        }`}
                     >
                          {/* Render icon only if it exists */}
                          {tab.icon && <tab.icon className="mr-2 w-4 h-4" />}
                         {tab.name} {/* Tab name */}
                     </button>
                );
            })}
        </div>
    );
}

export default DeploymentIntegrationTabs;