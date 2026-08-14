const { getSheetsClient } = require('../config/googleSheets');

// Fields we tag onto rows internally (see importdataController.js) that
// shouldn't show up as spreadsheet columns for the business owner.
const INTERNAL_FIELDS = new Set(['_id', '__v', '_importBatchId', '_importedAt']);

const DEFAULT_TAB_NAME = 'CurrentSalesData';
// Google Sheets supports ~10M cells per spreadsheet. This project's sample
// sales_data.csv is ~17 columns, so 200,000 rows is still well under 4M
// cells — plenty of headroom while still guarding against a truly enormous
// one-off import blowing the quota.
const DEFAULT_MAX_ROWS = 200000;
const CHUNK_SIZE = 2000; // rows per Sheets API write, to keep each request small

// Matches D/M/YY, DD/MM/YYYY, etc. CSVs like this project's sample sales_data.csv
// write dates as "13/04/20" (day-first). That's ambiguous to both Sheets and
// Looker Studio's auto date-parser — Looker Studio silently mis-parsed these
// into garbage sequential dates, breaking every time-series chart. Normalizing
// to ISO (YYYY-MM-DD) before the value ever reaches Sheets removes the
// ambiguity for every downstream reader, not just Looker Studio.
const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;

function normalizeCellValue(value) {
  if (typeof value !== 'string') return value;
  const match = value.match(DATE_PATTERN);
  if (!match) return value;
  let [, day, month, year] = match;
  if (Number(month) > 12) return value; // not actually day-first if this fails too; leave as-is
  if (year.length === 2) year = `20${year}`;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

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
    ...rowsToSync.map((row) =>
      header.map((key) =>
        row[key] === undefined || row[key] === null ? '' : normalizeCellValue(String(row[key]))
      )
    ),
  ];

  try {
    // A brand-new Sheet tab has a fixed default grid (commonly 1000-2000 rows
    // x 26 columns) — values.update/clear can't write past that boundary, it
    // doesn't auto-expand. Look up the tab and grow its grid first if this
    // batch needs more room than it currently has.
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const targetSheet = meta.data.sheets.find((s) => s.properties.title === tabName);
    if (!targetSheet) {
      const available = meta.data.sheets.map((s) => s.properties.title).join(', ');
      throw new Error(
        `No tab named "${tabName}" in this spreadsheet. Available tabs: ${available || '(none)'}. ` +
          `Either rename a tab to "${tabName}" or set GOOGLE_SHEET_TAB_NAME to match an existing one.`
      );
    }

    const grid = targetSheet.properties.gridProperties || {};
    const neededRows = values.length + 10; // small buffer
    const neededCols = header.length + 2;
    if ((grid.rowCount || 0) < neededRows || (grid.columnCount || 0) < neededCols) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: targetSheet.properties.sheetId,
                  gridProperties: {
                    rowCount: Math.max(neededRows, grid.rowCount || 0),
                    columnCount: Math.max(neededCols, grid.columnCount || 0),
                  },
                },
                fields: 'gridProperties.rowCount,gridProperties.columnCount',
              },
            },
          ],
        },
      });
    }

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
        // USER_ENTERED (not RAW): tells Sheets to parse each value the way
        // manual typing would — "3344.69" becomes a real number cell,
        // "2023-04-13" becomes a real date cell. RAW stores everything as
        // literal text instead, which made Looker Studio auto-detect Sales/
        // Profit/Discount as Text fields and silently default their charts
        // to Count Distinct instead of Sum.
        valueInputOption: 'USER_ENTERED',
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
