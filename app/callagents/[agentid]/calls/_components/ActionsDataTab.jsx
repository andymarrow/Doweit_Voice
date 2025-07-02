// voice-agents-CallAgents/[agentid]/calls/_components/ActionsDataTab.jsx
"use client";

import React from 'react';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants';

// Receives callData, including callData.callActionValues array
function ActionsDataTab({ callData }) {

    // Access the callActionValues array from callData
    const callActionValues = callData?.callActionValues || [];

    if (callActionValues.length === 0) {
        return (
            <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                No data collected by actions for this call.
            </div>
        );
    }

    return (
         <div className="space-y-4">
             {/* Iterate over the callActionValues array */}
             {callActionValues.map(cav => (
                 // Use the unique ID of the callActionValue instance as the key
                 <div key={cav.id} className={`p-4 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}>
                     {/* Display Action Name (using displayName or name from the joined action) */}
                     {/* Safely access action properties */}
                     <div className={`text-xs font-medium ${uiColors.textSecondary} uppercase mb-1`}>
                         Action: {cav.agentAction?.action?.displayName || cav.agentAction?.action?.name || 'Unnamed Action'}
                     </div>
                      {/* Display the extracted Value */}
                      {/* Handle different value types if necessary (e.g., booleans, objects) */}
                     <div className={`text-sm ${uiColors.textPrimary}`}>
                         Value: {cav.value !== null && cav.value !== undefined ? String(cav.value) : 'N/A'} {/* Convert value to string for display */}
                     </div>
                      {/* Optional: Display Raw Value */}
                      {cav.rawValue && cav.rawValue !== String(cav.value) && ( // Show raw value if it's different
                          <div className={`text-xs italic ${uiColors.textPlaceholder} mt-1`}>
                              Raw: {cav.rawValue}
                          </div>
                      )}
                       {/* Optional: Display other details from the action definition */}
                       {cav.agentAction?.action?.details && (
                            <div className={`text-xs ${uiColors.textSecondary} mt-1`}>
                               Details: {cav.agentAction.action.details}
                           </div>
                       )}
                 </div>
             ))}
         </div>
    );
}

export default ActionsDataTab;