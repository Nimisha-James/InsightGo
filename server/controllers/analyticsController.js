const DynamicModel = require('../models/importdataModel');
const { syncSalesDataToSheet } = require('../services/sheetsSync');

// POST /analytics/resync-current-sheet
// Re-pushes the most recent CSV import batch to Google Sheets. Useful if the
// automatic sync failed (e.g. credentials weren't configured yet at import
// time) or you just want to force a refresh without re-uploading a CSV.
const resyncCurrentSheet = async (req, res) => {
  try {
    const latest = await DynamicModel.findOne({ _importBatchId: { $exists: true } })
      .sort({ _importedAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({ message: 'No CSV imports found to resync.' });
    }

    const batch = await DynamicModel.find({ _importBatchId: latest._importBatchId }).lean();
    const sheetSync = await syncSalesDataToSheet(batch);

    res.json({
      message: `Resynced batch from ${latest._importedAt}.`,
      rowsFound: batch.length,
      sheetSync,
    });
  } catch (error) {
    console.error('Resync error:', error);
    res.status(500).json({ message: 'Error resyncing to Google Sheets', error: error.message });
  }
};

module.exports = { resyncCurrentSheet };
