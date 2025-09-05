"use client";

import React from 'react';

// Import constants - Adjust path if necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants';

function ActionsDataTab({ callData }) {
    // This is the COMPLETE list of actions configured for the agent that made this call.
    // This data is now included thanks to the updated GET /api/callagents/[agentid]/calls endpoint.
    const allConfiguredActions = callData?.agent?.agentActions || [];
    
    // This is the list of values that were actually extracted and saved for THIS specific call.
    const foundActionValues = callData?.callActionValues || [];

    // For efficient lookup, we create a map of the found values.
    // The key will be the `agentActionId` and the value will be the `value` property.
    const valuesMap = new Map(
        foundActionValues.map(val => [val.agentActionId, val.value])
    );

    // Case 1: The agent has no actions configured at all.
    if (allConfiguredActions.length === 0) {
        return (
            <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                No actions are configured for this agent.
            </div>
        );
    }
    
    // Case 2: The agent has actions, but this call hasn't been analyzed yet.
    // This is determined by checking if any values were found for this call.
    if (foundActionValues.length === 0) {
        return (
            <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                Call has not been analyzed yet. Go to the Transcript tab to start the analysis.
            </div>
        );
    }

    return (
        <div className="space-y-3 text-sm">
            {/* We iterate over ALL the actions configured for the agent */}
            {allConfiguredActions.map(agentActionInstance => {
                // The details of the global action definition (name, description, etc.)
                const actionDetails = agentActionInstance.action;
                
                // We look up the value for this specific action instance in our map.
                // If a value is not found in the map (meaning analysis ran but found nothing),
                // we default to null.
                const extractedValue = valuesMap.get(agentActionInstance.id) ?? null;

                // We won't render the component if for some reason the action details are missing.
                if (!actionDetails) return null;

                return (
                    <div
                        key={agentActionInstance.id} // Use the unique ID of the agent_actions record
                        className={`p-3 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}
                    >
                        <div className="flex justify-between items-center">
                            <span className={`font-semibold ${uiColors.textPrimary}`}>
                                {/* Use the human-friendly displayName, or fall back to the system name */}
                                {actionDetails.displayName || actionDetails.name}
                            </span>
                            {/* Display a "Required" badge if the action was marked as such */}
                            {actionDetails.isRequired && (
                                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    Required
                                </span>
                            )}
                        </div>
                        <div className={`mt-1 p-2 rounded ${uiColors.bgPrimary}`}>
                            <span className={`font-mono ${extractedValue === null ? uiColors.textPlaceholder : uiColors.textSecondary}`}>
                                {/* Safely stringify the value, which could be a string, number, boolean, or null */}
                                {JSON.stringify(extractedValue)}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ActionsDataTab;