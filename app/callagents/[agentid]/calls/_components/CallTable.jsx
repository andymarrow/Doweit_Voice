// voice-agents-CallAgents/[agentid]/calls/_components/CallTable.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Ensure correct path
import { itemVariants, sectionVariants } from '@/app/callagents/_constants/uiConstants'; // Assuming variants
// Removed accentClasses import as it wasn't used directly in the button class

function CallTable({ calls, onViewDetails }) { // Receive calls data and detail handler

    if (!calls || calls.length === 0) {
        return (
            <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className={`text-center py-20 ${uiColors.textSecondary}`}
            >
                No calls found.
            </motion.div>
        );
    }

     // Helper to format duration from seconds (if stored as number)
     const formatDuration = (durationInSeconds) => {
         if (durationInSeconds === undefined || durationInSeconds === null) return 'N/A';
         const minutes = Math.floor(durationInSeconds / 60);
         const seconds = durationInSeconds % 60;
         return `${minutes}m ${seconds}s`;
     };

    return (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="overflow-x-auto">
            <table className={`min-w-full divide-y ${uiColors.borderPrimary}`}>
                <thead className={`${uiColors.bgSecondary}`}>
                    <tr>
                        {/* Table Headers */}
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Agent Name
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Caller Name
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Number
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Start Time
                        </th>
                         <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Duration
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${uiColors.textSecondary} uppercase tracking-wider`}>
                            Status
                        </th>
                        <th scope="col" className={`relative px-4 py-3 `}>
                            <span className="sr-only">Details</span>
                        </th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                    {calls.map((call) => (
                        <motion.tr
                            key={call.id} // Unique key for each row
                            variants={itemVariants}
                            className={`${uiColors.hoverBgSubtle}`}
                        >
                            {/* Table Data */}
                            <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${uiColors.textPrimary}`}>
                                {/* Access nested agent name if available, fallback to agentName string */}
                                {call.agent ? call.agent.name : call.agentName || 'N/A'}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {call.callerName || 'Unknown'} {/* Use callerName from DB */}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {call.phoneNumber || 'N/A'} {/* Use phoneNumber from DB */}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {/* Format start time */}
                                {call.startTime ? new Date(call.startTime).toLocaleString() : 'N/A'}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {/* Use duration from DB (can be number or string), format if needed */}
                                 {typeof call.duration === 'number' ? formatDuration(call.duration) : call.duration || 'N/A'}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm`}>
                                {/* Status Badge */}
                                 <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                     call.status === 'Completed' ? `${uiColors.statusBadgeSuccessBg} ${uiColors.statusBadgeSuccessText}` :
                                     call.status === 'Failed' ? `${uiColors.statusBadgeDangerBg} ${uiColors.statusBadgeDangerText}` :
                                     call.status === 'Busy' ? `${uiColors.statusBadgeWarningBg} ${uiColors.statusBadgeWarningText}` : // Added Busy status
                                     call.status ? `${uiColors.statusBadgeInfoBg} ${uiColors.statusBadgeInfoText}` : // Default/Other status (use info color)
                                     '' // No status
                                 }`}>
                                     {call.status || 'N/A'}
                                 </span>
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-right text-sm font-medium`}>
                                 {/* Details Button */}
                                 <button
                                     onClick={() => onViewDetails(call)} // Call handler with call data
                                     // Adjusted button styling assuming accentPrimary is a color name in uiColors
                                     className={`text-${uiColors.textAccent} hover:text-${uiColors.textAccentContrast} focus:outline-none focus:underline`} // Simple link-style button or apply your standard button styles
                                 >
                                     Details
                                 </button>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    );
}

export default CallTable;