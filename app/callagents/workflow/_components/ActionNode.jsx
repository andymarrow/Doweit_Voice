// app/callagents/workflow/_components/nodes/ActionNode.jsx
import React, { memo } from 'react'; // Use memo for performance
import { Handle, Position } from '@xyflow/react'; // For connection handles
import { FiTrash2, FiEdit3, FiBookOpen, FiList, FiPhoneCall, FiLoader } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../_constants/uiConstants';

// Helper function to get icon based on action type/details (can reuse)
const getActionIcon = (action) => {
    if (!action || !action.type) return <FiBookOpen className={`w-4 h-4 ${uiColors.textSecondary}`} />; // Default

    switch (action.type) {
        case 'Information Extractor':
             // Use details for more specific icon?
             if (action.details?.includes('Choice')) return <FiList className={`w-4 h-4 ${uiColors.textSecondary}`} />;
             return <FiBookOpen className={`w-4 h-4 ${uiColors.textSecondary}`} />; // Open Question
        case 'Action Type':
             if (action.name?.toLowerCase().includes('transfer')) return <FiPhoneCall className={`w-4 h-4 ${uiColors.textSecondary}`} />;
             // Add more action type icons
             return <FiEdit3 className={`w-4 h-4 ${uiColors.textSecondary}`} />; // Generic Action Type
        default:
            return <FiBookOpen className={`w-4 h-4 ${uiColors.textSecondary}`} />;
    }
};


// Receive data prop from React Flow, including action instance data and handlers
function ActionNode({ data }) {
    // data contains { label, type: 'action', action: { agentActionId, timing, order, action: { ...global action details... } }, onDeleteClick, onEditClick }

    // Safely access action instance data
    const actionInstance = data.action;
    const globalAction = actionInstance?.action; // The linked global action definition

    // Check if handlers are provided (passed down from page)
    const showDeleteButton = typeof data.onDeleteClick === 'function';
    // const showEditButton = typeof data.onEditClick === 'function'; // Optional edit handler


    return (
         // Apply basic node styling
         // Add styling based on timing group if desired (e.g., border color)
        <div className={`p-4 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-md w-60`}>
             {/* Target handle (top) */}
             <Handle
                 type="target"
                 position={Position.Top}
                  id="t"
                  className={`${uiColors.handleBg}`}
             />
             {/* Source handle (bottom) */}
             <Handle
                 type="source"
                 position={Position.Bottom}
                  id="b"
                  className={`${uiColors.handleBg}`}
             />


            {/* Node Header */}
            <div className={`flex items-center justify-between text-sm font-semibold mb-2 ${uiColors.textPrimary}`}>
                {/* Action Icon */}
                 <div className="flex items-center">
                     {getActionIcon(globalAction)} {/* Use helper */}
                     <span className="ml-2">{data.label || 'Action'}</span>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex items-center space-x-1 flex-shrink-0">
                      {/* Optional Edit Button */}
                       {/* {showEditButton && (
                           <button
                                onClick={() => data.onEditClick(actionInstance)} // Pass instance data
                                className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} text-xs`}
                                title="Edit Action Step"
                           >
                               <FiEdit3 className="w-4 h-4" />
                           </button>
                       )} */}

                      {/* Delete Button */}
                      {showDeleteButton && (
                           <button
                                onClick={() => data.onDeleteClick(actionInstance?.agentActionId)} // Pass instance ID
                                className={`p-1 rounded-md ${uiColors.hoverBgSubtle} text-red-600 dark:text-red-400 text-xs`}
                                title="Remove Action Step"
                           >
                               <FiTrash2 className="w-4 h-4" />
                           </button>
                      )}
                 </div>
            </div>

            {/* Node Content - Display Timing, Order, and basic Action details */}
             <div className={`text-xs ${uiColors.textSecondary} space-y-1`}>
                 <p>Timing: <span className={`${uiColors.textPrimary} font-medium`}>{actionInstance?.timing || 'N/A'}</span></p>
                  <p>Order: <span className={`${uiColors.textPrimary} font-medium`}>{actionInstance?.order !== undefined ? actionInstance.order : 'N/A'}</span></p>
                   <p>Type: <span className={`${uiColors.textPrimary}`}>{globalAction?.type || 'N/A'}</span></p>
                   {globalAction?.details && <p>Details: <span className={`${uiColors.textPrimary}`}>{globalAction.details}</span></p>}
             </div>

        </div>
    );
}

export default memo(ActionNode); // Wrap with memo for performance