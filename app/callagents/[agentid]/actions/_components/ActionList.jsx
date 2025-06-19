// voice-agents-CallAgents/[agentid]/actions/_components/ActionList.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    FiBookOpen, FiList // Example icons for details (Open Question, Single Choice)
} from 'react-icons/fi'; // Import necessary icons

// Import constants - Adjust path if necessary
import { uiColors } from '../../../_constants/uiConstants';
import { itemVariants, sectionVariants } from '../../../_constants/uiConstants'; // Assuming animation variants


// Placeholder function to get icon based on detail type
const getDetailIcon = (detail) => {
    switch (detail) {
        case 'Open Question':
            return <FiBookOpen className={`w-3 h-3 ${uiColors.textSecondary}`} />;
        case 'Single Choice':
            return <FiList className={`w-3 h-3 ${uiColors.textSecondary}`} />;
        // Add more cases for other types
        default:
            return null;
    }
};

function ActionList({ title, description, actions, onAddActionClick, tabKey }) { // Receive actions array and handler
    return (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>{title}</h3>
                    <p className={`text-sm ${uiColors.textSecondary}`}>{description}</p>
                </div>
                 {/* Add Action Button */}
                <button
                    onClick={onAddActionClick} // Call parent handler to open modal
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none`}
                >
                    <FiList className="mr-2 w-4 h-4" /> + Add Action {/* Using FiList, replace with appropriate icon */}
                </button>
            </div>

            {/* Action Cards Grid */}
            {actions.length === 0 ? (
                <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                    No actions defined for {title.toLowerCase()}. Click "+ Add Action" to add some.
                </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {actions.map(action => (
                         <motion.div
                              key={action.id} // Unique key for list items
                              variants={itemVariants} // Apply item variants for animation
                              className={`${uiColors.bgSecondary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-4 space-y-3`}
                         >
                             {/* Type Badge */}
                              <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}`}>
                                 {action.type}
                             </span>
                             {/* Action Name */}
                             <div className={`font-semibold text-sm ${uiColors.textPrimary}`}>
                                 {action.name}
                             </div>
                             {/* Action Details */}
                             <div className={`flex items-center text-xs ${uiColors.textSecondary}`}>
                                 {getDetailIcon(action.details)} {/* Icon based on details */}
                                  <span className="ml-1">{action.details}</span>
                             </div>
                             {/* TODO: Add more details or action buttons like Edit/Delete here */}
                         </motion.div>
                     ))}
                 </div>
            )}

        </motion.div>
    );
}

export default ActionList;