const express = require('express');
const {
  saveChurnData,
  predictChurn,
  checkCustomer,
  recordActualChurn,
  getWrongPredictionCount,
} = require('../controllers/churnController.js');

const router = express.Router();

router.post('/save', saveChurnData);
router.post('/predict', predictChurn);
router.post('/check-customer', checkCustomer);
router.post('/record-actual-churn', recordActualChurn);
router.get('/wrong-prediction-count', getWrongPredictionCount);

module.exports = router;
