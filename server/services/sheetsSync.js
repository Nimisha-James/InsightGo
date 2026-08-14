const { getSheetsClient } = require('../config/googleSheets');

// Fields we tag onto rows internally (see importdataController.js) that
// shouldn't show up as spreadsheet columns for the business owner.
const INTERNAL_FIELDS = new Set(['_id', '__v', '_importBatchId']);

const DEFAULT_TAB_NAME = 'CurrentSalesData';
const DEFAULT_MAX_ROWS = 50000; // keep individual imports well under Sheets' cell/quota limits
const CHUNK_SIZE = 2000; // rows per Sheets API write, to keep each request small

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pushes the given rows (a single CSV import's worth of data, or a resynced
 * batch) into the configured Google Sheet, replacing whatever was there
 * before — this Sheet always reflects the *current* import, not the full
 * history (MongoDB's import_data collection is where full history lives).
 *
 * Looker Studio's native Google Sheets connector then reads this Sheet,
 * refreshing whenever the report is opened or manually refreshed (Looker
 * Studio has no true push/websocket mode — this is as close to "real-time"
 * as an embedded report gets without a paid connector).
 *
 * Safe to call even when Sheets isn't configured yet: returns a
 * `{ synced: false, reason }` result instead of throwing, so a CSV import
 * still succeeds and saves to MongoDB even if this step is skipped.
 */
async function syncSalesDataToSheet(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { synced: false, reason: 'no_rows' };
  }

  const sheets = getSheetsClient();
  if (!sheets) {
    return { synced: false, reason: 'not_configured' };
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    console.warn('GOOGLE_SHEET_ID not set — skipping Google Sheets sync.');
    return { synced: false, reason: 'no_sheet_id' };
  }

  const tabName = process.env.GOOGLE_SHEET_TAB_NAME || DEFAULT_TAB_NAME;

  const truncated = rows.length > DEFAULT_MAX_ROWS;
  const rowsToSync = truncated ? rows.slice(0, DEFAULT_MAX_ROWS) : rows;
  if (truncated) {
    console.warn(
      `Sheets sync: import has ${rows.length} rows, syncing the first ${DEFAULT_MAX_ROWS} to stay within Sheets' limits.`
    );
  }

  const header = Object.keys(rowsToSync[0]).filter((key) => !INTERNAL_FIELDS.has(key));
  const values = [
    header,
    ...rowsToSync.map((row) => header.map((key) => (row[key] === undefined || row[key] === null ? '' : String(row[key])))),
  ];

  try {
    // Wipe the tab first so this fully replaces the previous "current" snapshot.
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: tabName,
    });

    for (let i = 0; i < values.length; i += CHUNK_SIZE) {
      const chunk = values.slice(i, i + CHUNK_SIZE);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tabName}!A${i + 1}`,
        valueInputOption: 'RAW',
        requestBody: { values: chunk },
      });
      if (i + CHUNK_SIZE < values.length) {
        await sleep(300); // stay well under Sheets API write-quota bursts
      }
    }

    console.log(`Sheets sync: wrote ${rowsToSync.length} rows to "${tabName}".`);
    return { synced: true, rowsSynced: rowsToSync.length, truncated };
  } catch (error) {
    console.error('Sheets sync failed:', error.message);
    return { synced: false, reason: 'sheets_api_error', error: error.message };
  }
}

module.exports = { syncSalesDataToSheet };
