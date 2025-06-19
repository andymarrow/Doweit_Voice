// voice-agents-CallAgents/[agentid]/configure/page.jsx
"use client";

import React, { useState, useEffect } from 'react'; // Keep useState, useEffect for component mounting logic if needed
import { useParams } from 'next/navigation'; // Only need useParams now

// Import the tab and content components
import AgentConfigTabs from './_components/AgentConfigTabs';
import GeneralConfig from './_components/GeneralConfig';
import VoiceConfig from './_components/VoiceConfig';
import CallConfig from './_components/CallConfig';

// Import constants
import { uiColors } from '../../_constants/uiConstants';  // Corrected path assumption

// Define which content component maps to which tab key
const configComponents = {
    'general': GeneralConfig,
    'voice': VoiceConfig,
    'call-configuration': CallConfig,
};

// Get the keys for validation
const configTabKeys = Object.keys(configComponents);

export default function Configurepage() {
    const params = useParams();
    const agentId = params.agentid;

    // State to control which tab content is displayed
    // Initialize activeTab to 'general'. This page component IS the configure page.
    const [activeTab, setActiveTab] = useState('general');

    // We no longer parse URL segments for tabs within this page.
    // The URL for this page is ALWAYS /callagents/[agentid]/configure.

    // Effect to fetch data if needed based on agentId (not needed for tab switching logic)
    // useEffect(() => {
    //     // Fetch agent configuration data based on agentId
    //     console.log(`Fetching config data for agent ${agentId}`);
    // }, [agentId]); // Dependency on agentId


    // Function to handle tab changes - ONLY updates local state
    const handleTabChange = (tabKey) => {
        // You could add logic here like checking for unsaved changes
        // if (hasUnsavedChanges) {
        //     if (!confirm("You have unsaved changes. Discard?")) {
        //         return; // Stop the tab change
        //     }
        // }
        if (configTabKeys.includes(tabKey)) { // Basic validation
             setActiveTab(tabKey);
        } else {
            console.warn(`Attempted to switch to unknown tab key: ${tabKey}`);
            setActiveTab('general'); // Default to general on invalid key
        }
    };

     // Get the component to render based on the active tab
     const CurrentConfigComponent = configComponents[activeTab];

    return (
        <div className="flex flex-col h-full">
            <h1 className={`text-2xl font-bold mb-6 ${uiColors.textPrimary}`}>Configure</h1>

            {/* Render the tabs */}
            <AgentConfigTabs
                agentId={agentId} // Still pass agentId if tabs need it
                activeTab={activeTab}
                onTabChange={handleTabChange} // Pass the local state updater
            />

            {/* Render the content based on the active tab */}
            <div className="flex-grow overflow-y-auto">
                 {CurrentConfigComponent ? (
                    <CurrentConfigComponent agentId={agentId} />
                 ) : (
                     <div className={`text-center ${uiColors.textDanger}`}>
                         Error: Configuration component not found for tab '{activeTab}'.
                     </div>
                 )}
            </div>

        </div>
    );
}