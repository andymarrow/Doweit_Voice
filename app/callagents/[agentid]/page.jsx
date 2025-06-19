// voice-agents-CallAgents/[agentid]/page.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation'; // To get the agentId
import { FiAlertTriangle, FiRefreshCcw, FiPhone, FiBarChart2 } from 'react-icons/fi'; // Example icons for dashboard content

// Import constants
import { sectionVariants, itemVariants, uiColors } from '../_constants/uiConstants';

// You would fetch agent-specific data here based on agentId

export default function AgentDetailMainPage() {
    const params = useParams();
    const agentId = params.agentid; // Get the agent ID


    // Placeholder Data (replace with fetched data)
    const agentName = "Emma from AutoTrust"; // Get from fetched data
    const callsData = { total: 0, minutesUsed: 0.0, avgDuration: 0.0 }; // Get from fetched data
    const actionsData = { total: 0, apptsScheduled: 0, liveTransfers: 0, smsSent: 0 }; // Get from fetched data


    return (
        <div className="flex flex-col space-y-6 w-full h-full"> {/* Container takes full width/height */}

            {/* Important Alert Banner */}
            {/* Make it flex-col on small screens, flex-row on sm: */}
            <motion.div
                 className={`flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 p-4 rounded-md border ${uiColors.alertWarningBorder} ${uiColors.alertWarningBg} ${uiColors.alertWarningText}`} // Added responsive flex/items/space-y
                 variants={itemVariants} initial="hidden" animate="visible"
            >
                 {/* The text content takes full width on small screens */}
                 <div className="flex items-center flex-1"> {/* Use flex-1 to allow text div to grow */}
                     <FiAlertTriangle className="flex-shrink-0 w-5 h-5 mr-3" /> {/* Prevent icon from shrinking */}
                     <span className="text-sm">Important! Your agent doesn't have a phone number and can't receive calls.</span> {/* Added text-sm for better fit */}
                 </div>
                {/* Assign Number Button - Make it full width on small, auto on sm: */}
                 <button className={`w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient}`}> {/* Added w-full/sm:w-auto */}
                     Assign number
                 </button>
             </motion.div>


            {/* Dashboard Header/Controls */}
            {/* Already flex-col on small and flex-row on sm: */}
            <motion.div
                 className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                 variants={itemVariants} initial="hidden" animate="visible"
            >
                {/* Left: Title and Refresh - Keep as flex-row */}
                <div className="flex items-center space-x-4">
                     <h2 className={`text-xl font-bold ${uiColors.textPrimary}`}>Dashboard</h2>
                     <button className={`p-2 rounded-md ${uiColors.hoverBgSubtle} text-gray-600 dark:text-gray-400 transition-colors`}>
                         <FiRefreshCcw className="w-5 h-5" />
                     </button>
                </div>

                {/* Right: Filters - Make flex-col on small screens, flex-row on sm: */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4"> {/* Added responsive flex/items/space */}
                    {/* Type Filter - Keep as flex-row (small components usually fit) */}
                     <div className="flex items-center space-x-1">
                         <span className={`text-sm ${uiColors.textSecondary}`}>Type:</span>
                         <select className={`form-select block w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}>
                             <option>Live</option>
                             <option>Test</option>
                         </select>
                     </div>
                     {/* Date Range Filter - Keep as flex-row */}
                     <div className="flex items-center space-x-1">
                          <span className={`text-sm ${uiColors.textSecondary}`}>Last week:</span>
                         <select className={`form-select block w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}>
                             <option>Last week</option>
                             <option>Last month</option>
                             <option>Last year</option>
                         </select>
                     </div>
                </div>
            </motion.div>

            {/* Dashboard Content Cards - These already use grid/flex effectively */}
            {/* Calls Card */}
            <motion.div
                 className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6`}
                 variants={sectionVariants} initial="hidden" animate="visible"
            >
                <h3 className={`text-lg font-semibold mb-4 ${uiColors.textPrimary}`}>Calls</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Left: Empty State / Chart (Placeholder) */}
                     <div className="flex flex-col items-center justify-center h-48 ${uiColors.textPlaceholder}">
                         <FiPhone className="w-10 h-10 mb-4" />
                         <p className="text-sm text-center">{agentName} has no calls recorded</p>
                         <p className="text-xs text-center">A metric will appear here after your first call</p>
                     </div>
                     {/* Right: Metrics */}
                     <div className="flex flex-col space-y-4">
                         <div className="flex justify-between items-center">
                             <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Total calls</span>
                             <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{callsData.total}</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Minutes used</span>
                             <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{callsData.minutesUsed}min</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Avg. call duration</span>
                             <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{callsData.avgDuration}min</span>
                         </div>
                     </div>
                 </div>
            </motion.div>

            {/* Actions Card */}
            <motion.div
                 className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6`}
                 variants={sectionVariants} initial="hidden" animate="visible"
            >
                <h3 className={`text-lg font-semibold mb-4 ${uiColors.textPrimary}`}>Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Empty State / Chart (Placeholder) */}
                     <div className="flex flex-col items-center justify-center h-48 ${uiColors.textPlaceholder}">
                         <FiBarChart2 className="w-10 h-10 mb-4" />
                         <p className="text-sm text-center">We couldn't find any actions</p>
                     </div>
                    {/* Right: Metrics */}
                    <div className="flex flex-col space-y-4">
                         <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Total actions</span>
                              <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{actionsData.total}</span>
                         </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Appts. scheduled</span>
                            <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{actionsData.apptsScheduled}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Live transfers</span>
                            <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{actionsData.liveTransfers}</span>
                        </div>
                         <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${uiColors.textSecondary}`}>SMS sent</span>
                              <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{actionsData.smsSent}</span>
                         </div>
                     </div>
                 </div>
             </motion.div>


            {/* Add more dashboard sections/cards here */}

        </div>
    );
}