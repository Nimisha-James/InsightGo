import React from 'react';
import LookerReport from '../components/LookerReport';

// "Current Sales Report" — rebuilt after every CSV import. Embed URL comes
// from client/.env (see LookerReport.jsx for setup).
const RecentVisualization = () => {
  return (
    <LookerReport
      title="Current Sales Report"
      subtitle="Live view of your most recently imported sales data"
      embedUrl={import.meta.env.VITE_LOOKER_STUDIO_CURRENT_REPORT_URL}
    />
  );
};

export default RecentVisualization;
