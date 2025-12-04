// app/agents/recruiter/[agentid]/ClientLayout.jsx
"use client";

import React, { useState } from 'react';
import RecruiterInsideSidebar from './_components/RecruiterInsideSidebar';
import { CallAgentProvider } from '@/app/callagents/[agentid]/_context/CallAgentContext'; // Reusing your existing context
import { uiColors } from '@/app/callagents/_constants/uiConstants';

export default function ClientLayout({ agent, children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <CallAgentProvider agent={agent}>
            <div className="flex h-full overflow-hidden bg-white dark:bg-gray-950">
                {/* Inner Sidebar for Specific Interview */}
                <div 
                    className={`flex-shrink-0 h-full border-r ${uiColors.borderPrimary} transition-all duration-300
                    ${isCollapsed ? 'w-[70px]' : 'w-64'}`}
                >
                    <RecruiterInsideSidebar 
                        isCollapsed={isCollapsed} 
                        toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-6 relative">
                    {children}
                </div>
            </div>
        </CallAgentProvider>
    );
}