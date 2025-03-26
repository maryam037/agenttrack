import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-black text-sm">
            © 2024 Delivery Reviews. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-black hover:text-gray-700 transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-black hover:text-gray-700 transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-black hover:text-gray-700 transition-colors duration-200">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 