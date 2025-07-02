// voice-agents-CallAgents/[agentid]/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// useParams is not strictly necessary here anymore as agent is in context,
// but you might keep it for other page-specific logic if needed.
// import { useParams } from 'next/navigation';
import { FiAlertTriangle, FiRefreshCcw, FiPhone, FiBarChart2, FiLoader } from 'react-icons/fi';

// Import constants
import { sectionVariants, itemVariants, uiColors } from './_constants/uiConstants'; // Adjust path!

// Import the custom hook to get agent data from context
import { useCallAgent } from './[agentid]/_context/CallAgentContext'; 


// Simulate fetching dashboard metrics data (calls, actions counts)
// This data might be aggregated and fetched separately from the main agent details
const fetchDashboardMetrics = async (agentId) => {
     console.log(`Fetching dashboard metrics for agent ${agentId}...`);
     // In a real app, this would call an API endpoint like /api/callagents/:agentId/metrics
     // Simulate API call delay
     await new Promise(resolve => setTimeout(resolve, 700));
     return {
         callsData: { total: 15, minutesUsed: 45.5, avgDuration: 3.0 }, // Example data
         actionsData: { total: 25, apptsScheduled: 3, liveTransfers: 1, smsSent: 5 }, // Example data
     };
};


export default function AgentDetailMainPage() {
    // Get the full agent object from context
    const agent = useCallAgent(); // This hook will throw if context is not available

    // Use agent.id for fetching page-specific data (metrics)
    const agentId = agent.id;

    // State for dashboard metrics data
    const [dashboardMetrics, setDashboardMetrics] = useState({
         callsData: { total: 0, minutesUsed: 0.0, avgDuration: 0.0 },
         actionsData: { total: 0, apptsScheduled: 0, liveTransfers: 0, smsSent: 0 },
    });
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
    const [metricsError, setMetricsError] = useState(null); // State for metrics fetch error


    // Fetch dashboard metrics when the agentId (from context) is available
    const loadMetrics = async () => {
        if (!agentId) return; // Ensure agentId is available before fetching
        setIsLoadingMetrics(true);
        setMetricsError(null);
        try {
            const fetchedMetrics = await fetchDashboardMetrics(agentId);
            setDashboardMetrics(fetchedMetrics);
             console.log("Fetched metrics:", fetchedMetrics);
        } catch (err) {
            console.error('Error loading metrics:', err);
            setMetricsError(err.message);
             // Reset metrics on error
             setDashboardMetrics({
                callsData: { total: 0, minutesUsed: 0.0, avgDuration: 0.0 },
                actionsData: { total: 0, apptsScheduled: 0, liveTransfers: 0, smsSent: 0 },
             });
        } finally {
            setIsLoadingMetrics(false);
        }
    };

    useEffect(() => {
        loadMetrics(); // Initial load when agentId is available on mount
    }, [agentId]); // Re-run effect if the agentId changes (though unlikely in this layout)


    // Use agent.name from context for display
    const agentName = agent?.name || 'Unnamed Agent';
    // Check if agent has phone number from context for alert banner
    const hasPhoneNumber = !!agent?.phoneNumber;


    return (
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Important Alert Banner (Show if agent does NOT have a phone number) */}
             {!hasPhoneNumber && (
                 <motion.div
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 p-4 rounded-md border ${uiColors.alertWarningBorder} ${uiColors.alertWarningBg} ${uiColors.alertWarningText}`}
                      variants={itemVariants} initial="hidden" animate="visible"
                 >
                     <div className="flex items-center flex-1">
                         <FiAlertTriangle className="flex-shrink-0 w-5 h-5 mr-3" />
                          <span className="text-sm">Important! Your agent doesn't have a phone number and can't receive calls.</span>
                     </div>
                      <button className={`w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient}`}>
                          Assign number
                      </button>
                  </motion.div>
             )}


            {/* Dashboard Header/Controls */}
            <motion.div
                 className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                 variants={itemVariants} initial="hidden" animate="visible"
            >
                {/* Left: Title and Refresh */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                     <h2 className={`text-xl font-bold ${uiColors.textPrimary}`}>Dashboard</h2>
                     {/* Add onClick to refresh metrics */}
                     <button
                         className={`p-2 rounded-md ${uiColors.hoverBgSubtle} text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                         onClick={loadMetrics} // Calls the function to refresh metrics for the current agentId
                         disabled={isLoadingMetrics || !agentId} // Disable while loading or if no agentId
                     >
                         <FiRefreshCcw className={`w-5 h-5 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
                     </button>
                </div>

                {/* Right: Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Type Filter */}
                     <div className="flex items-center space-x-1">
                         <span className={`text-sm ${uiColors.textSecondary}`}>Type:</span>
                         <select className={`form-select block w-fit text-sm rounded-md p-2 ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}>
                             <option>Live</option>
                             <option>Test</option>
                         </select>
                     </div>
                     {/* Date Range Filter */}
                     <div className="flex items-center space-x-1">
                          <span className={`text-sm ${uiColors.textSecondary}`}>Period:</span>
                         <select className={`form-select block w-fit text-sm rounded-md p-2 ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}>
                             <option>Last week</option>
                             <option>Last month</option>
                             <option>Last year</option>
                         </select>
                     </div>
                </div>
            </motion.div>

            {/* Dashboard Content Cards */}
             {isLoadingMetrics ? (
                 <div className={`text-center py-20 ${uiColors.textSecondary}`}>
                      <FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" /> Loading dashboard data...
                 </div>
             ) : metricsError ? (
                 <div className={`p-4 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm text-center`}>
                     Failed to load dashboard metrics: {metricsError}
                 </div>
             ) : (
                 <>
                     {/* Calls Card */}
                     <motion.div
                          className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6`}
                          variants={sectionVariants} initial="hidden" animate="visible"
                     >
                         <h3 className={`text-lg font-semibold mb-4 ${uiColors.textPrimary}`}>Calls</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left: Empty State / Chart (Placeholder) */}
                               {dashboardMetrics.callsData.total === 0 ? (
                                   <div className={`flex flex-col items-center justify-center h-48 ${uiColors.textPlaceholder}`}>
                                       <FiPhone className="w-10 h-10 mb-4" />
                                       <p className="text-sm text-center">{agentName} has no calls recorded yet.</p>
                                       <p className="text-xs text-center mt-1">A metric will appear here after your first call.</p>
                                   </div>
                               ) : (
                                    // Render Chart component here when data is available
                                    <div className={`flex flex-col items-center justify-center h-48 ${uiColors.textPlaceholder}`}>
                                         {/* Placeholder for Chart */}
                                         <FiBarChart2 className="w-10 h-10 mb-4" />
                                         <p className="text-sm">Call Chart Placeholder</p>
                                    </div>
                               )}
                              {/* Right: Metrics - Use data from state */}
                              <div className="flex flex-col space-y-4">
                                  <div className="flex justify-between items-center">
                                      <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Total calls</span>
                                      <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{dashboardMetrics.callsData.total}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Minutes used</span>
                                      <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{dashboardMetrics.callsData.minutesUsed.toFixed(1)}min</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Avg. call duration</span>
                                      <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{dashboardMetrics.callsData.avgDuration.toFixed(1)}min</span>
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
                              {dashboardMetrics.actionsData.total === 0 ? (
                                  <div className={`flex flex-col items-center justify-center h-48 ${uiColors.textPlaceholder}`}>
                                      <FiBarChart2 className="w-10 h-10 mb-4" />
                                      <p className="text-sm text-center">No actions collected for this agent yet.</p>
                                  </div>
                              ) : (
                                   // Render Chart component here when data is available
                                   <div className={`flex flex-col items-center justify-center h-48 ${uiColors.textPlaceholder}`}>
                                        {/* Placeholder for Chart */}
                                        <FiBarChart2 className="w-10 h-10 mb-4" />
                                        <p className="text-sm">Action Chart Placeholder</p>
                                   </div>
                              )}
                             {/* Right: Metrics - Use data from state */}
                             <div className="flex flex-col space-y-4">
                                  <div className="flex justify-between items-center">
                                       <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Total actions collected</span>
                                       <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{dashboardMetrics.actionsData.total}</span>
                                  </div>
                                 <div className="flex justify-between items-center">
                                     <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Appts. scheduled</span>
                                     <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{dashboardMetrics.actionsData.apptsScheduled}</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                     <span className={`text-sm font-medium ${uiColors.textSecondary}`}>Live transfers</span>
                                     <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{dashboardMetrics.actionsData.liveTransfers}</span>
                                 </div>
                                  <div className="flex justify-between items-center">
                                       <span className={`text-sm font-medium ${uiColors.textSecondary}`}>SMS sent</span>
                                       <span className={`text-xl font-bold ${uiColors.textPrimary}`}>{dashboardMetrics.actionsData.smsSent}</span>
                                  </div>
                              </div>
                          </div>
                      </motion.div>
                 </>
             )}


            {/* Add more dashboard sections/cards here */}

        </div>
    );
}