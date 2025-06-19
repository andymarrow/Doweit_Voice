// voice-agents-dashboard/CallAgentsMainPage.jsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
// Removed Image as it's now used inside AgentTable
// Removed pagination icons as they are now in AgentTable

import {
    FiRefreshCw,
    FiSearch,
    FiFilter,
    FiPlus,
    FiHelpCircle
    // Removed FiMoreVertical, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

// Import the new AgentTable component
import AgentTable from './_components/AgentTable';

// Import shared constants
import {
    accentButtonClasses,
    uiAccentClasses
} from './_constants/uiConstants';

// Removed sampleAgents data

function CallAgentsMainPage() {
    return (
        // Main container for the page content
        <div className={`relative flex flex-col h-full overflow-y-auto p-2 md:p-3 lg:p-4 hide-scrollbar`}>

            {/* Header Bar */}
            <div className={`flex flex-col md:flex-row items-center justify-between mb-6 p-2 rounded-lg ${uiAccentClasses.bgPrimary} shadow-sm ${uiAccentClasses.borderColor} border space-y-4 md:space-y-0`}>

                {/* Left side: Tabs & Refresh */}
                <div className="flex items-center space-x-4">
                    {/* Tabs */}
                    <div className={`flex rounded-md overflow-hidden border ${uiAccentClasses.borderColor}`}>
                        <button className={`px-4 py-2 text-sm font-medium transition-colors ${uiAccentClasses.activeTabBg} ${uiAccentClasses.activeTabText}`}>
                            Agents
                        </button>
                        <button className={`px-4 py-2 text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300`}>
                            Teams
                        </button>
                    </div>
                    {/* Refresh Button */}
                    <button className={`p-2 rounded-md transition-colors ${uiAccentClasses.hoverBgSubtle}`}>
                        <FiRefreshCw className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Right side: Search, Filter, Create */}
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                    {/* Search Input */}
                    <div className={`flex items-center border rounded-md px-3 py-1.5 ${uiAccentClasses.borderColor} ${uiAccentClasses.bgPrimary} w-full md:w-auto`}>
                        <FiSearch className="text-gray-400 mr-2 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className={`outline-none text-sm ${uiAccentClasses.textPrimary} placeholder-gray-400 dark:placeholder-gray-500 ${uiAccentClasses.bgPrimary} flex-grow min-w-0`}
                        />
                    </div>
                    {/* Filter Button */}
                    <button className={`p-2 rounded-md transition-colors ${uiAccentClasses.hoverBgSubtle} flex-shrink-0`}>
                        <FiFilter className="text-gray-600 dark:text-gray-300" />
                    </button>
                    {/* Create Agent Button */}
                    <Link href="/agents/create">
                         <button className={`inline-flex items-center text-sm font-semibold px-4 py-2 rounded-md shadow ${accentButtonClasses} flex-shrink-0`}>
                             <FiPlus className="mr-2" />
                             Create Agent
                         </button>
                     </Link>
                </div>
            </div>

            {/* Render the AgentTable component */}
            <AgentTable />

           

        </div>
    );
}

export default CallAgentsMainPage;