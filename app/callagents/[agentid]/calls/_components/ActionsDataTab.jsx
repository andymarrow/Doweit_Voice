// voice-agents-CallAgents/[agentid]/calls/_components/ActionsDataTab.jsx
"use client";

import React from 'react';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; 

function ActionsDataTab({ actionsData }) { // Receive actionsData object

    const dataEntries = Object.entries(actionsData || {}); // Convert object to array of [key, value] pairs

    if (!actionsData || dataEntries.length === 0) {
        return (
            <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                No data collected by actions for this call.
            </div>
        );
    }

    return (
         <div className="space-y-4"> {/* Container with vertical spacing */}
             {dataEntries.map(([key, value]) => (
                 <div key={key} className={`p-4 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}>
                     <div className={`text-xs font-medium ${uiColors.textSecondary} uppercase mb-1`}>{key.replace(/_/g, ' ')}</div> {/* Display key */}
                     <div className={`text-sm ${uiColors.textPrimary}`}>{value || 'N/A'}</div> {/* Display value */}
                 </div>
             ))}
         </div>
    );
}

export default ActionsDataTab;