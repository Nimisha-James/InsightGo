import React, { useState } from 'react';
import logo from '../assets/logo.jpg';
import { Link } from 'react-router-dom';

function Navbar() {
  const [sideBarMenu, setSideBarMenu] = useState(false);

  const toggleSidebar = () => {
    setSideBarMenu(!sideBarMenu);
  };

  return (
    <nav className="bg-gradient-to-r from-orange-200 to-orange-300 shadow-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto h-20 px-4">
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Bakery Logo"
            className="hidden md:block w-12 rounded-full shadow-lg"
          />
          <a href="#" className="text-2xl md:text-3xl font-bold text-brown-800">
            InsightGo
          </a>
        </div>
        
        <div className="hidden md:flex space-x-6 items-center text-lg text-brown-700">
          <Link to="/" className="hover:text-brown-900 transition duration-300">About Us</Link>
          <Link to="/contact" className="hover:text-brown-900 transition duration-300">Contact</Link>
          <Link to="/signup" className="hover:text-brown-900 transition duration-300">Sign Up</Link>
        </div>

        <div className="md:hidden flex items-center">
          <button onClick={toggleSidebar} className="text-brown-800 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-orange-100 ${sideBarMenu ? 'block' : 'hidden'} transition duration-300`}>
        <Link to="/" className="block px-4 py-2 text-sm text-brown-800 hover:bg-orange-300">About Us</Link>
        <Link to="/contact" className="block px-4 py-2 text-sm text-brown-800 hover:bg-orange-300">Contact</Link>
        <Link to="/signup" className="block px-4 py-2 text-sm text-brown-800 hover:bg-orange-300">Sign Up</Link>
      </div>
    </nav>
  );
}

export default Navbar;
