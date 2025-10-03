'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PricingMiscPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showStudentEmailForm, setShowStudentEmailForm] = useState(false);
  const [showInstallmentEmailForm, setShowInstallmentEmailForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [installmentEmail, setInstallmentEmail] = useState('');
  const [installmentName, setInstallmentName] = useState('');
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const searchParams = useSearchParams();

  // Handle URL parameters from Stripe checkout return
  useEffect(() => {
    const setup = searchParams.get('setup');
    const subscription = searchParams.get('subscription');
    const installment = searchParams.get('installment');
    const customerId = searchParams.get('customer');
    const type = searchParams.get('type');
    
    if (setup === 'success' && customerId) {
      // Payment method setup successful, now create subscription schedule
      setMessage('✅ Payment method setup completed! Creating your 3-year Finance course subscription (starting at 00:00:00 today)...');
      createSubscriptionSchedule(customerId);
    } else if (setup === 'success') {
      // Fallback for success without customer ID
      setMessage('✅ Payment method setup completed successfully! Please contact support to complete your Finance course enrollment.');
    } else if (setup === 'cancelled') {
      setMessage('❌ Payment method setup was cancelled. Please try again to complete your Finance course enrollment.');
    } else if (subscription === 'success' && customerId && type === 'student') {
      // Student subscription successful
      setMessage(`🎉 Success! Pay per Student subscription activated!\n\n✅ Subscription created successfully\n👤 Customer: ${customerId}\n📋 Type: Pay per Student\n\nYour student subscription is now active with automatic billing.`);
    } else if (subscription === 'cancelled') {
      setMessage('❌ Student subscription was cancelled. Please try again to complete your Pay per Student enrollment.');
    } else if (installment === 'success' && customerId) {
      // Installment invoice created successfully - new format
      const invoiceId = searchParams.get('invoice');
      const invoiceUrl = searchParams.get('invoiceUrl');
      const paymentMessage = invoiceUrl 
        ? `🎉 Success! Finance Course invoice created!

✅ Invoice Created Successfully
📄 Invoice ID: ${invoiceId || 'Generated'}
💰 Total Amount: £75.00 (3 installments of £25.00 each)
👤 Customer: ${customerId}

🔗 Payment Link:
• 💳 ${invoiceUrl}

💡 Payment Schedule:
• Deposit: £25.00 - Due immediately
• Payment 1: £25.00 - Due in 30 days  
• Payment 2: £25.00 - Due in 60 days`
        : `🎉 Success! Finance Course invoice created!

✅ Invoice Created Successfully
📄 Invoice ID: ${invoiceId || 'Generated'}
💰 Total Amount: £75.00 (3 installments of £25.00 each)
👤 Customer: ${customerId}

💡 Payment Schedule:
• Deposit: £25.00 - Due immediately
• Payment 1: £25.00 - Due in 30 days  
• Payment 2: £25.00 - Due in 60 days

Payment link has been sent to your email address.`;
      
      setMessage(paymentMessage);
    } else if (installment === 'cancel') {
      // Installment payment cancelled
      setMessage('❌ Installment payment was cancelled. You can try again anytime.');
    }
  }, [searchParams]);

  const handleCreateInstallment = async () => {
    // Show the email form instead of directly creating installment
    setShowInstallmentEmailForm(true);
    setMessage('');
  };

  const handleFinanceCourse = async () => {
    // Show the email form instead of directly creating checkout
    setShowEmailForm(true);
    setMessage('');
  };

  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail || !userName) {
      setMessage('❌ Please enter both email and name');
      return;
    }

    setSetupLoading(true);
    setMessage('');
    setShowEmailForm(false);
    
    try {
      const response = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          name: userName
        }),
      });

      const data = await response.json();

      if (data.url) {
        const customerInfo = data.customerId ? ` (Customer: ${data.customerEmail})` : '';
        setMessage(`✅ Redirecting to Stripe checkout for payment method setup...${customerInfo}`);
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to create checkout session'}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to create setup session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowEmailForm(false);
    setUserEmail('');
    setUserName('');
    setMessage('');
  };

  const handlePayPerStudent = async () => {
    // Show the student email form
    setShowStudentEmailForm(true);
    setMessage('');
  };

  const handleStudentEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentEmail || !studentName) {
      setMessage('❌ Please enter both email and name');
      return;
    }

    setSetupLoading(true);
    setMessage('');
    setShowStudentEmailForm(false);
    
    try {
      const response = await fetch('/api/create-student-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: studentEmail,
          name: studentName
        }),
      });

      const data = await response.json();

      if (data.url) {
        const customerInfo = data.customerId ? ` (Customer: ${data.customerEmail})` : '';
        setMessage(`✅ Redirecting to Stripe checkout for Pay per Student subscription...${customerInfo}`);
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to create checkout session'}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to create student subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleCancelStudentForm = () => {
    setShowStudentEmailForm(false);
    setStudentEmail('');
    setStudentName('');
    setMessage('');
  };

  const handleInstallmentEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!installmentEmail || !installmentName) {
      setMessage('❌ Please enter both email and name');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setShowInstallmentEmailForm(false);
    
    try {
      const response = await fetch('/api/create-installment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: installmentEmail,
          name: installmentName
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show success message and redirect with parameters including the payment link
        const customerInfo = data.customerId ? ` (Customer: ${data.customerEmail})` : '';
        setMessage(`✅ Installment invoice created successfully!${customerInfo}`);
        
        // Redirect to success page with invoice details including the payment link
        const successUrl = `/pricing-misc?installment=success&customer=${data.customerId}&invoice=${data.invoiceId}&invoiceUrl=${encodeURIComponent(data.invoiceUrl)}`;
        window.location.href = successUrl;
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to create installment plan'}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to create installment plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInstallmentForm = () => {
    setShowInstallmentEmailForm(false);
    setInstallmentEmail('');
    setInstallmentName('');
    setMessage('');
  };

  const createSubscriptionSchedule = async (customerId: string) => {
    setSubscriptionLoading(true);
    
    try {
      const response = await fetch('/api/create-subscription-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`🎉 Success! 3-year Finance course subscription created!

✅ Subscription schedule created successfully
📅 Phases: ${data.phases}
👤 Customer: ${customerId}
💰 Total commitment: ${data.totalCommitment}

📧 You will receive:
• Subscription confirmation email
• Billing schedule details
• Access to course materials

Your Finance course enrollment is complete!`);
      } else {
        setMessage(`❌ Failed to create subscription schedule: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating subscription schedule:', error);
      setMessage(`❌ Failed to create subscription schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">

      {/* Hero Image Section removed */}

      {/* Hero Content Section */}
      <section className="bg-black py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Transform Your Career with 
              <span className="block text-blue-400">Professional Qualifications</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto font-medium">
              Join thousands of professionals who have advanced their careers with our industry-leading qualifications in Law, Accountancy, Finance, HR, and Data Analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg">
                Find Your Course
              </Button>
              <Button variant="outline" className="border-gray-600 bg-gray-800 text-white px-8 py-4 text-lg font-semibold hover:bg-gray-700">
                Download Prospectus
              </Button>
            </div>
            
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-400 mb-2">65,000+</div>
                <div className="text-gray-200 text-sm font-medium">Students Annually</div>
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-400 mb-2">48</div>
                <div className="text-gray-200 text-sm font-medium">Years of Excellence</div>
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
                <div className="text-gray-200 text-sm font-medium">Pass Rate</div>
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-400 mb-2">300+</div>
                <div className="text-gray-200 text-sm font-medium">Career-Focused Programmes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UK's Leading Professional Education Provider Section */}
      <section className="py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full">
              UK's Leading Professional Education Provider
            </span>
          </div>
        </div>
      </section>

      {/* BPP Professional Training Pricing */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Professional Training Solutions
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Flexible payment options designed for individuals and organizations
            </p>
          </div>

          {/* Payment Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center max-w-4xl mx-auto">
            <Button 
              onClick={handleCreateInstallment}
              disabled={isLoading}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-6 text-lg font-semibold shadow-xl rounded-lg min-w-[280px] h-auto flex flex-col items-center gap-3"
            >
              <div className="text-2xl">💳</div>
              <div className="text-center">
                <div className="font-bold">
                  {isLoading ? 'Creating...' : 'Finance Course - Installment'}
                </div>
                <div className="text-sm text-gray-300 mt-1">Split payments over time</div>
              </div>
                </Button>

            <Button 
              onClick={handleFinanceCourse}
              disabled={setupLoading || subscriptionLoading}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-6 text-lg font-semibold shadow-xl rounded-lg min-w-[280px] h-auto flex flex-col items-center gap-3"
            >
              <div className="text-2xl">📅</div>
              <div className="text-center">
                <div className="font-bold">
                  {setupLoading ? 'Setting up...' : subscriptionLoading ? 'Creating subscription...' : 'Finance - 3 year course'}
                </div>
                <div className="text-sm text-gray-300 mt-1">Structured learning phases</div>
              </div>
                </Button>

            <Button 
              onClick={handlePayPerStudent}
              disabled={setupLoading || subscriptionLoading}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-6 text-lg font-semibold shadow-xl rounded-lg min-w-[280px] h-auto flex flex-col items-center gap-3"
            >
              <div className="text-2xl">🎓</div>
              <div className="text-center">
                <div className="font-bold">
                  {setupLoading ? 'Setting up...' : subscriptionLoading ? 'Creating subscription...' : 'Pay per Student'}
                </div>
                <div className="text-sm text-gray-300 mt-1">Educational partnerships</div>
              </div>
                </Button>
          </div>

          {/* Email Collection Form Modal */}
          {showEmailForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-600">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Finance Course Enrollment
                </h3>
                <p className="text-gray-300 mb-6 text-center">
                  Please provide your details to proceed with the 3-year Finance course payment setup.
                </p>
                
                <form onSubmit={handleEmailFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Full Name *
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
          </div>
          
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email Address *
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleCancelForm}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={setupLoading || subscriptionLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white"
                    >
                      {setupLoading ? 'Setting up...' : subscriptionLoading ? 'Creating subscription...' : 'Continue to Payment Setup'}
                    </Button>
          </div>
                </form>
        </div>
            </div>
          )}

          {/* Student Email Collection Form Modal */}
          {showStudentEmailForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-600">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Pay per Student Enrollment
                </h3>
                <p className="text-gray-300 mb-6 text-center">
                  Please provide your details to proceed with the Pay per Student subscription setup.
                </p>
                
                <form onSubmit={handleStudentEmailFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName" className="text-gray-300">
                      Full Name *
                    </Label>
                    <Input
                      type="text"
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
          </div>
          
                  <div className="space-y-2">
                    <Label htmlFor="studentEmail" className="text-gray-300">
                      Email Address *
                    </Label>
                    <Input
                      type="email"
                      id="studentEmail"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleCancelStudentForm}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={setupLoading || subscriptionLoading}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white"
                    >
                      {setupLoading ? 'Setting up...' : subscriptionLoading ? 'Creating subscription...' : 'Continue to Subscription'}
                    </Button>
                  </div>
                </form>
              </div>
                </div>
            )}

          {/* Installment Email Collection Form Modal */}
          {showInstallmentEmailForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-600">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Finance Course - Installment Payment
                </h3>
                <p className="text-gray-300 mb-6 text-center">
                  Please provide your details to create your installment invoice for the Finance Course (£75.00 total, split into 3 payments of £25.00 each).
                </p>
                
                <form onSubmit={handleInstallmentEmailFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="installmentName" className="text-gray-300">
                      Full Name *
                    </Label>
                    <Input
                      type="text"
                      id="installmentName"
                      value={installmentName}
                      onChange={(e) => setInstallmentName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
          </div>

                  <div className="space-y-2">
                    <Label htmlFor="installmentEmail" className="text-gray-300">
                      Email Address *
                    </Label>
                    <Input
                      type="email"
                      id="installmentEmail"
                      value={installmentEmail}
                      onChange={(e) => setInstallmentEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
          </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleCancelInstallmentForm}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white"
                    >
                      {isLoading ? 'Creating Installment...' : 'Create Installment Invoice'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Value Proposition */}
          <div className="mt-12 text-center">
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">No Hidden Fees</div>
                <div className="text-sm text-gray-300">Transparent pricing with everything included</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">Flexible Payment</div>
                <div className="text-sm text-gray-300">Monthly or annual payment options available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">Money-Back Guarantee</div>
                <div className="text-sm text-gray-300">30-day satisfaction guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">Employer Funding</div>
                <div className="text-sm text-gray-300">Apprenticeship levy and CPD funding accepted</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Notification - positioned just above UK Study Centres */}
      {message && (
        <section className="py-8 bg-gradient-to-r from-green-900 to-blue-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-800 border border-green-500 rounded-lg p-6 shadow-xl">
              <div className="text-center">
                {message.includes('Stripe Dashboard:') ? (
                  <div>
                    {message.split('\n').map((part, index) => {
                      if (part.includes('Stripe Dashboard:')) {
                        return (
                          <div key={index} className="mt-2">
                            <a 
                              href={part.replace('Stripe Dashboard: ', '')} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 underline inline-block"
                            >
                              📊 View in Stripe Dashboard
                            </a>
                          </div>
                        );
                      } else {
                        return (
                          <div key={index} className="whitespace-pre-line">
                            {index === 0 ? part : ` - ${part}`}
                          </div>
                        );
                      }
                    })}
                  </div>
                ) : message.includes('🔗 Payment Link:') ? (
                  <div className="text-left text-white text-lg">
                    {message.split('\n').map((part, index) => {
                      if (part.startsWith('• 💳 https://')) {
                        const url = part.replace('• 💳 ', '');
                        return (
                          <div key={index} className="mb-2">
                            • 💳{' '}
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline font-medium"
                            >
                              Click here to view invoice and make payment
                            </a>
                          </div>
                        );
                      } else {
                        return (
                          <div key={index} className="mb-1">
                            {part}
                          </div>
                        );
                      }
                    })}
                  </div>
                ) : (
                  <div className="whitespace-pre-line text-left text-white text-lg">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Study Locations */}
      <section id="locations" className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              UK Study Centres
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Study at one of our modern centres located in major business districts across the UK
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'London Holborn', 'London Waterloo', 'Manchester', 
              'Birmingham', 'Bristol', 'Leeds', 'Glasgow', 'Edinburgh'
            ].map((location, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-semibold text-white mb-2">{location}</div>
                  <div className="text-sm text-gray-400">View Details</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Student Success Stories
            </h2>
            <p className="text-xl text-gray-300">
              Hear from our graduates who have transformed their careers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Senior Accountant → Finance Director',
                qualification: 'ACCA',
                quote: 'The ACCA programme opened doors I never thought possible. Within two years, I was promoted to Finance Director.',
                company: 'Global Tech Corp'
              },
              {
                name: 'Michael Chen',
                role: 'HR Assistant → HR Director',
                qualification: 'CIPD Level 7',
                quote: 'The practical approach and expert tutors gave me the confidence to lead strategic HR initiatives.',
                company: 'Leading Consultancy'
              },
              {
                name: 'Emma Williams',
                role: 'Graduate → Qualified Solicitor',
                qualification: 'SQE',
                quote: 'The SQE preparation was exceptional. I passed first time and secured my training contract.',
                company: 'City Law Firm'
              }
            ].map((story, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-lg font-semibold text-white">{story.name}</div>
                    <div className="text-blue-400 font-medium">{story.role}</div>
                    <div className="text-sm text-gray-400">{story.qualification} • {story.company}</div>
                  </div>
                  <blockquote className="text-gray-300 italic">
                    "{story.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals who have advanced their careers with our industry-leading qualifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-100">
              Speak to an Advisor
            </Button>
            <Button variant="outline" className="border-white text-white px-8 py-4 text-lg font-semibold hover:bg-gray-800">
              Request Course Information
            </Button>
          </div>
          
          <div className="mt-8 text-gray-300">
            <div className="text-sm">📞 Call us: 0330 060 3200</div>
            <div className="text-sm mt-1">✉️ Email: info@bpp-education.co.uk</div>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <section className="py-8 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white">About Us</Link>
              <Link href="#" className="hover:text-white">Careers</Link>
              <Link href="#" className="hover:text-white">Contact</Link>
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 