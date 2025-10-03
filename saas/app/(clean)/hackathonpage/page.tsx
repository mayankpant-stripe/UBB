'use client';

import Script from 'next/script';
import { useState, useEffect } from 'react';
import StarterPaymentModal from '@/components/ui/starter-payment-modal';

export default function HackathonPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'advanced'>('starter');
  // Usage modal state
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [usageCustomerId, setUsageCustomerId] = useState('');
  const [usageDate, setUsageDate] = useState(() => new Date().toISOString().slice(0,10));
  const [usageSystem, setUsageSystem] = useState('Open AI');
  const [usageValue, setUsageValue] = useState<number | ''>('');
  const [usageSubmitting, setUsageSubmitting] = useState(false);

  // Helper function to generate payment URLs for different plans
  const getPaymentUrl = (planType: 'starter' | 'advanced') => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    switch (planType) {
      case 'starter':
        return `${baseUrl}#starter-plan`;
      
      case 'advanced':
        return `${baseUrl}#advanced-plan`;
      default:
        return `${baseUrl}#pricing`;
    }
  };

  // Handle checkout return
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

    // Clean up URL parameters
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
        // Use the new format: customerId and subscriptionId
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

  

  const handleModalSuccess = (data: { customerId: string; billingIntentId?: string; subscriptionId?: string; testClockId?: string }) => {
    const planName = selectedPlan === 'advanced' ? 'Advanced' : 'Starter';
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
    <main className="min-h-screen" style={{ backgroundColor: '#2A0148' }}>
      {/* Hero Section - HTML-based (replacing image) */}
      <section className="relative flex items-center justify-center text-center" style={{ backgroundColor: '#2A0148' }}>
        <div className="w-full py-10 md:py-12">
          <div className="text-xs tracking-widest text-[#c5ff70] opacity-80 mb-4">[BUILD / CONNECT / INNOVATE]</div>
          <h1 className="text-[12vw] leading-none md:text-8xl font-extrabold text-[#c5ff70] mb-3">AI ENGINE</h1>
          <p className="text-sm md:text-base text-[#c5ff70] opacity-80">Hack across Europe & U.S.</p>
          <p className="text-xs md:text-sm text-[#c5ff70] opacity-60 mt-2">London, Paris, New York</p>
        </div>
      </section>

      {/* Message Display */}
      {message && (
        <section className="py-4" style={{ backgroundColor: '#2A0148' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className={`p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-900 border-green-600 text-green-200' 
                : 'bg-red-900 border-red-600 text-red-200'
            } border-2`}>
              <div className="flex items-center">
                {isProcessing && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Section (condensed) */}
      <section className="flex-1 py-6" style={{ backgroundColor: '#2A0148' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsUsageOpen(true)}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-md disabled:transform-none text-sm"
            >
              Input your usage
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            
            {/* Starter Plan Card */}
            <div id="starter-plan" className="relative bg-purple-900 border-2 border-gray-600 rounded-2xl p-8 text-white">
              {/* Plan Title */}
              <div className="text-center mt-2 mb-4">
                <h2 className="text-2xl font-bold text-white mb-1">Starter</h2>
                <div className="text-2xl font-bold text-white mb-1">
                Pay as you Go
                </div>
                <p className="text-gray-300 text-sm">Perfect for individuals and freelancers</p>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">Low commitment</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">Email support</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">Basic analytics</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">2GB database storage</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">Basic ML models</span>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={handleStarterClick}
                disabled={isProcessing}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md disabled:transform-none text-sm"
              >
                {isProcessing ? 'Processing...' : 'Start Starter Trial'}
              </button>
            </div>

            

            {/* Advanced Plan Card */}
            <div id="advanced-plan" className="relative bg-purple-900 border border-yellow-500 rounded-xl p-5 text-white">
              {/* Plan Title */}
              <div className="text-center mt-2 mb-4">
                <h2 className="text-2xl font-bold text-white mb-1">Advanced</h2>
                <div className="text-3xl font-bold text-white mb-1">
                $100<span className="text-lg font-normal text-gray-400">/month</span>
                </div>
                <p className="text-gray-300 text-sm">For large teams and enterprises</p>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">$100 in monthly credits</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">24/7 dedicated support</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">Enterprise analytics</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">Unlimited database storage</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">All ML models + Early access</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">White-label solutions</span>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={handleAdvancedClick}
                disabled={isProcessing}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md disabled:transform-none text-sm"
              >
                {isProcessing ? 'Processing...' : 'Start Advanced Trial'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer Section - HTML-based (replacing image) */}
      <footer className="relative" style={{ backgroundColor: '#2A0148' }}>
        <div className="w-full py-6 md:py-8 text-center">
          <div className="text-[#c5ff70] text-sm md:text-base">Build. Connect. Innovate.</div>
          <div className="text-[#c5ff70] opacity-70 text-xs md:text-sm mt-1">© AI Engine — Demo Experience</div>
        </div>
      </footer>

      {/* Payment Modal */}
      <StarterPaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        planType={selectedPlan}
      />

      {/* Usage Modal */}
      {isUsageOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Record usage</h2>
              <button
                onClick={() => !usageSubmitting && setIsUsageOpen(false)}
                className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                disabled={usageSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={submitUsage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Id</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={usageCustomerId}
                  onChange={(e) => setUsageCustomerId(e.target.value)}
                  placeholder="cus_..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={usageDate}
                  onChange={(e) => setUsageDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={usageSystem}
                  onChange={(e) => setUsageSystem(e.target.value)}
                  required
                >
                  <option>Open AI</option>
                  <option>Claude</option>
                  <option>Grok</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage events</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={usageValue}
                  onChange={(e) => setUsageValue(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                  step={1}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => !usageSubmitting && setIsUsageOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                  disabled={usageSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md disabled:bg-gray-400"
                  disabled={usageSubmitting}
                >
                  {usageSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elevenlabs Voice Agent with Client Tools for Payment Redirects */}
      <Script 
        src="https://unpkg.com/@elevenlabs/convai-widget-embed" 
        strategy="afterInteractive"
        onLoad={() => {
          // Wait for ElevenLabs widget to fully load and register client tools
          const checkAndRegisterTools = () => {
            if (typeof window !== 'undefined') {
              // Check if ElevenLabs is available
              const elevenLabsWidget = document.querySelector('elevenlabs-convai');
              
              if (elevenLabsWidget) {
                try {
                  // Enhanced payment URL detection with multiple methods
                  const setupPaymentDetection = () => {
                    let detectionCount = 0;
                    
                    // Method 1: MutationObserver for DOM changes
                    const observer = new MutationObserver((mutations) => {
                      mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                          mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
                              const text = node.textContent || '';
                              const stripeUrlMatch = text.match(/https:\/\/buy\.stripe\.com\/[a-zA-Z0-9_]+/);
                              if (stripeUrlMatch) {
                                detectionCount++;
                                console.log(`🎯 Detection ${detectionCount}: Payment URL found:`, stripeUrlMatch[0]);
                                (window as any).createPaymentButton(stripeUrlMatch[0]);
                              }
                            }
                          });
                        }
                      });
                    });
                    
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true,
                      characterData: true
                    });
                    
                    // Method 2: Periodic scanning of page content
                    const scanPageContent = () => {
                      const bodyText = document.body.textContent || '';
                      const stripeUrls = bodyText.match(/https:\/\/buy\.stripe\.com\/[a-zA-Z0-9_]+/g);
                      if (stripeUrls && stripeUrls.length > 0) {
                        const latestUrl = stripeUrls[stripeUrls.length - 1];
                        console.log('🔍 Periodic scan found payment URL:', latestUrl);
                        (window as any).createPaymentButton(latestUrl);
                      }
                    };
                    
                    // Scan every 2 seconds
                    setInterval(scanPageContent, 2000);
                    
                    // Method 3: Manual trigger for known URL
                    (window as any).triggerPaymentDetection = () => {
                      const knownUrl = 'https://buy.stripe.com/test_5kQ7sK20O2ld3Ou5DI28800';
                      console.log('🎯 Manual trigger: Creating payment button for known URL');
                      (window as any).createPaymentButton(knownUrl);
                    };
                  };
                  
                  // Start enhanced detection
                  setupPaymentDetection();





                  // Register global functions that ElevenLabs can call
                  (window as any).redirectToPayment = (parameters: any) => {
                    console.log('🎯 Voice Agent: redirectToPayment called with:', parameters);
                    const paymentUrl = parameters?.paymentUrl || parameters;
                    
                    // Handle different parameter formats
                    let urlToRedirect = '';
                    if (typeof paymentUrl === 'string') {
                      urlToRedirect = paymentUrl;
                    } else if (paymentUrl && paymentUrl.paymentUrl) {
                      urlToRedirect = paymentUrl.paymentUrl;
                    }
                    
                    if (urlToRedirect) {
                      try {
                        // Handle URLs with @ prefix
                        const cleanUrl = urlToRedirect.startsWith('@') ? urlToRedirect.substring(1) : urlToRedirect;
                        const url = new URL(cleanUrl);
                        
                        if (url.protocol === 'https:' || url.protocol === 'http:') {
                          console.log('🎯 Voice Agent: Redirecting to payment URL:', cleanUrl);
                          window.open(cleanUrl, '_blank'); // Open in new tab for better UX
                          return 'Opening payment page in new tab...';
                        } else {
                          console.error('❌ Invalid URL protocol:', url.protocol);
                          return 'Invalid payment URL protocol';
                        }
                      } catch (error) {
                        console.error('❌ Invalid payment URL:', urlToRedirect, error);
                        return 'Invalid payment URL format';
                      }
                    } else {
                      console.error('❌ Missing or invalid paymentUrl parameter');
                      return 'Payment URL is required';
                    }
                  };

                  // Simplified direct payment redirects (no parameters needed)
                  (window as any).redirectToStarterPayment = () => {
                    console.log('🎯 Voice Agent: redirectToStarterPayment called');
                    const url = 'https://buy.stripe.com/test_5kQ7sK20O2ld3Ou5DI28800';
                    window.open(url, '_blank');
                    return 'Opening Starter plan payment in new tab...';
                  };

                  // Simple payment redirect without visual elements
                  (window as any).createPaymentButton = (url: string) => {
                    console.log('🎯 Payment URL detected:', url);
                    // Just log the detection, no visual button created
                    // User prefers to use existing starter button on page
                  };



                  

                  (window as any).redirectToAdvancedPayment = () => {
                    console.log('🎯 Voice Agent: redirectToAdvancedPayment called');
                    const advancedSection = document.getElementById('advanced-plan');
                    if (advancedSection) {
                      advancedSection.scrollIntoView({ behavior: 'smooth' });
                      setTimeout(() => {
                        setSelectedPlan('advanced');
                        setIsModalOpen(true);
                        setMessage('');
                        setMessageType('');
                      }, 500);
                    }
                    return 'Opening Advanced plan payment...';
                  };

                  console.log('✅ ElevenLabs client tools registered successfully');
                  
                  // Test function to verify tools are accessible
                  (window as any).testElevenLabsTools = () => {
                    console.log('🧪 Testing ElevenLabs tools:');
                    console.log('- redirectToPayment:', typeof (window as any).redirectToPayment);
                    console.log('- redirectToStarterPayment:', typeof (window as any).redirectToStarterPayment);
                    
                    console.log('- redirectToAdvancedPayment:', typeof (window as any).redirectToAdvancedPayment);
                    console.log('- triggerPaymentDetection:', typeof (window as any).triggerPaymentDetection);
                  };

                  console.log('✅ ElevenLabs client tools registered successfully');
                  console.log('💡 Payment detection active (console logs only, no visual elements)');
                  
                } catch (error) {
                  console.error('❌ Error registering ElevenLabs client tools:', error);
                }
              } else {
                console.log('⏳ ElevenLabs widget not found, will retry...');
                // Widget not loaded yet, try again
                setTimeout(checkAndRegisterTools, 500);
              }
            }
          };

          // Start checking for widget immediately and log status
          console.log('🔄 Starting ElevenLabs widget detection...');
          setTimeout(checkAndRegisterTools, 1000);
        }}
      />
      <div dangerouslySetInnerHTML={{
        __html: '<elevenlabs-convai agent-id="agent_5301k1jrzpbged59pnfsbzpyrtrb"></elevenlabs-convai>'
      }} />

      {/* Simple Elevenlabs Voice Agent - Commented Out */}
      {/*
      <div dangerouslySetInnerHTML={{
        __html: '<elevenlabs-convai agent-id="agent_5301k1jrzpbged59pnfsbzpyrtrb"></elevenlabs-convai><script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>'
      }} />
      */}
    </main>
  );
} 