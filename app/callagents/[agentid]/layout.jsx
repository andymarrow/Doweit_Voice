// voice-agents-CallAgents/[agentid]/layout.jsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

// Import components
import DetailAgentSidebar from './_components/sidebar';
import TestAgentSidePanel from './_components/TestAgentSidePanel'; // Import the new component

// Import constants
import { uiColors } from '../_constants/uiConstants';

export default function AgentDetailPageLayout({ children }) {
    const params = useParams();
    const agentId = params.agentid;

    // State to manage sidebar collapse
    const [isCollapsed, setIsCollapsed] = useState(false);
    // State to manage test panel visibility
    const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);


    // Define sidebar widths
    const normalWidth = 250; // px (adjust as needed)
    const collapsedWidth = 60; // px (adjust as needed, should fit icon + padding)

    // Calculate current width based on state
    const currentWidth = isCollapsed ? collapsedWidth : normalWidth;

    // Function to toggle the test panel
    const toggleTestPanel = () => {
        setIsTestPanelOpen(!isTestPanelOpen);
    };

     // Function to close the test panel
     const closeTestPanel = () => {
         setIsTestPanelOpen(false);
     };


    return (
        // Main container relative for potential fixed/absolute children positioning
        <div className="relative flex h-full overflow-hidden">

            {/* Nested Layout Content Container */}
            <div className="flex flex-1 overflow-hidden flex-nowrap">

                 {/* Agent Detail Sidebar */}
                 <div
                     className={`flex-shrink-0 overflow-y-auto border-r ${uiColors.borderPrimary} ${uiColors.bgPrimary} p-4 transition-width duration-300 ease-in-out`}
                     style={{ width: `${currentWidth}px` }}
                 >
                    <DetailAgentSidebar
                        agentId={agentId}
                        isCollapsed={isCollapsed}
                        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                        onTestButtonClick={toggleTestPanel} // Pass the toggle function
                    />
                 </div>

                {/* Agent Detail Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children} {/* This is where the AgentDetailMainPage component will render */}
                </div>
            </div>

           

            {/* Render the Test Agent Side Panel */}
            {/* Positioned outside the main flex container so it can overlay */}
            <TestAgentSidePanel
                 isOpen={isTestPanelOpen}
                 onClose={closeTestPanel}
                 agentId={agentId} // Pass agentId if needed by panel logic later
             />

        </div>
    );
}