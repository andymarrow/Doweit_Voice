// lib/exportEngine.js
import { db } from "@/lib/database";
import { calls } from '@/lib/db/schemaCharacterAI';
import { inArray } from 'drizzle-orm';

/**
 * Fetches call data and formats it for export.
 * @param {number[]} callIds - An array of call IDs to export.
 * @returns {Promise<{headers: string[], rows: Array<Array<string>>}>}
 */
export async function prepareCallDataForExport(callIds) {
    if (!Array.isArray(callIds) || callIds.length === 0) {
        return { headers: [], rows: [] };
    }

    // 1. Fetch all calls and their rich, related data
    const callsData = await db.query.calls.findMany({
        where: inArray(calls.id, callIds),
        with: {
            agent: {
                with: {
                    agentActions: { with: { action: true } }
                }
            },
            callActionValues: {
                with: {
                    agentAction: { with: { action: true } }
                }
            }
        }
    });

    if (callsData.length === 0) {
        return { headers: [], rows: [] };
    }

    // 2. Dynamically determine the full set of headers
    const staticHeaders = [
        'Call ID', 'Agent Name', 'Caller Phone', 'Start Time', 'Duration (sec)',
        'Status', 'Recording URL', 'Is Exported'
    ];
    
    // Get a unique set of all action names configured for the agents of the selected calls
    const dynamicActionHeaders = [...new Set(
        callsData.flatMap(call => 
            call.agent.agentActions.map(agentAction => agentAction.action.name)
        )
    )];
    
    const headers = [...staticHeaders, ...dynamicActionHeaders];

    // 3. Process each call into a single row array
    const rows = callsData.map(call => {
        // Create a map of this call's extracted values for fast lookups
        const valuesMap = new Map(
            call.callActionValues.map(cav => [cav.agentAction.action.name, cav.value])
        );

        // Build a row object for easy mapping
        const rowObject = {
            'Call ID': call.id,
            'Agent Name': call.agent.name,
            'Caller Phone': call.phoneNumber,
            'Start Time': call.startTime.toISOString(),
            'Duration (sec)': call.duration,
            'Status': call.status,
            'Recording URL': call.recordingUrl,
            'Is Exported': call.isExported,
        };

        // Populate the dynamic action columns
        dynamicActionHeaders.forEach(actionName => {
            const value = valuesMap.get(actionName);
            // Convert any value (string, number, boolean, null, object) to its string representation
            rowObject[actionName] = value !== null && value !== undefined 
                ? JSON.stringify(value) 
                : ''; // Use empty string for null/undefined
        });

        // Convert the row object into an array in the correct header order
        return headers.map(header => rowObject[header]);
    });

    return { headers, rows };
}