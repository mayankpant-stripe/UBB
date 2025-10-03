'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ManageSubPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initialCustomer = params.get('customerid') || '';
  const [customerId, setCustomerId] = useState(initialCustomer);

  useEffect(() => {
    // If opened with a customerid, redirect straight to the success page
    if (initialCustomer) {
      router.replace(`/newhack/success?customerid=${encodeURIComponent(initialCustomer)}`);
    }
  }, [initialCustomer, router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#1e1259' }}>
      <div className="max-w-lg w-full bg-purple-900 border-2 border-yellow-500 rounded-2xl p-6 text-white">
        <h1 className="text-xl font-semibold mb-4">Manage Subscription</h1>
        <p className="text-sm mb-4 text-white/80">Enter a Customer ID to view subscription details and record usage.</p>
        <div className="space-y-3">
          <input
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="cus_..."
            className="w-full px-3 py-2 rounded-md text-gray-900"
          />
          <button
            onClick={() => {
              if (!customerId) return;
              router.push(`/newhack/success?customerid=${encodeURIComponent(customerId)}`);
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg"
          >
            View Customer Details
          </button>
        </div>
      </div>
    </main>
  );
}


