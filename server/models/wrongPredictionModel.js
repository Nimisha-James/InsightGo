const mongoose = require('mongoose');

/**
 * Same shape as the `wrong_predictions` collection defined in the original
 * churn-app/db/server.js wrongPredictionSchema. Untouched. Now lives in the
 * single shared `insightgo` database instead of a separate connection.
 */
const wrongPredictionSchema = new mongoose.Schema({
  customer_id: Number,
  tenure: Number,
  cityTier: Number,
  warehouseToHome: Number,
  gender: Number,
  hoursSpentOnApp: Number,
  devicesRegistered: Number,
  preferredOrderCategory: Number,
  satisfactionScore: Number,
  maritalStatus: Number,
  numberOfAddresses: Number,
  complaints: Number,
  orderAmountHike: Number,
  daysSinceLastOrder: Number,
  predicted_output: Number,
  actual_output: Number,
  coupons: Number,
  cashback: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('wrong_predictions', wrongPredictionSchema, 'wrong_predictions');
