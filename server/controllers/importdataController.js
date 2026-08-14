const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { randomUUID } = require('crypto');
const DynamicModel = require('../models/importdataModel');
const { syncSalesDataToSheet } = require('../services/sheetsSync');

// Set up Multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Parse and import CSV to MongoDB, then push this batch to Google Sheets so
// the "Current Sales Report" Looker Studio embed reflects it. The Sheets
// step runs *after* the MongoDB write succeeds and never blocks or fails the
// import itself — the database is the source of truth; the sheet is a view.
const importCSV = (req, res) => {
  const results = [];
  const filePath = req.file.path;
  const importBatchId = randomUUID();
  const importedAt = new Date().toISOString();

  // Parse CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // Tag each row with when/which-batch it was imported in. Keeps
        // MongoDB's full history (this collection is never cleared) while
        // still letting us identify "the current import" for Sheets sync
        // and future resyncs.
        const taggedResults = results.map((row) => ({
          ...row,
          _importBatchId: importBatchId,
          _importedAt: importedAt,
        }));

        await DynamicModel.insertMany(taggedResults);

        const sheetSync = await syncSalesDataToSheet(taggedResults);

        res.status(201).json({
          message: 'CSV data imported successfully into import_data',
          rowsImported: taggedResults.length,
          sheetSync,
        });
      } catch (error) {
        res.status(500).json({ message: 'Error inserting data into MongoDB', error });
      }
      // Remove the CSV file after processing
      fs.unlinkSync(filePath);
    });
};

module.exports = { upload, importCSV };
