'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import heroImage from '../../docs/ElevenLabs.png';
import StarterPaymentModal from '@/components/ui/starter-payment-modal';

export default function NewHackPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'advanced' | 'pro' | 'core' | 'free'>('starter');
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [usageCustomerId, setUsageCustomerId] = useState('');
  const [usageDate, setUsageDate] = useState(() => new Date().toISOString().slice(0,10));
  const [usageSystem, setUsageSystem] = useState('Open AI');
  const [usageValue, setUsageValue] = useState<number | ''>('');
  const [usageSubmitting, setUsageSubmitting] = useState(false);

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

  // previous "three buttons" handlers removed

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

  const submitUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageCustomerId || usageValue === '' || !Number.isFinite(Number(usageValue))) {
      setMessage('Please input Customer Id and a numeric Usage events value.');
      setMessageType('error');
      return;
    }
    try {
      setUsageSubmitting(true);
      const resp = await fetch('/api/meter-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: usageCustomerId.trim(),
          date: usageDate,
          system: usageSystem,
          value: Number(usageValue)
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to register meter event');
      }
      setMessage(`Meter event has been registered under "${data.event_name}" for the customer "${data.customerId}"`);
      setMessageType('success');
      setIsUsageOpen(false);
      setUsageCustomerId('');
      setUsageSystem('');
      setUsageValue('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to register meter event');
      setMessageType('error');
    } finally {
      setUsageSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'white' }}>
      <section className="relative w-full h-56 md:h-72 lg:h-80">
        <Image src={heroImage} alt="Header" fill priority className="object-contain" />
      </section>
      {/* Plan cards */}
      <section className="py-10 px-4">
        <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Pay as you Go</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-2xl mr-1">$</span>100
                <span className="text-base font-medium text-gray-500 ml-1"> Prepaid Credits</span></div>
              <div className="text-gray-500 text-sm mb-6">(Products & Prices)</div>
              <button
                onClick={handleFreeClick}
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >
                {isProcessing ? 'Processing...' : 'Get started'}
              </button>
              <div className="text-gray-700 text-sm mt-6">For individuals getting started with automation</div>
            </div>

            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Free includes:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>No-code visual workflow builder</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>2000+ apps</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Routers & filters</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Customer support</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>15-minute minimum interval between runs</span></li>
              </ul>
            </div>
          </div>
          {/* Core card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Core</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-2xl mr-1">$</span>100
                <span className="text-base font-medium text-gray-500 ml-1"> Prepaid Credits</span></div>
              <div className="text-gray-500 text-sm mb-6">(Pricing Plan)</div>
              <button
                onClick={handleCoreClick}
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >
                {isProcessing ? 'Processing...' : 'Get started'}
              </button>
              <div className="text-gray-700 text-sm mt-6">For individuals getting started with automation</div>
            </div>
            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Free includes:</div>
              <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>No-code visual workflow builder</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>2000+ apps</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Routers & filters</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Customer support</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>15-minute minimum interval between runs</span></li>
             </ul>
            </div>
          </div>

          {/* Pro card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Pro</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-2xl mr-1">$</span>18.82
                <span className="text-base font-medium text-gray-500 ml-1">/ month</span></div>
              <div className="text-gray-500 text-sm mb-6">10,000 credits/month</div>
              <button
                onClick={handleProClick}
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
              >
                {isProcessing ? 'Processing...' : 'Get started'}
              </button>
              <div className="text-gray-700 text-sm mt-6">For individuals with growing business needs</div>
            </div>

            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Everything in Core, plus:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Priority scenario execution</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Custom variables</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Full-text execution log search</span></li>
              </ul>
            </div>
          </div>

          {/* Enterprise card */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-[#2A0148] mb-1">Enterprise</div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900 mb-1">
                <span className="align-top text-xl mr-1"></span> Custom
              </div>
              <div className="text-gray-500 text-sm mb-6">Growing business together</div>
              <button
                disabled={isProcessing}
                className="w-full h-12 bg-[#2A0148] hover:bg-[#3a0166] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors duration-200 shadow-md"
                >             
                Talk to sales
              </button>
              <div className="text-gray-700 text-sm mt-6">For organizations running critical business processes with automation</div>
            </div>

            <div className="mt-6">
              <div className="text-gray-900 font-semibold mb-3">Everything in Pro, plus:</div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Custom functions support</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Enterprise app integrations</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>24/7 Enterprise support</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Access to Value Engineering team</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Overage protection</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✔</span><span>Advanced security features</span></li>
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

