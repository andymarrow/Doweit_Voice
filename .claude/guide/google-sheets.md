# Google Sheets export — verification guide

The Sheets export was already partially implemented before this round of work. **Phase D** found and fixed three blocker bugs:

- ❌ → ✅ `callAgents` was missing the `integrationConfig` JSONB column the setup route reads/writes — the column is now in `lib/db/schemaCharacterAI.js`
- ❌ → ✅ `inArray` was used but not imported in the setup route — fixed
- ❌ → ✅ `getAuthenticatedClient(userId)` queried `userConnections` without filtering by `provider='google'`, so when the user had any other connection (Slack, Cal.com, etc.) it grabbed the wrong row and Google rejected the token — fixed by adding `eq(userConnections.provider, 'google')`

After these fixes the existing flow works end-to-end. This guide walks through verification.

You will:

1. Run the migration so the new column exists
2. Confirm Google OAuth is connected
3. Set up the per-agent sheet
4. Test manual export
5. Verify auto-export of pre-analyzed calls

---

## 1. Apply the migration

```bash
cd Doweit_Voice
npm run db:push
```

This adds the `integration_config` column on `call_agents`. Existing agents get the default `{}`.

## 2. Verify Google OAuth connection

In the app: **Call Agents → Integrations** → the **Google Sheets** card should show **Connected**. If it doesn't:

- Click the card → **Connect with Google**
- Approve the four scopes: `userinfo.email`, `userinfo.profile`, `drive.file`, `spreadsheets`
- After consent, you should land back on the page with a success toast

> **Required env vars** (already in your `.env.local` from earlier work):
>
> ```bash
> GOOGLE_CLIENT_ID=
> GOOGLE_CLIENT_SECRET=
> GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/oauth/google/callback
> ```
>
> If `GOOGLE_REDIRECT_URI` is missing, the connect button errors with "Google API credentials are not configured." Add it and restart `npm run dev`.

## 3. Per-agent sheet setup

Open any agent → **Configure** tab (in the agent sidebar). The Integrations sub-section has a "Google Sheets" card with a **Create & Link Sheet** button (or similar). Click it.

Behind the scenes:

1. We create a brand-new spreadsheet on your Google Drive titled `Call Logs - <agent name>`
2. The spreadsheet ID + URL get saved to `call_agents.integrationConfig.googleSheets`
3. A background job kicks off to back-fill any pre-analyzed calls for that agent (calls that already have `callActionValues` rows but `isExported=false`)

After setup the card should show a "View Sheet" link. Click it — you should see your sheet open in Google Drive.

## 4. Test manual export

Make a real test call (or use an existing one with extracted actions). Then:

1. Go to the agent's **Calls** tab
2. Select one or more calls
3. Click **Export to Sheets** (or trigger `POST /api/callagents/<id>/calls/export-to-sheets` with `{ callIds: [...] }`)
4. Refresh the linked spreadsheet — the rows should appear at the bottom

Expected columns: `Call ID, Agent Name, Caller Phone, Start Time, Duration (sec), Status, Recording URL, Is Exported`, then one column per **action name** the agent has configured. New actions added later automatically grow the header row.

## 5. Verify auto-export of pre-analyzed calls

If you set up the sheet **after** running calls that already had actions extracted, those calls should auto-export when you link the sheet. Check the server logs for:

```
[G-Sheets Background Job] Found N calls to export.
[G-Sheets Background Job] Successfully exported N pre-analyzed calls.
```

If you see `inArray is not defined`, the import fix didn't apply — make sure you pulled the latest changes. If you see `column "integration_config" does not exist`, the migration didn't run — do `npm run db:push`.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Setup button errors with `column "integration_config" does not exist` | Migration not applied | `npm run db:push` |
| Setup hangs then errors with `Google connection not found` | OAuth wasn't completed for *this* user | Reconnect Google on workspace Integrations page |
| Export errors with `invalid_grant` | Refresh token expired or revoked | Disconnect Google → reconnect (forces a fresh consent) |
| Setup succeeds but background export logs nothing | No calls with extracted actions yet | Make a call + run analyze first |
| Action columns missing from sheet header | The agent had no `agent_actions` configured at export time | Configure actions on the agent, then re-export |
| New action added after first export not showing | Header row caches columns; the helper *does* extend it but only if the row count of new headers is non-zero | Check server logs — `ensureHeaderRow` logs added columns |

## What this integration does NOT do (yet)

- It does **not** auto-export every call after analysis — exports are manual or only for the back-fill at setup time. (Auto-export-on-call could be added by hooking the dispatcher pattern from Phase A; if you want it, ask in a future round.)
- It does **not** support multiple sheets per agent. One agent = one spreadsheet.
- It does **not** include the call transcript in the export. Recording URL is included; the full transcript stays in Doweit Voice's DB.

## Privacy notes

- Refresh tokens are encrypted at rest with `ENCRYPTION_KEY`
- We use `drive.file` (not `drive`) — we can only read/modify the spreadsheet WE created, not your other Drive files
- The user can revoke at https://myaccount.google.com/permissions any time
