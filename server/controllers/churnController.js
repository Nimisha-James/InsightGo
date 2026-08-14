const axios = require('axios');
const path = require('path');
const { exec } = require('child_process');

const ChurnData = require('../models/churnModel');
const WrongPrediction = require('../models/wrongPredictionModel');

/**
 * This whole controller is a direct port of the route handlers that used to
 * live in Churn-Prediction-Using-XAI-and-Reinforcement-Learning/churn-app/db/server.js
 * (the churn app's own Node/Express + MongoDB layer). The prediction/XAI/RL logic
 * itself was never here - it lives untouched in ../../ml-service (predict.py,
 * retrain_with_rl.py). This file only decides when to call that service and how
 * to persist the result, exactly like the original did.
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const WRONG_PREDICTION_THRESHOLD = 5; // same threshold the original used

// POST /churn/save  (was POST /save-churn-data)
const saveChurnData = async (req, res) => {
  try {
    const newEntry = new ChurnData(req.body);
    await newEntry.save();
    res.json({ message: 'Data Saved Successfully!' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /churn/predict  (was POST /predict, proxying to predict.py)
const predictChurn = async (req, res) => {
  try {
    console.log('Received churn prediction request:', req.body);
    const predictionResponse = await axios.post(`${ML_SERVICE_URL}/predict`, req.body);
    console.log('Prediction response from ml-service:', predictionResponse.data);

    const { customer_id } = req.body;
    const { prediction, coupons, cashback } = predictionResponse.data;
    await ChurnData.updateOne(
      { customer_id },
      { $set: { predicted_output: prediction, coupons, cashback } },
      { upsert: true }
    );

    res.json(predictionResponse.data);
  } catch (error) {
    console.error('Error fetching prediction:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    res.status(500).json({ error: 'Prediction failed' });
  }
};

// POST /churn/check-customer  (was POST /check-customer)
const checkCustomer = async (req, res) => {
  try {
    const { customer_id } = req.body;
    const customer = await ChurnData.findOne({ customer_id });
    res.json({ exists: !!customer });
  } catch (error) {
    console.error('Error checking customer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /churn/record-actual-churn  (was POST /record-actual-churn)
const recordActualChurn = async (req, res) => {
  try {
    const { customer_id, actual_output } = req.body;
    console.log(`Received actual churn for customer_id: ${customer_id}, actual_output: ${actual_output}`);

    const customer = await ChurnData.findOne({ customer_id });
    if (!customer) {
      return res.status(404).json({ message: 'Data for this customer ID does not exist in the database.' });
    }

    if (customer.actual_output !== undefined && customer.actual_output !== null) {
      return res.json({
        message: 'Actual output for customer already registered.',
        wrongCount: await WrongPrediction.countDocuments(),
      });
    }

    customer.actual_output = actual_output;
    await customer.save();

    const predicted_output = customer.predicted_output;
    let wrongCount = await WrongPrediction.countDocuments();

    if (predicted_output !== undefined && parseInt(actual_output) !== parseInt(predicted_output)) {
      const existingWrong = await WrongPrediction.findOne({ customer_id });
      if (!existingWrong) {
        const { _id, ...customerData } = customer.toObject();
        const wrongEntry = new WrongPrediction({
          ...customerData,
          actual_output: parseInt(actual_output),
          predicted_output: parseInt(predicted_output),
        });
        await wrongEntry.save();
      }

      wrongCount = await WrongPrediction.countDocuments();

      if (wrongCount >= WRONG_PREDICTION_THRESHOLD) {
        console.log('Triggering RL retraining...');
        // NOTE: the original hardcoded a Windows dev path
        // ("D:\\Churn-Prediction-Using-XAI\\churn-app\\backend\\retrain_with_rl.py").
        // Only the path resolution changed here (to the co-located ml-service
        // folder); the RL retraining script itself is untouched.
        const scriptPath = path.join(__dirname, '..', '..', 'ml-service', 'retrain_with_rl.py');
        const command = `python3 "${scriptPath}"`;
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing RL script: ${error.message}`);
            console.error(`Error details: ${stderr}`);
            return;
          }
          console.log(`RL retraining stdout: ${stdout}`);
          if (stderr) console.error(`RL retraining stderr: ${stderr}`);
          else console.log('RL retraining completed successfully');
        });
        return res.json({
          message: `Actual churn recorded. Total ${WRONG_PREDICTION_THRESHOLD} wrong predictions reached, applying Q-learning.`,
          wrongCount,
        });
      }

      return res.json({
        message: `Actual churn recorded. ${wrongCount} wrongly predicted output(s).`,
        wrongCount,
      });
    }

    res.json({
      message: 'Actual churn recorded successfully. Prediction was correct.',
      wrongCount,
    });
  } catch (error) {
    console.error('Error recording actual churn:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /churn/wrong-prediction-count  (was GET /wrong-prediction-count)
const getWrongPredictionCount = async (req, res) => {
  try {
    const wrongCount = await WrongPrediction.countDocuments();
    res.json({ wrongCount });
  } catch (error) {
    console.error('Error fetching wrong prediction count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  saveChurnData,
  predictChurn,
  checkCustomer,
  recordActualChurn,
  getWrongPredictionCount,
};
