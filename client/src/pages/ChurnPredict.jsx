import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Churn.css';

/**
 * Business-owner-facing churn prediction form.
 *
 * This is the Local-Business-Insight-Platform-themed replacement for the
 * standalone churn-app's src/pages/Home.js — same fields, same two API calls
 * (save the record, then read back the running wrong-prediction count), same
 * "record the real outcome later" panel that feeds the Q-learning retraining
 * loop. Only the layout/CSS and the API base (now the single :8000 server's
 * /churn/* routes instead of a separate :5000 churn server) changed.
 */
const API_BASE = 'http://localhost:8000';

const initialFormData = {
  tenure: '',
  cityTier: '',
  warehouseToHome: '',
  gender: '',
  hoursSpentOnApp: '',
  devicesRegistered: '',
  preferredOrderCategory: '',
  satisfactionScore: '',
  maritalStatus: '',
  numberOfAddresses: '',
  complaints: '',
  orderAmountHike: '',
  daysSinceLastOrder: '',
  customer_id: '',
};

const labelMappings = {
  Gender: { Female: 0, Male: 1 },
  PreferedOrderCat: {
    Fashion: 0,
    Grocery: 1,
    'Laptop & Accessory': 2,
    Mobile: 3,
    'Mobile Phone': 4,
    Others: 5,
  },
  MaritalStatus: { Divorced: 0, Married: 1, Single: 2 },
};

const fieldRows = [
  [
    { name: 'tenure', label: 'Tenure (Months)' },
    { name: 'cityTier', label: 'City Tier' },
  ],
  [
    { name: 'warehouseToHome', label: 'Warehouse to Home (km)' },
    { name: 'gender', label: 'Gender' },
  ],
  [
    { name: 'hoursSpentOnApp', label: 'Hours Spent on App' },
    { name: 'devicesRegistered', label: 'Devices Registered' },
  ],
  [
    { name: 'preferredOrderCategory', label: 'Preferred Order Category' },
    { name: 'satisfactionScore', label: 'Satisfaction Score' },
  ],
  [
    { name: 'maritalStatus', label: 'Marital Status' },
    { name: 'numberOfAddresses', label: 'Number of Addresses' },
  ],
  [
    { name: 'complaints', label: 'Complaints' },
    { name: 'orderAmountHike', label: 'Order Amount Hike (%)' },
  ],
  [
    { name: 'daysSinceLastOrder', label: 'Days Since Last Order' },
    { name: 'customer_id', label: 'Customer ID' },
  ],
];

const ChurnPredict = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [actualData, setActualData] = useState({ customer_id: '', actual_output: '' });
  const [actualMessage, setActualMessage] = useState('');
  const [wrongPredictionInfo, setWrongPredictionInfo] = useState({ wrongCount: 0, message: '' });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchWrongPredictionCount();
  }, []);

  const fetchWrongPredictionCount = async () => {
    try {
      const response = await axios.get(`${API_BASE}/churn/wrong-prediction-count`);
      const wrongCount = response.data.wrongCount;
      setWrongPredictionInfo({
        wrongCount,
        message:
          wrongCount >= 5
            ? 'Total 5 wrong predictions reached, applying Q-learning.'
            : `${wrongCount} wrongly predicted output(s).`,
      });
    } catch (error) {
      console.error('Error fetching wrong prediction count:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE}/churn/save`, formData);
      navigate('result', { state: { formData } });
      void response;
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActualChange = (e) => {
    setActualData({ ...actualData, [e.target.name]: e.target.value });
    setActualMessage('');
  };

  const handleRecordActualChurn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/churn/record-actual-churn`, actualData);
      setActualMessage(response.data.message || 'Actual churn recorded successfully.');
      if (
        !response.data.message.includes('already registered') &&
        !response.data.message.includes('does not exist')
      ) {
        setActualData({ customer_id: '', actual_output: '' });
      }
      fetchWrongPredictionCount();
    } catch (error) {
      if (error.response?.status === 404) {
        setActualMessage("Data doesn't exist for this Customer ID.");
      } else {
        console.error('Error recording actual churn:', error);
        setActualMessage('Error recording actual churn: ' + error.message);
      }
    }
  };

  return (
    <div className="churn-page">
      <div className="churn-header">
        <div>
          <h2>Predict Customer Churn</h2>
        </div>
        <Link to={`/business-owner/${id}`} className="churn-back-link">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="churn-grid">
        <div className="churn-card">
          <h3>Customer Details</h3>
          <form onSubmit={handleSubmit} className="churn-form">
            {fieldRows.map((row) => (
              <div className="churn-form-row" key={row.map((f) => f.name).join('-')}>
                {row.map((field) => (
                  <div className="churn-form-group" key={field.name}>
                    <label>{field.label}</label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ))}
              </div>
            ))}
            <button type="submit" disabled={submitting}>
              {submitting ? 'Predicting…' : 'Predict Churn'}
            </button>
          </form>
          <p className="churn-wrong-count">{wrongPredictionInfo.message}</p>
        </div>

        <div className="churn-sidebar">
          <div className="churn-card">
            <h3>Update Actual Outcome</h3>
            <form onSubmit={handleRecordActualChurn} className="churn-form">
              <div className="churn-form-group">
                <label>Customer ID</label>
                <input
                  type="number"
                  name="customer_id"
                  value={actualData.customer_id}
                  onChange={handleActualChange}
                  required
                />
              </div>
              <div className="churn-form-group">
                <label>Actual Output (0 = stayed, 1 = churned)</label>
                <input
                  type="number"
                  name="actual_output"
                  value={actualData.actual_output}
                  onChange={handleActualChange}
                  min="0"
                  max="1"
                  required
                />
              </div>
              <button type="submit">Record Outcome</button>
              {actualMessage && (
                <p
                  className={
                    actualMessage.toLowerCase().includes('error') ||
                    actualMessage.includes("doesn't exist") ||
                    actualMessage.includes('already registered')
                      ? 'churn-message churn-message-error'
                      : 'churn-message churn-message-success'
                  }
                >
                  {actualMessage}
                </p>
              )}
            </form>
          </div>

          <div className="churn-card">
            <h3>Encoding Reference</h3>
            {Object.entries(labelMappings).map(([category, mapping]) => (
              <div key={category} className="churn-encoding">
                <strong>{category}</strong>
                <ul>
                  {Object.entries(mapping).map(([label, value]) => (
                    <li key={value}>
                      {label}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurnPredict;
