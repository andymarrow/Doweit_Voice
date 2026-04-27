// lib/google/sheetsHelper.js
import { google } from 'googleapis';
import { getAuthenticatedClient } from '@/lib/google/googleAuth';

// Convert a 0-indexed column number to its A1 letters (0 -> A, 25 -> Z, 26 -> AA, etc.)
function columnIndexToLetter(index) {
    let n = index + 1;
    let s = '';
    while (n > 0) {
        const r = (n - 1) % 26;
        s = String.fromCharCode(65 + r) + s;
        n = Math.floor((n - 1) / 26);
    }
    return s;
}

/**
 * Ensures the header row of a spreadsheet is correct.
 * If the sheet is empty, writes the headers.
 * If headers exist but new ones are needed, writes the new columns starting after the last existing header.
 * @returns {Promise<{headers: string[]}>} the canonical header order written to the sheet.
 */
export async function ensureHeaderRow(authClient, spreadsheetId, requiredHeaders) {
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const sheetName = 'Sheet1';

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!1:1`,
    });

    const existingHeaders = response.data.values ? response.data.values[0] : [];

    if (existingHeaders.length === 0) {
        console.log(`[G-Sheets Helper] Sheet is empty. Writing ${requiredHeaders.length} headers.`);
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [requiredHeaders] },
        });
        return { headers: [...requiredHeaders] };
    }

    const newHeaders = requiredHeaders.filter(h => !existingHeaders.includes(h));
    if (newHeaders.length === 0) {
        console.log('[G-Sheets Helper] Headers are already up to date.');
        return { headers: [...existingHeaders] };
    }

    console.log(`[G-Sheets Helper] Adding ${newHeaders.length} new header column(s).`);
    const startCol = columnIndexToLetter(existingHeaders.length);
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!${startCol}1`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [newHeaders] },
    });

    return { headers: [...existingHeaders, ...newHeaders] };
}

/**
 * Appends rows of data to a spreadsheet.
 * @param {object} authClient - The authenticated Google OAuth2 client.
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {Array<Array<string>>} rows - An array of rows to append.
 * @returns {Promise<void>}
 */
export async function appendRows(authClient, spreadsheetId, rows) {
    if (rows.length === 0) return;
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:A',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: rows,
        },
    });
    console.log(`[G-Sheets Helper] Successfully appended ${rows.length} rows.`);
}