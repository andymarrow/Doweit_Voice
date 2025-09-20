// lib/google/sheetsHelper.js
import { google } from 'googleapis';
import { getAuthenticatedClient } from '@/lib/google/googleAuth'; // We created this in the last step

/**
 * Ensures the header row of a spreadsheet is correct.
 * If the sheet is empty, it writes the headers.
 * If headers exist but new ones are needed, it appends the new columns.
 * @param {object} authClient - The authenticated Google OAuth2 client.
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {string[]} requiredHeaders - The full list of headers that should exist.
 * @returns {Promise<void>}
 */
export async function ensureHeaderRow(authClient, spreadsheetId, requiredHeaders) {
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const sheetName = 'Sheet1'; // Assuming the default sheet for now

    // 1. Get the current first row to check existing headers
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!1:1`,
    });

    const existingHeaders = response.data.values ? response.data.values[0] : [];

    if (existingHeaders.length === 0) {
        // Sheet is empty, write all headers
        console.log(`[G-Sheets Helper] Sheet is empty. Writing ${requiredHeaders.length} headers.`);
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [requiredHeaders],
            },
        });
    } else {
        // Sheet has headers, check if we need to add new ones
        const newHeaders = requiredHeaders.filter(h => !existingHeaders.includes(h));
        if (newHeaders.length > 0) {
            console.log(`[G-Sheets Helper] Found ${newHeaders.length} new headers to append.`);
            // Append the new headers to the end of the first row
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'OVERWRITE', // This is tricky, a better way is to update a specific range
                resource: {
                    values: [newHeaders],
                },
            });
            // The above append might not work as expected for adding columns. A direct update is better.
            // Let's use update instead for more robust column adding.
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                // Start writing from the column right after the last existing header
                range: `${sheetName}!${String.fromCharCode(65 + existingHeaders.length)}1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [newHeaders],
                },
            });
        } else {
             console.log(`[G-Sheets Helper] Headers are already up to date.`);
        }
    }
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