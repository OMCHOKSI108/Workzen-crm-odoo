import React from 'react';
import { smoothScrollTo } from '../utils/animations';

export default function Hero() {
  const handleScrollToDashboard = () => {
    smoothScrollTo('#overview');
  };

  return (
    <section className="hero" role="banner" aria-label="WorkZen HRMS hero section">
      <div className="hero-content">
        <h1 className="hero-headline">
          Welcome to WorkZen HRMS
        </h1>
        <p className="hero-subheading">
          Streamline attendance, leave requests, and payroll with a single, clean dashboard.
        </p>
        <button 
          className="hero-cta" 
          onClick={handleScrollToDashboard}
          aria-label="Scroll to dashboard overview"
        >
          View Dashboard <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  );
}
