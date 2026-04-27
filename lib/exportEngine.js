// lib/exportEngine.js
import { db } from "@/lib/database";
import { calls } from '@/lib/db/schemaCharacterAI';
import { inArray } from 'drizzle-orm';

// Coerces extracted action values into a Sheets-friendly string. Bare strings stay unquoted
// (JSON.stringify("yes") was producing literal `"yes"` in cells); objects/arrays become JSON.
function formatActionValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

function formatTimestamp(value) {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

/**
 * Fetches call data and produces { headers, rowsByHeader } where rowsByHeader is an array of
 * objects keyed by header name. The caller decides the final column order (so we can match
 * the spreadsheet's existing header layout).
 */
export async function prepareCallDataForExport(callIds) {
    if (!Array.isArray(callIds) || callIds.length === 0) {
        return { headers: [], rowsByHeader: [] };
    }

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
        return { headers: [], rowsByHeader: [] };
    }

    const staticHeaders = [
        'Call ID', 'Agent Name', 'Caller Phone', 'Start Time', 'Duration (sec)',
        'Status', 'Recording URL', 'Is Exported',
    ];

    const dynamicActionHeaders = [...new Set(
        callsData.flatMap(call =>
            (call.agent?.agentActions || [])
                .map(aa => aa?.action?.name)
                .filter(Boolean),
        ),
    )];

    const headers = [...staticHeaders, ...dynamicActionHeaders];

    const rowsByHeader = callsData.map(call => {
        const valuesMap = new Map(
            (call.callActionValues || [])
                .filter(cav => cav?.agentAction?.action?.name)
                .map(cav => [cav.agentAction.action.name, cav.value]),
        );

        const row = {
            'Call ID': call.id,
            'Agent Name': call.agent?.name || '',
            'Caller Phone': call.phoneNumber || '',
            'Start Time': formatTimestamp(call.startTime),
            'Duration (sec)': call.duration ?? 0,
            'Status': call.status || '',
            'Recording URL': call.audioUrl || '',
            'Is Exported': call.isExported ? 'TRUE' : 'FALSE',
        };

        dynamicActionHeaders.forEach(name => {
            row[name] = formatActionValue(valuesMap.get(name));
        });

        return row;
    });

    return { headers, rowsByHeader };
}