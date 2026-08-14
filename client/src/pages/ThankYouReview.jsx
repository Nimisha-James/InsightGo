import React from 'react';
import '../styles/ThankYouPage.css';

const ThankYouReview = () => {
  return (
    <div className="thank-you-page">
      <h1>Thank You for Shopping!</h1><br />
      <p>We hope you enjoyed your shopping experience!</p>
      <p>Come back soon for more fantastic treats.</p><br />
      <button onClick={() => window.location.href = '/'}>Return to Home</button>
    </div>
  );
};

export default ThankYouReview;