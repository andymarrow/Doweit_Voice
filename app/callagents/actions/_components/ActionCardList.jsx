// /app/callagents/actions/_components/ActionCardList.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiList, FiCheckCircle, FiXCircle, FiEye, FiEdit, FiTrash2, FiPhoneCall } from 'react-icons/fi';

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants';
import { itemVariants } from '../../_constants/uiConstants';


// Helper function to render action details based on action.config (from DB)
const renderActionDetails = (action) => {
    // Use action.config instead of action.details
    const config = action.config;

    if (!config) {
        return <span className={`text-sm ${uiColors.textSecondary}`}>No details configured</span>;
    }

    const detailType = config.type; // Access type from the config JSONB

    switch (detailType) {
        case 'Text':
            return (
                 <span className={`flex items-center text-sm ${uiColors.textSecondary}`}>
                     <FiBookOpen className="mr-1 flex-shrink-0" /> Open Question
                 </span>
            );
        case 'Boolean':
             return (
                 <div className={`flex items-center flex-wrap text-sm ${uiColors.textSecondary}`}>
                      {/* Access trueLabel and falseLabel from the config JSONB */}
                      <span className="mr-2 flex-shrink-0"><FiCheckCircle className="inline mr-1 text-green-500 dark:text-green-400" /> True: {config.trueLabel || 'Yes'}</span>
                      <span className="flex-shrink-0"><FiXCircle className="inline mr-1 text-red-500 dark:text-red-400" /> False: {config.falseLabel || 'No'}</span>
                 </div>
             );
        case 'Choice':
             // Access options from the config JSONB
             const choices = Array.isArray(config.options) ? config.options.map(opt => opt.label).join(', ') : '';
             const displayChoices = choices.length > 50 ? choices.substring(0, 50) + '...' : choices;
             return (
                 <div className={`flex items-center text-sm ${uiColors.textSecondary}`}>
                     <FiList className="mr-1 flex-shrink-0" />
                      <span>
                         Choices: {displayChoices || 'No choices defined'}
                      </span>
                 </div>
             );
         case 'Action': // For general 'Action Type' like Transfer, Send SMS
              // Access nested config if applicable from the main config JSONB
              let actionConfigDetails = 'Custom Action';
              if (action.name === 'transfer_to_human' && config.config?.number) { // Check config.config
                  actionConfigDetails = `Transfer to ${config.config.number}`;
              } else if (action.name === 'send_sms_confirmation' && config.config?.templateId) { // Check config.config
                  actionConfigDetails = `Send SMS (Template ID: ${config.config.templateId})`;
              }
              return (
                  <span className={`flex items-center text-sm ${uiColors.textSecondary}`}>
                     <FiPhoneCall className="mr-1 flex-shrink-0" /> {actionConfigDetails}
                  </span>
              );
        default:
            return <span className={`text-sm ${uiColors.textSecondary}`}>Details Not Defined</span>;
    }
};


function ActionCardList({ actions, onView, onEdit, onDelete }) {
    // Assuming 'actions' prop contains data fetched from DB, each action object has a 'config' property

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Ensure actions is an array before mapping */}
             {Array.isArray(actions) && actions.map((action, index) => (
                <motion.div
                    key={action.id} // Use action.id from the DB
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    className={`${uiColors.bgSecondary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-4 space-y-3 flex flex-col justify-between`}
                >
                    {/* Card Content */}
                    <div className="space-y-2 flex-grow">
                        {/* Type Badge */}
                         {/* Display the broad type from action.type */}
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}`}>
                            {action.type || 'Unknown Type'}
                        </span>
                        {/* Action Name */}
                         {/* Display the action name from action.name */}
                        <div className={`font-semibold text-base ${uiColors.textPrimary} break-words`}>
                            {action.name || 'Unnamed Action'} {/* Fallback for name */}
                        </div>
                         {/* Description (Optional) */}
                         {action.description && (
                             <p className={`text-xs italic ${uiColors.textSecondary} break-words`}>
                                 {action.description}
                             </p>
                         )}
                        {/* Action Details (Rendered based on action.config) */}
                        {renderActionDetails(action)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 border-t mt-4 pt-3">
                         <button
                              onClick={() => onView(action)} // Pass the full action object
                              className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} ${uiColors.hoverText}`}
                             title="View Action"
                         >
                             <FiEye className="w-4 h-4" />
                         </button>
                         <button
                              onClick={() => onEdit(action)} // Pass the full action object
                              className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} ${uiColors.hoverText}`}
                             title="Edit Action"
                         >
                             <FiEdit className="w-4 h-4" />
                         </button>
                         <button
                              onClick={() => onDelete(action)} // Pass the full action object
                              className={`p-1 rounded-md ${uiColors.hoverBgSubtle} text-red-500 dark:text-red-400`}
                             title="Delete Action"
                         >
                             <FiTrash2 className="w-4 h-4" />
                         </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export default ActionCardList;