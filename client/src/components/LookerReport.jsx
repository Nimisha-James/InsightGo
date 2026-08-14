import React from 'react';
import '../styles/Visualization.css';

/**
 * Renders a Looker Studio report embed, or a themed placeholder when no
 * embed URL is configured yet.
 *
 * `embedUrl` is meant to come from a Vite env var (VITE_LOOKER_STUDIO_CURRENT_REPORT_URL,
 * see client/.env.example) rather than being hardcoded in a page component —
 * so connecting the real report is a one-line .env change and a restart, not
 * a code edit. To go live:
 *   1. Build the report in Looker Studio against a connected data source.
 *   2. File -> Embed report -> enable embedding -> copy the embed URL.
 *   3. Put it in client/.env as VITE_LOOKER_STUDIO_CURRENT_REPORT_URL.
 */
const LookerReport = ({ title, subtitle, embedUrl }) => {
  return (
    <div className="viz-page">
      <div className="viz-frame-card">
        {embedUrl ? (
          <iframe src={embedUrl} title={title} allowFullScreen />
        ) : (
          <div className="viz-placeholder">
            <svg
              className="viz-placeholder-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="4" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 15l3-4 2.5 2.5L17 9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 20h18" strokeLinecap="round" />
            </svg>
            <h3>Looker Studio report not connected yet</h3>
            <p>
              This page will embed a live Looker Studio report once one is
              built and shared. Set <code>VITE_LOOKER_STUDIO_CURRENT_REPORT_URL</code> in{' '}
              <code>client/.env</code> to switch this on.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LookerReport;
