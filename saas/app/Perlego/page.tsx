'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import heroImage from '../../docs/Perlego.png';
import StarterPaymentModal from '@/components/ui/starter-payment-modal';

export default function PerlegoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'perlego-monthly' | 'perlego-termly' | 'perlego-annual'>('perlego-monthly');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get('checkout');
    const sessionId = urlParams.get('session_id');

    if (checkoutStatus === 'success' && sessionId) {
      handleCheckoutSuccess(sessionId);
    } else if (checkoutStatus === 'cancelled') {
      setMessage('Checkout was cancelled. You can try again anytime.');
      setMessageType('error');
    }

    if (checkoutStatus) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCheckoutSuccess = async (sessionId: string) => {
    setIsProcessing(true);
    setMessage('Processing your payment and setting up your account...');
    setMessageType('success');

    try {
      const response = await fetch('/api/process-checkout-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (data.success) {
        const planName = selectedPlan === 'perlego-monthly' ? 'Monthly' : selectedPlan === 'perlego-termly' ? 'Termly' : 'Annual';
        const customerId = data.customerId || data.customer?.id;
        const subscriptionId = data.subscriptionId || data.billing?.rateCardSubscriptionId || data.billing?.billingIntentId;
        const testClockInfo = data.testClock ? `, Test Clock: ${data.testClock.id}` : '';
        setMessage(`🎉 Success! Welcome ${data.customer?.name || 'Customer'}! Your Perlego ${planName} Plan is now active. Customer ID: ${customerId}, Subscription ID: ${subscriptionId}${testClockInfo}`);
        setMessageType('success');
      } else {
        throw new Error(data.details || data.error);
      }
    } catch (error) {
      setMessage(`Error processing your payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMonthlyClick = () => {
    setSelectedPlan('perlego-monthly');
    setIsModalOpen(true);
    setMessage('');
    setMessageType('');
  };

  const handleTermlyClick = () => {
    setSelectedPlan('perlego-termly');
    setIsModalOpen(true);
    setMessage('');
    setMessageType('');
  };

  const handleAnnualClick = () => {
    setSelectedPlan('perlego-annual');
    setIsModalOpen(true);
    setMessage('');
    setMessageType('');
  };

  const handleModalSuccess = (data: { customerId: string; billingIntentId?: string; subscriptionId?: string; testClockId?: string }) => {
    const planName = selectedPlan === 'perlego-monthly' ? 'Monthly' : selectedPlan === 'perlego-termly' ? 'Termly' : 'Annual';
    const subscriptionId = data.subscriptionId || data.billingIntentId;
    const testClockInfo = data.testClockId ? `, Test Clock: ${data.testClockId}` : '';
    setMessage(`Success! Customer created and subscribed to Perlego ${planName} plan. Customer ID: ${data.customerId}, Subscription ID: ${subscriptionId}${testClockInfo}`);
    setMessageType('success');
    setIsModalOpen(false);
  };

  const handleModalError = (error: string) => {
    setMessage(`Error: ${error}`);
    setMessageType('error');
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'white' }}>
      <section className="relative w-full h-56 md:h-72 lg:h-80">
        <Image src={heroImage} alt="Perlego Header" fill priority className="object-contain" />
      </section>

      {/* Message Banner */}
      {message && (
        <div className={`mx-auto max-w-7xl px-4 py-4 ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-lg mb-6`}>
          {message}
        </div>
      )}

      {/* Plan cards */}
      <section className="py-10 px-4">
        <div className="mx-auto max-w-7xl mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Perlego Subscription Plans</h1>
          <p className="text-center text-gray-600 text-lg">Choose the perfect plan for your reading journey</p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Perlego-Monthly card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Perlego-Monthly</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-2xl mr-1">£</span>12
                <span className="text-base font-medium text-gray-500 ml-1">/ month</span>
              </div>
              <div className="text-gray-500 text-sm mb-6">Pay monthly, cancel anytime</div>
              <button
                onClick={handleMonthlyClick}
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >
                {isProcessing ? 'Processing...' : 'Subscribe'}
              </button>
              <div className="text-gray-700 text-sm mt-6">Flexible monthly subscription</div>
            </div>

            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Monthly includes:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Unlimited book access</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Download books offline</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Note-taking & highlights</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Multi-device sync</span></li>
              </ul>
            </div>
          </div>

          {/* Perlego-Termly card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6 border-2 border-[#2A0148]">
            <div className="text-center">
              <div className="inline-block bg-[#2A0148] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">POPULAR</div>
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Perlego-Termly</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-2xl mr-1">£</span>10
                <span className="text-base font-medium text-gray-500 ml-1">/ month</span>
              </div>
              <div className="text-gray-500 text-sm mb-6">Billed every 3 months (£30)</div>
              <button
                onClick={handleTermlyClick}
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >
                {isProcessing ? 'Processing...' : 'Subscribe'}
              </button>
              <div className="text-gray-700 text-sm mt-6">Save 17% with termly billing</div>
            </div>
            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Everything in Monthly, plus:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>17% cost savings</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Priority support</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Advanced search</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Export citations</span></li>
              </ul>
            </div>
          </div>

          {/* Perlego-Annual card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">BEST VALUE</div>
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Perlego-Annual</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-2xl mr-1">£</span>8
                <span className="text-base font-medium text-gray-500 ml-1">/ month</span>
              </div>
              <div className="text-gray-500 text-sm mb-6">Billed annually (£96)</div>
              <button
                onClick={handleAnnualClick}
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >
                {isProcessing ? 'Processing...' : 'Subscribe'}
              </button>
              <div className="text-gray-700 text-sm mt-6">Save 33% with annual billing</div>
            </div>

            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Everything in Termly, plus:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>33% cost savings</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Premium support</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Early access to new books</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Exclusive webinars</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <StarterPaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        planType={selectedPlan}
      />
    </main>
  );
}

