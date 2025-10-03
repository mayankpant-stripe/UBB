'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PricingTableSelector } from './pricing-table-selector';

interface SuccessData {
  customerId: string;
  subscriptionId: string;
  productName: string;
}

export default function PricingB2CPage() {
  const searchParams = useSearchParams();
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Handle URL parameters for checkout success
  useEffect(() => {
    const success = searchParams.get('success');
    const customerId = searchParams.get('customer');
    const subscriptionId = searchParams.get('subscription');
    const productName = searchParams.get('product');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && customerId) {
      setSuccessData({
        customerId,
        subscriptionId: subscriptionId || sessionId || 'Not provided',
        productName: productName || 'Professional Qualification Course'
      });
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#2A0148' }}>
      {/* Hero Image Section removed */}

      {/* Hero Section */}
      <section className="py-16" style={{ backgroundColor: '#2A0148' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Course Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Flexible pricing plans designed for professionals seeking world-class qualifications
            </p>
            <div className="flex justify-center mb-8">
              <PricingTableSelector />
            </div>
          </div>
          
          {/* Pricing Table Container */}
          <div className="rounded-lg p-8" style={{ backgroundColor: '#2A0148' }}>
            <div id="pricing-table-container" className="w-full min-w-[1200px] overflow-x-auto"></div>
          </div>

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
      {successData && (
        <section className="py-8 bg-gradient-to-r from-green-900 to-blue-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-800 border border-green-500 rounded-lg p-6 shadow-xl">
              <div className="text-center">
                <div className="text-white text-lg">
                  <div className="text-3xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-4">Subscription Successfully Created!</h3>
                  
                  <div className="grid md:grid-cols-3 gap-6 text-left bg-gray-700 rounded-lg p-6">
                    <div>
                      <div className="text-blue-400 font-semibold mb-2">👤 Customer</div>
                      <div className="text-sm text-gray-300 font-mono">{successData.customerId}</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-semibold mb-2">📋 Subscription</div>
                      <div className="text-sm text-gray-300 font-mono">{successData.subscriptionId}</div>
                    </div>
                    <div>
                      <div className="text-orange-400 font-semibold mb-2">📚 Product</div>
                      <div className="text-sm text-gray-300">{successData.productName}</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-gray-300">
                    <p className="text-sm">
                      Your subscription has been activated successfully. You will receive a confirmation email shortly with all the details and next steps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Study Locations */}
      <section id="locations" className="py-16" style={{ backgroundColor: '#2A0148' }}>
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
      <section className="py-16" style={{ backgroundColor: '#2A0148' }}>
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
      <section id="contact" className="py-16" style={{ backgroundColor: '#2A0148' }}>
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
      <section className="py-8 border-t border-gray-800" style={{ backgroundColor: '#2A0148' }}>
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