const express = require('express');
const { resyncCurrentSheet } = require('../controllers/analyticsController');

const router = express.Router();

router.post('/resync-current-sheet', resyncCurrentSheet);

module.exports = router;
