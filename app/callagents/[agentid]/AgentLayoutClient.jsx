// app/callagents/[agentid]/AgentDetailLayoutClient.jsx
"use client";

import React, { useState } from 'react';
// import { useParams } from 'next/navigation'; // Still need useParams for agentId in client state/components

// Import components
import DetailAgentSidebar from './_components/sidebar';
import TestAgentSidePanel from './_components/TestAgentSidePanel';

// Import context provider
import { CallAgentProvider } from './_context/CallAgentContext'; // Adjust path!

// Import constants
import { uiColors } from '../_constants/uiColors'; // Assuming uiColors is correct here


// This component receives the fetched agent data from the Server Layout
// and provides the Client-side interactivity (state, context, etc.)
export default function AgentDetailLayoutClient({ agent, children }) {
    // State to manage sidebar collapse
    const [isCollapsed, setIsCollapsed] = useState(false);
    // State to manage test panel visibility
    const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);

    // Use agent.id from the fetched agent object, which is guaranteed to exist here
    const agentId = agent.id;


    // Define sidebar widths (can use state for dynamic width)
    // You can pass these to the sidebar or manage here
    const normalWidth = 250; // px (adjust as needed)
    const collapsedWidth = 60; // px (adjust as needed, should fit icon + padding)

    // Function to toggle sidebar collapse state
    const toggleDetailSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Function to toggle the test panel
    const toggleTestPanel = () => {
        setIsTestPanelOpen(!isTestPanelOpen);
    };

     // Function to close the test panel
     const closeTestPanel = () => {
         setIsTestPanelOpen(false);
     };


    // Now wrap everything in the CallAgentProvider
    return (
        <CallAgentProvider agent={agent}>
            {/* Main container relative for potential fixed/absolute children positioning */}
            <div className="relative flex h-full overflow-hidden">

                {/* Nested Layout Content Container */}
                {/* This inner flex handles the sidebar and the main content area side-by-side */}
                <div className="flex flex-1 overflow-hidden flex-nowrap">

                     {/* Agent Detail Sidebar */}
                     <div
                         className={`flex-shrink-0 overflow-y-auto border-r ${uiColors.borderPrimary} ${uiColors.bgPrimary} p-4 transition-width duration-300 ease-in-out`}
                         // Use dynamic width based on local state
                         style={{ width: `${isCollapsed ? collapsedWidth : normalWidth}px` }}
                     >
                        {/* Pass necessary props to the sidebar */}
                        {/* agentId is now implicitly available via context within the sidebar */}
                        <DetailAgentSidebar
                            isCollapsed={isCollapsed}
                            toggleCollapse={toggleDetailSidebar} // Pass the toggle function
                            onTestButtonClick={toggleTestPanel} // Button in sidebar opens test panel
                        />
                     </div>

                    {/* Agent Detail Main Content Area */}
                    {/* Needs to take remaining width (flex-1) and allow scrolling */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        {children} {/* This is where the specific page component (dashboard, configure, etc.) will render */}
                    </div>
                </div>

               
                {/* Render the Test Agent Side Panel */}
                {/* Positioned outside the main flex container so it can overlay */}
                {/* Pass agentId and handlers */}
                <TestAgentSidePanel
                     isOpen={isTestPanelOpen}
                     onClose={closeTestPanel}
                     agentId={agentId} // Pass the real agent ID
                 />

            </div>
        </CallAgentProvider>
    );
}