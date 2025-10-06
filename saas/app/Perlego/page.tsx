'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import heroImage from '../../docs/ElevenLabs.png';
import StarterPaymentModal from '@/components/ui/starter-payment-modal';

export default function PerlegoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'advanced' | 'pro' | 'core' | 'free'>('starter');

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
        const planName = selectedPlan === 'advanced' ? 'Advanced' : 'Starter';
        const customerId = data.customerId || data.customer?.id;
        const subscriptionId = data.subscriptionId || data.billing?.rateCardSubscriptionId || data.billing?.billingIntentId;
        const testClockInfo = data.testClock ? `, Test Clock: ${data.testClock.id}` : '';
        setMessage(`🎉 Success! Welcome ${data.customer?.name || 'Customer'}! Your ${planName} Plan is now active. Customer ID: ${customerId}, Subscription ID: ${subscriptionId}${testClockInfo}`);
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

  const handleStarterClick = () => {
    setSelectedPlan('starter');
    setIsModalOpen(true);
    setMessage('');
    setMessageType('');
  };

  const handleAdvancedClick = () => {
    setSelectedPlan('advanced');
    setIsModalOpen(true);
    setMessage('');
    setMessageType('');
  };

  const handleProClick = () => {
    setSelectedPlan('pro');
    setIsModalOpen(true);
    setMessage('');
    setMessageType('');
  };

  const handleCoreClick = () => {
    setSelectedPlan('core');
    setIsModalOpen(true);
    setMessage('');
    setMessageType('');
  };

  const handleFreeClick = () => {
    setSelectedPlan('free');
    setIsModalOpen(true);
    setMessage('');
    setMessageType('');
  };

  const handleModalSuccess = (data: { customerId: string; billingIntentId?: string; subscriptionId?: string; testClockId?: string }) => {
    const planName = selectedPlan === 'advanced' ? 'Advanced' : selectedPlan === 'pro' ? 'Pro' : selectedPlan === 'core' ? 'Core' : selectedPlan === 'free' ? 'Free' : 'Starter';
    const subscriptionId = data.subscriptionId || data.billingIntentId;
    const testClockInfo = data.testClockId ? `, Test Clock: ${data.testClockId}` : '';
    setMessage(`Success! Customer created and subscribed to ${planName} plan. Customer ID: ${data.customerId}, Subscription ID: ${subscriptionId}${testClockInfo}`);
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

        <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Free Plan</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-2xl mr-1">$</span>0
                <span className="text-base font-medium text-gray-500 ml-1">/ month</span>
              </div>
              <div className="text-gray-500 text-sm mb-6">Limited access to get started</div>
              <button
                onClick={handleFreeClick}
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >
                {isProcessing ? 'Processing...' : 'Get started'}
              </button>
              <div className="text-gray-700 text-sm mt-6">For casual readers exploring digital books</div>
            </div>

            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Free includes:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Access to 5 books per month</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Basic reading features</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Mobile app access</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Community support</span></li>
              </ul>
            </div>
          </div>

          {/* Core card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Core Plan</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-2xl mr-1">$</span>12
                <span className="text-base font-medium text-gray-500 ml-1">/ month</span>
              </div>
              <div className="text-gray-500 text-sm mb-6">Essential access for regular readers</div>
              <button
                onClick={handleCoreClick}
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >
                {isProcessing ? 'Processing...' : 'Get started'}
              </button>
              <div className="text-gray-700 text-sm mt-6">For students and avid readers</div>
            </div>
            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Everything in Free, plus:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Unlimited book access</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Advanced search features</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Offline reading</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Note-taking tools</span></li>
              </ul>
            </div>
          </div>

          {/* Pro card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Pro Plan</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-2xl mr-1">$</span>20
                <span className="text-base font-medium text-gray-500 ml-1">/ month</span>
              </div>
              <div className="text-gray-500 text-sm mb-6">Premium features for professionals</div>
              <button
                onClick={handleProClick}
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >
                {isProcessing ? 'Processing...' : 'Get started'}
              </button>
              <div className="text-gray-700 text-sm mt-6">For professionals and researchers</div>
            </div>

            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Everything in Core, plus:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Priority customer support</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Advanced annotations</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Export citations</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Early access to new titles</span></li>
              </ul>
            </div>
          </div>

          {/* Enterprise card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Enterprise</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-xl mr-1"></span>Custom
              </div>
              <div className="text-gray-500 text-sm mb-6">Tailored for organizations</div>
              <button
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >             
                Talk to sales
              </button>
              <div className="text-gray-700 text-sm mt-6">For universities and institutions</div>
            </div>

            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Everything in Pro, plus:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Unlimited user licenses</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Custom integrations</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Dedicated account manager</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Usage analytics</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>White-label options</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>SLA guarantees</span></li>
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

