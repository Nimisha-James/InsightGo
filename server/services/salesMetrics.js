const DynamicModel = require('../models/importdataModel');

// import_data rows store "Sales Date" exactly as it appears in the source CSV
// (e.g. "11/03/23") — ambiguous day-first strings, same problem sheetsSync.js
// solves for Looker Studio. Duplicated here (rather than imported) because
// this only needs a JS Date back, not a re-formatted string for a Sheets
// write, and it keeps this file independent of the Sheets pipeline.
const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;

function parseSalesDate(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(DATE_PATTERN);
  if (!match) return null;
  let [, day, month, year] = match;
  if (Number(month) > 12) return null; // not actually day-first; bail rather than guess
  if (year.length === 2) year = `20${year}`;
  const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseAmount(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * The sales chatbot's answers are meant to match what the owner sees on the
 * embedded Looker Studio report. That report reads from Google Sheets, and
 * sheetsSync.js always wipes + replaces the sheet with only the *latest* CSV
 * import (see its header comment) — not the full import_data history. So
 * every metric here scopes to that same "current batch", using the same
 * latest-batch lookup analyticsController.js uses for resyncing.
 */
async function getCurrentBatchRows() {
  const latest = await DynamicModel.findOne({ _importBatchId: { $exists: true } })
    .sort({ _importedAt: -1 })
    .lean();
  if (!latest) return [];
  return DynamicModel.find({ _importBatchId: latest._importBatchId }).lean();
}

async function getTotalSales() {
  const rows = await getCurrentBatchRows();
  if (rows.length === 0) return { totalSales: 0, orderCount: 0, note: 'No sales data imported yet.' };
  const total = rows.reduce((sum, r) => sum + parseAmount(r['Sales']), 0);
  return { totalSales: round2(total), orderCount: rows.length };
}

async function getSalesByState() {
  const rows = await getCurrentBatchRows();
  if (rows.length === 0) return { breakdown: [], note: 'No sales data imported yet.' };
  const byState = {};
  for (const r of rows) {
    const state = r['State'] || 'Unknown';
    byState[state] = (byState[state] || 0) + parseAmount(r['Sales']);
  }
  const breakdown = Object.entries(byState)
    .map(([state, sales]) => ({ state, sales: round2(sales) }))
    .sort((a, b) => b.sales - a.sales);
  return { breakdown };
}

async function getSalesByItem() {
  const rows = await getCurrentBatchRows();
  if (rows.length === 0) return { breakdown: [], note: 'No sales data imported yet.' };
  const byItem = {};
  for (const r of rows) {
    const item = r['Category of Goods'] || 'Unknown';
    byItem[item] = (byItem[item] || 0) + parseAmount(r['Sales']);
  }
  const breakdown = Object.entries(byItem)
    .map(([item, sales]) => ({ item, sales: round2(sales) }))
    .sort((a, b) => b.sales - a.sales);
  return { breakdown };
}

async function getSalesTrend() {
  const rows = await getCurrentBatchRows();
  if (rows.length === 0) return { trend: [], note: 'No sales data imported yet.' };
  const byMonth = {};
  for (const r of rows) {
    const date = parseSalesDate(r['Sales Date']);
    if (!date) continue;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] || 0) + parseAmount(r['Sales']);
  }
  const trend = Object.entries(byMonth)
    .map(([month, sales]) => ({ month, sales: round2(sales) }))
    .sort((a, b) => a.month.localeCompare(b.month));
  return { trend };
}

module.exports = { getTotalSales, getSalesByState, getSalesByItem, getSalesTrend };
