const mongoose = require('mongoose');

/**
 * Same shape as the `customer_rs` collection defined in the original
 * churn-app/db/server.js churnSchema. Untouched. Now lives in the single
 * shared `insightgo` database (via the default mongoose connection in
 * server.js) instead of a separate churn_prediction database/connection.
 */
const churnSchema = new mongoose.Schema({
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
  customer_id: { type: Number, unique: true },
  coupons: Number,
  cashback: Number,
  predicted_output: Number,
  actual_output: Number,
});

module.exports = mongoose.model('customer_rs', churnSchema, 'customer_rs');
