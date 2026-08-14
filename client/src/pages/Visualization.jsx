import React from 'react';
import LookerReport from '../components/LookerReport';

// "Previous Report" — the business owner's most recently saved Looker Studio
// report. Embed URL comes from client/.env (see LookerReport.jsx for setup).
const Visualization = () => {
  return (
    <LookerReport
      title="Previous Report"
      subtitle="Your last saved Looker Studio report"
      embedUrl={import.meta.env.VITE_LOOKER_STUDIO_PREVIOUS_REPORT_URL}
    />
  );
};

export default Visualization;
