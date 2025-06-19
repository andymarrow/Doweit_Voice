// voice-agents-CallAgents/[agentid]/calls/_components/CallTable.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; 
import { itemVariants, sectionVariants } from '@/app/callagents/_constants/uiConstants'; // Assuming variants
import { accentClasses } from '@/app/callagents/_constants/uiConstants'; 

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

    return (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="overflow-x-auto"> {/* Allow horizontal scrolling on small screens */}
            <table className={`min-w-full divide-y ${uiColors.borderPrimary}`}> {/* Full width table */}
                <thead className={`${uiColors.bgSecondary}`}> {/* Header background */}
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
                            <span className="sr-only">Details</span> {/* Accessible label */}
                        </th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}> {/* Body background and dividers */}
                    {calls.map((call) => (
                        <motion.tr
                            key={call.id} // Unique key for each row
                            variants={itemVariants} // Optional animation for rows
                            className={`${uiColors.hoverBgSubtle}`} // Hover effect on rows
                        >
                            {/* Table Data */}
                            <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${uiColors.textPrimary}`}>
                                {call.agentName}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {call.callerName}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {call.callerNumber}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {/* Format date nicely */}
                                {new Date(call.startTime).toLocaleString()}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${uiColors.textSecondary}`}>
                                {call.duration}
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-sm`}>
                                {/* Status Badge (Example) */}
                                 <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                     call.status === 'Completed' ? `${uiColors.statusBadgeSuccessBg} ${uiColors.statusBadgeSuccessText}` :
                                     call.status === 'Failed' ? `${uiColors.statusBadgeDangerBg} ${uiColors.statusBadgeDangerText}` :
                                     `${uiColors.statusBadgeWarningBg} ${uiColors.statusBadgeWarningText}` // Default/Other status
                                 }`}>
                                     {call.status}
                                 </span>
                            </td>
                             <td className={`px-4 py-4 whitespace-nowrap text-right text-sm font-medium`}>
                                 {/* Details Button */}
                                 <button
                                     onClick={() => onViewDetails(call)} // Call handler with call data
                                      className={`text-${uiColors.accentPrimaryText} hover:text-${uiColors.accentContrast} ${accentClasses.buttonBg} p-2 rounded-lg transition-colors`}
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