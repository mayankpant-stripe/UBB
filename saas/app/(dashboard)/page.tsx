import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Courses to transform
            </h1>
            <div className="text-4xl lg:text-5xl font-light text-gray-300 mb-8 space-y-2">
              <div>careers.</div>
              <div>businesses.</div>
              <div>workforces.</div>
              <div>skillsets.</div>
              <div>lives.</div>
            </div>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              For career-focused <strong>learners</strong> and the world's leading <strong>employers</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Designed for Peak Performance */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Designed for peak performance.
          </h2>
          
          {/* Qualifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-blue-400 mb-2">ACCA</div>
              <div className="text-sm text-gray-300">Accountancy</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-green-400 mb-2">CIPD</div>
              <div className="text-sm text-gray-300">HR</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400 mb-2">AAT</div>
              <div className="text-sm text-gray-300">Accounting</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-red-400 mb-2">SQE</div>
              <div className="text-sm text-gray-300">Law</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-indigo-400 mb-2">CIMA</div>
              <div className="text-sm text-gray-300">Management</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
              <div className="text-2xl font-bold text-teal-400 mb-2">CFA</div>
              <div className="text-sm text-gray-300">Finance</div>
            </div>
          </div>

          {/* Three Main Categories */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-8 mb-6 border border-gray-700">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold mb-4 text-white">Qualifications</h3>
                <p className="text-gray-300 mb-6">Professional qualifications across law, accountancy, finance, HR, and more.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  View Qualifications
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-8 mb-6 border border-gray-700">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold mb-4 text-white">Apprenticeships</h3>
                <p className="text-gray-300 mb-6">Earn while you learn with industry-leading apprenticeship programs.</p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Explore Apprenticeships
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-8 mb-6 border border-gray-700">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-4 text-white">Degrees</h3>
                <p className="text-gray-300 mb-6">Undergraduate and postgraduate degrees designed for career success.</p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  View Degrees
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">
              Trust the UK's largest professional education provider.
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">65,000</div>
                <div className="text-gray-300">learners each year</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">48</div>
                <div className="text-gray-300">years of excellence</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">300+</div>
                <div className="text-gray-300">career-focused programmes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Promise */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-8">
              We unlock the extraordinary.
            </h2>
            <div className="bg-gray-900 rounded-2xl p-12 text-white">
              <div className="max-w-4xl mx-auto">
                <div className="text-2xl font-semibold mb-6">Your performance is our business.</div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Law</h3>
                    <p className="text-gray-300 text-sm">Leading solicitor and barrister training</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Data</h3>
                    <p className="text-gray-300 text-sm">Future-ready data and analytics skills</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💼</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Business</h3>
                    <p className="text-gray-300 text-sm">Professional business qualifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Study Options */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-blue-400 text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Start your career.</h3>
              <p className="text-gray-300 mb-6">
                Study online or in one of our UK centres and secure your dream career within law, accountancy, management, data and more.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-green-400 text-2xl">✅</div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Become qualified.</h3>
              <p className="text-gray-300 mb-6">
                Professional qualifications and apprenticeships across accountancy and tax, finance, HR, nursing, digital marketing and more.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-purple-400 text-2xl">📈</div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Build skills.</h3>
              <p className="text-gray-300 mb-6">
                Enhance professional skillsets and plug skills gaps across data, cyber, IT, digital marketing and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Study Locations */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">
              Study in a place which suits you.
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Our study centres are based in some of the UK's most vibrant business districts.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="font-semibold text-white">Online</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="font-semibold text-white">London Central</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="font-semibold text-white">Manchester</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="font-semibold text-white">Birmingham</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="font-semibold text-white">Bristol</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="font-semibold text-white">Leeds</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Browse our courses
          </h2>
          <p className="text-xl text-teal-200 mb-8">
            From professional qualifications to apprenticeships, degrees and specialised CPD, we offer an extensive range of courses for you to study, whatever stage your career is at.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing-b2c">
              <Button className="bg-white text-teal-600 px-8 py-3 text-lg font-semibold hover:bg-gray-50">
                Find your ideal course
              </Button>
            </Link>
            <Button variant="outline" className="border-white text-white px-8 py-3 text-lg font-semibold hover:bg-white hover:text-teal-600">
              Speak to an expert
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
