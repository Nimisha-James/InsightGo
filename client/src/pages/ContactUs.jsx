import React from 'react';

const ContactUs = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-cream-300 to-cream-400">
      <h1 className="text-4xl font-semibold text-center mb-6 text-brown-900">
        Contact Us
      </h1>
      <p className="text-lg text-center mb-8 text-brown-700">
        We'd love to hear from you! Please fill out the form below.
      </p>

      <form className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-10 transform hover:scale-105 transition-all duration-500 ease-in-out">
        <div className="mb-6">
          <label className="block text-brown-800 text-sm font-medium mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Your Name"
            className="shadow-lg appearance-none border border-brown-300 rounded-xl w-full py-3 px-4 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500 transition-all duration-300 ease-in-out"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-brown-800 text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Your Email"
            className="shadow-lg appearance-none border border-brown-300 rounded-xl w-full py-3 px-4 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500 transition-all duration-300 ease-in-out"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-brown-800 text-sm font-medium mb-2" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            placeholder="Your Message"
            rows="4"
            className="shadow-lg appearance-none border border-brown-300 rounded-xl w-full py-3 px-4 text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500 transition-all duration-300 ease-in-out"
            required
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-brown-500 hover:bg-brown-600 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brown-600"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactUs;
