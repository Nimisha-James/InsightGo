const fs = require('fs');
const { google } = require('googleapis');

/**
 * Lazily builds an authenticated Google Sheets API client from a service
 * account key file. Returns null (and logs once) if it isn't configured yet,
 * so the rest of the app can treat "Sheets sync not set up" as a normal,
 * non-fatal state rather than crashing the server.
 *
 * Setup: see README.md "Connecting Looker Studio" for the exact Google Cloud
 * Console steps to create the service account and key file.
 */
let cachedClient = null;
let warnedOnce = false;

function getSheetsClient() {
  if (cachedClient) return cachedClient;

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyPath || !fs.existsSync(keyPath)) {
    if (!warnedOnce) {
      console.warn(
        'Google Sheets sync not configured (GOOGLE_SERVICE_ACCOUNT_KEY_PATH missing or file not found). ' +
          'CSV imports will still save to MongoDB; the Current Sales Report just won\'t update. ' +
          'See README.md "Connecting Looker Studio" to set it up.'
      );
      warnedOnce = true;
    }
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  cachedClient = google.sheets({ version: 'v4', auth });
  return cachedClient;
}

module.exports = { getSheetsClient };
