'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const countries = [
  { code: 'GB', name: 'United Kingdom', tableId: 'prctbl_1RcDNtPMHvg98WVIrJuC5BAT' },
  { code: 'IT', name: 'Italy', tableId: 'prctbl_1RdGPZPMHvg98WVIGF6hNpLr' },
  { code: 'US', name: 'United States of America', tableId: 'prctbl_1RdGPEPMHvg98WVIvByOCvIX' },
  { code: 'IN', name: 'India', tableId: 'prctbl_1RdGOGPMHvg98WVIAIrVaqfe' },
];

const publishableKey = 'pk_test_51RZVn4PMHvg98WVIxlk1xz3e5JppHuSKVxByT5d4onRCLsXqtNyZcIxqNy91ZvQ4zwwpzNWXBHE11YTDvjNOVCIx006K0IeJAF';

export function CreditTableSelector() {
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
    // Render credit pricing table in the designated container
    const container = document.getElementById('credit-table-container');
    if (container && isScriptLoaded) {
      container.innerHTML = getCreditTableHTML();
    }
  }, [selectedCountry, isScriptLoaded]);

  const getCreditTableHTML = () => {
    return `
      <style>
        stripe-pricing-table {
          display: block !important;
          width: 100% !important;
          min-width: 800px !important;
        }
        @media (max-width: 768px) {
          stripe-pricing-table {
            min-width: 100% !important;
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