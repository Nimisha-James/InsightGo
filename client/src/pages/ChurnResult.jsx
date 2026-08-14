import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Churn.css';

/**
 * Themed replacement for the standalone churn-app's src/pages/Predict.js.
 * Same call (POST /predict with the form payload, now via the shared server's
 * /churn/predict proxy). Shows the SHAP feature values as text (per-feature
 * increase/decrease risk) and the LIME plot image — the SHAP *graph* image
 * (result.shap_plot) is intentionally not rendered, by request.
 */
const API_BASE = 'http://localhost:8000';

const ChurnResult = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const formData = location.state?.formData;
        if (!formData) {
          setResult({ error: 'No form data provided. Please fill in the form again.' });
          setLoading(false);
          return;
        }

        const response = await axios.post(`${API_BASE}/churn/predict`, formData, {
          headers: { 'Content-Type': 'application/json' },
        });

        setResult(response.data);
      } catch (error) {
        console.error('Prediction error:', error);
        const errorMsg = error.response?.data?.error || 'Error getting prediction';
        setResult({ error: errorMsg });
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [location]);

  return (
    <div className="churn-page">
      <div className="churn-header">
        <div>
          <h2>Prediction Result</h2>
        </div>
        <div className="churn-header-links">
          <Link to={`/business-owner/${id}/churn`} className="churn-back-link">
            &larr; Predict Another Customer
          </Link>
          <Link to={`/business-owner/${id}`} className="churn-back-link">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="churn-card churn-result-card">
        {loading ? (
          <p className="churn-loading">Predicting… ⏳</p>
        ) : result?.error ? (
          <p className="churn-message churn-message-error">Error: {result.error}</p>
        ) : (
          <>
            <p
              className={
                result.prediction === 1
                  ? 'churn-result-banner churn-result-risk'
                  : 'churn-result-banner churn-result-safe'
              }
            >
              {result.message}
            </p>

            {result.prediction === 1 && (
              <>
                <button
                  className="churn-explain-btn"
                  onClick={() => setShowExplanation((prev) => !prev)}
                >
                  {showExplanation ? 'Hide Explanation' : 'Explain Why (SHAP / LIME)'}
                </button>

                {showExplanation && (
                  <div className="churn-explanation">
                    {result.coupons !== undefined && result.cashback !== undefined && (
                      <p className="churn-rewards">
                        🎁 <strong>{result.coupons}</strong> coupon(s) &amp;{' '}
                        <strong>${result.cashback}</strong> cashback suggested to retain this
                        customer.
                      </p>
                    )}

                    {result.explanation && (
                      <div className="churn-shap-list">
                        <h4>Why Churning Is Possible (SHAP Values)</h4>
                        <ul>
                          {result.explanation.map((item, index) => (
                            <li
                              key={index}
                              className={item.shap_value > 0 ? 'churn-risk-up' : 'churn-risk-down'}
                            >
                              <strong>{item.feature}</strong>: {item.shap_value.toFixed(4)}
                              {item.shap_value > 0 ? ' (↑ Increases Risk)' : ' (↓ Decreases Risk)'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="churn-plots">
                      {result.lime_plot && (
                        <div className="churn-plot-container">
                          <h4>LIME Explanation</h4>
                          <img
                            src={`data:image/png;base64,${result.lime_plot}`}
                            alt="LIME explanation plot"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChurnResult;
