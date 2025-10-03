'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const countries = [
  { code: 'US', name: 'United States of America', tableId: 'prctbl_1Rf3NCERPgNNTZ29T5eKAOJm' },
  { code: 'GB', name: 'United Kingdom', tableId: 'prctbl_1Rf3NCERPgNNTZ29T5eKAOJm' },
  { code: 'IN', name: 'India', tableId: 'prctbl_1Rf3NCERPgNNTZ29T5eKAOJm' },
  { code: 'IT', name: 'Italy', tableId: 'prctbl_1Rf3NCERPgNNTZ29T5eKAOJm' },
];

const publishableKey = 'pk_test_51ReejkERPgNNTZ29vkY9l1JPMg4juZK9uqSqTy40aHckcYySNg9VOsma8mw3ROzJ2uDe2vsas2LYwJsO0i3j8Dev00ovS5F6OG';

export function PricingTableSelector() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Stripe pricing table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Render pricing table in the designated container
    const container = document.getElementById('pricing-table-container');
    if (container && isScriptLoaded) {
      container.innerHTML = getPricingTableHTML();
    }
  }, [selectedCountry, isScriptLoaded]);

  const getPricingTableHTML = () => {
    return `
      <style>
        stripe-pricing-table {
          display: block !important;
          width: 100% !important;
          min-width: 1200px !important;
          max-width: none !important;
        }
        @media (max-width: 1280px) {
          stripe-pricing-table {
            min-width: 1000px !important;
          }
        }
        @media (max-width: 768px) {
          stripe-pricing-table {
            min-width: 800px !important;
            overflow-x: auto !important;
          }
        }
      </style>
      <stripe-pricing-table pricing-table-id="${selectedCountry.tableId}" publishable-key="${publishableKey}"></stripe-pricing-table>
    `;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      >
        <span>{selectedCountry.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => {
                setSelectedCountry(country);
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${
                selectedCountry.code === country.code ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
              }`}
            >
              {country.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 