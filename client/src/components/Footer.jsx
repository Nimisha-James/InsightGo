import React from 'react';
import { Link } from 'react-router-dom'; 
import logo from '../assets/logo.jpg';

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-brown-950 to-brown-900 text-brown-200 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div className="flex flex-col items-center md:items-start text-sm">
            <img
              src={logo}
              alt="Business Insights Logo"
              className="w-20 mb-3"
            />
            <p>&copy; {new Date().getFullYear()} InsightGo. All rights reserved.</p>
          </div>

          <div className="space-x-8">
            <Link to="/" className="text-brown-300 hover:text-cream-100 transition-colors duration-300">
              About Us
            </Link>
            <Link to="/contact" className="text-brown-300 hover:text-cream-100 transition-colors duration-300">
              Contact
            </Link>
            <Link to="/signup" className="text-brown-300 hover:text-cream-100 transition-colors duration-300">
              Sign Up
            </Link>
          </div>

          <div className="flex space-x-6">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400 hover:text-blue-500 transition-colors duration-300"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M22.675 0h-21.35C.592 0 0 .593 0 1.326v21.348C0 23.408.592 24 1.325 24h11.495v-9.294H9.685v-3.622h3.136V8.41c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.506 0-1.796.716-1.796 1.764v2.313h3.587l-.467 3.622h-3.12V24h6.116c.733 0 1.326-.592 1.326-1.326V1.326C24 .593 23.408 0 22.675 0z"
                />
              </svg>
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400 hover:text-blue-400 transition-colors duration-300"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M23.643 4.937c-.835.371-1.732.622-2.675.734a4.658 4.658 0 0 0 2.046-2.568 9.325 9.325 0 0 1-2.953 1.13A4.64 4.64 0 0 0 16.617 3c-2.569 0-4.645 2.078-4.645 4.643 0 .365.042.722.122 1.065-3.862-.195-7.286-2.043-9.576-4.855a4.632 4.632 0 0 0-.63 2.334c0 1.612.821 3.04 2.068 3.876a4.623 4.623 0 0 1-2.105-.581v.059c0 2.254 1.605 4.136 3.737 4.563-.392.107-.807.165-1.233.165-.302 0-.596-.03-.883-.086.597 1.868 2.33 3.23 4.383 3.267a9.308 9.308 0 0 1-5.766 1.99c-.374 0-.743-.022-1.106-.065A13.142 13.142 0 0 0 7.45 21c8.54 0 13.207-7.075 13.207-13.209 0-.202-.005-.404-.014-.605A9.478 9.478 0 0 0 24 4.57a9.247 9.247 0 0 1-2.357.647z"
                />
              </svg>
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400 hover:text-blue-700 transition-colors duration-300"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M22.23 0H1.77C.79 0 0 .774 0 1.727v20.546C0 23.226.79 24 1.77 24h20.46c.98 0 1.77-.774 1.77-1.727V1.727C24 .774 23.21 0 22.23 0zM7.06 20.452H3.583V9.03H7.06v11.422zM5.32 7.52a2.106 2.106 0 1 1 .002-4.212 2.106 2.106 0 0 1-.002 4.213zm14.452 12.932h-3.478v-5.575c0-1.328-.025-3.038-1.852-3.038-1.853 0-2.137 1.448-2.137 2.944v5.669h-3.477V9.03h3.337v1.56h.046c.464-.88 1.596-1.805 3.286-1.805 3.515 0 4.167 2.313 4.167 5.32v6.346z"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-brown-800 pt-6 text-center text-brown-400 text-sm">
          <p>Designed by InsightGo Team</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
