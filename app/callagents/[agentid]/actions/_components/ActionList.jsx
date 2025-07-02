// voice-agents-CallAgents/[agentid]/actions/_components/ActionList.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    FiBookOpen, FiEye, FiList, FiPhoneCall, FiPlusCircle, FiTrash2, FiLoader // Added FiEye
} from 'react-icons/fi'; // Import necessary icons, ensuring FiEye is included

// Import constants - Adjust path if necessary
import { uiColors } from '../../../_constants/uiConstants';
import { itemVariants, sectionVariants } from '../../../_constants/uiConstants';

// Placeholder function to get icon based on detail type (updated to include Call Type)
const getDetailIcon = (detail) => {
    switch (detail) {
        case 'Open Question':
            return <FiBookOpen className={`w-3 h-3 ${uiColors.textSecondary}`} />;
        case 'Single Choice':
            return <FiList className={`w-3 h-3 ${uiColors.textSecondary}`} />;
        case 'Connects to Agent': // Assuming this detail relates to call transfer action type
             return <FiPhoneCall className={`w-3 h-3 ${uiColors.textSecondary}`} />;
        // Add more cases for other types based on your `actions.details` field
        default:
            return null;
    }
};

// Receive actions array, handlers (add, delete, view), tabKey, and isDeleting state
function ActionList({ title, description, actions, onAddActionClick, onDeleteAction, onViewAction, tabKey, isDeleting }) { // *** Added onViewAction ***

     // Handler for the Delete button click
     const handleDeleteClick = (agentActionId) => {
         // Optional: Add a confirmation dialog here if you prefer it at this level
         if (confirm('Are you sure you want to remove this action from the agent?')) {
             // Call the parent's delete handler, passing the action instance ID and its timing
             onDeleteAction(agentActionId, tabKey);
         }
     };

     // *** NEW HANDLER FOR THE VIEW BUTTON CLICK ***
     const handleViewClick = (action) => {
         onViewAction(action); // Call the parent's view handler, passing the action data
     };


    return (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>{title}</h3>
                    <p className={`text-sm ${uiColors.textSecondary}`}>{description}</p>
                </div>
                 {/* Add Action Button - Disable when deleting */}
                <button
                    onClick={onAddActionClick} // Call parent handler to open modal
                     disabled={isDeleting} // Disable when deleting
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <FiPlusCircle className="mr-2 w-4 h-4" /> Add Action
                </button>
            </div>

            {/* Action Cards Grid */}
            {actions.length === 0 ? (
                <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                    No actions defined for {title.toLowerCase()}. Click "+ Add Action" to add some.
                </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {/* Map over the actions array received as prop */}
                     {actions.map(action => (
                          // Each 'action' object here includes global action details PLUS agentActionId, timing, order
                         <motion.div
                              key={action.agentActionId} // Use the unique agentActionId as the key
                              variants={itemVariants} // Apply item variants for animation
                              className={`${uiColors.bgSecondary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-4 space-y-3`}
                         >
                             {/* Type Badge */}
                              <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}`}>
                                 {action.type}
                             </span>
                             {/* Action Name (using the global action's name) */}
                             <div className={`font-semibold text-sm ${uiColors.textPrimary}`}>
                                 {action.name}
                                 {/* Or use action.displayName if available and preferred */}
                             </div>
                             {/* Action Details (using the global action's details) */}
                             <div className={`flex items-center text-xs ${uiColors.textSecondary}`}>
                                 {getDetailIcon(action.details)} {/* Icon based on details */}
                                  <span className="ml-1">{action.details}</span>
                             </div>
                             {/* Action Buttons: View & Delete */}
                              <div className="flex items-center space-x-2 mt-3">
                                   {/* *** NEW VIEW BUTTON *** */}
                                  <button
                                       onClick={() => handleViewClick(action)} // Call view handler
                                        disabled={isDeleting} // Disable when deleting
                                       className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
                                       title="View Details"
                                  >
                                       <FiEye className="w-4 h-4" /> {/* Using FiEye */}
                                  </button>

                                   {/* Delete Button */}
                                  <button
                                       onClick={() => handleDeleteClick(action.agentActionId)} // Call delete handler
                                        disabled={isDeleting} // Disable when deleting
                                       className={`p-1 rounded-md ${uiColors.hoverBgSubtle} text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed`} // Use danger color for delete
                                       title="Remove Action"
                                  >
                                       <FiTrash2 className="w-4 h-4" />
                                  </button>
                              </div>
                         </motion.div>
                     ))}
                 </div>
            )}

        </motion.div>
    );
}

export default ActionList;