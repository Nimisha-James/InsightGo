import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

function About() {
  return (
    <div className="min-h-screen flex items-center justify-center px-10 py-12 bg-gradient-to-b from-cream-100 to-cream-400">
      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto p-12 animate-fadeIn rounded-lg shadow-2xl bg-white bg-opacity-80 backdrop-blur-md">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Business Insights Logo"
            className="hidden md:inline-block w-40 h-40 rounded-full border-4 border-brown-300 shadow-lg mb-6"
          />
          <h1 className="text-5xl md:text-6xl font-bold text-brown-900 mb-4">
            Welcome to InsightGo
          </h1>
        </div>

        {/* Card Box */}
        <div className="bg-brown-300 p-10 rounded-2xl shadow-lg border-t-8 border-cream-400 text-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <p className="text-brown-900 text-lg md:text-xl leading-relaxed mb-6">
            At <span className="font-semibold">InsightGo</span>,
            we empower local businesses with tailored insights to thrive in the competitive world of small business. Whether it's a cozy bakery or a fast-growing enterprise, our analytics are crafted to help you make meaningful decisions.
          </p>
          <p className="text-brown-900 text-lg md:text-xl leading-relaxed mb-8">
            Register now to gain exclusive insights and discover strategies that elevate your business to new heights.
          </p>
          <Link to="/signup">
            <button className="bg-brown-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:bg-brown-600 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-brown-600 focus:ring-opacity-50">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
