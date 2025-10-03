import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export function BPPFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>03300 603 100</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@bpp.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>BPP House, Aldine Place,<br />142-144 Uxbridge Road,<br />London W12 8AA</span>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Subjects</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-gray-300">Accountancy & Tax</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Law</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Leadership & Management</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Data & Analytics</Link></li>
              <li><Link href="#" className="hover:text-gray-300">HR</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Finance</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Nursing & Healthcare</Link></li>
            </ul>
          </div>

          {/* Study Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Study Options</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-gray-300">Apprenticeships</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Professional Qualifications</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Degrees</Link></li>
              <li><Link href="#" className="hover:text-gray-300">CPD Courses</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Online Learning</Link></li>
                              <li><Link href="/pricing-b2c" className="hover:text-gray-300">B2B Solutions</Link></li>
            </ul>
          </div>

          {/* About BPP */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About BPP</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-gray-300">About Us</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Leadership Team</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Working at BPP</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Global Offices</Link></li>
              <li><Link href="/customer-journeys" className="hover:text-gray-300">Customer Journeys</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Careers</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-2xl font-bold">BPP</span>
              <span className="text-sm text-gray-400">
                © BPP Holdings Limited 2025 - Owned by private equity firm TDR
              </span>
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Cookie Policy</Link>
              <Link href="#" className="hover:text-white">Terms and Conditions</Link>
              <Link href="#" className="hover:text-white">Accessibility</Link>
              <Link href="#" className="hover:text-white">Modern Slavery Statement</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 