import { CreditTableSelector } from './credit-table-selector';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function CreditPage() {
  return (
    <main className="min-h-screen bg-[#f6f2e7]">
      {/* Header Section with constrained width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2 ft-serif">
              Explore our credit plans
            </h1>
          </div>
          <CreditTableSelector />
        </div>
      </div>
      
      {/* Full width pricing table container */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div id="credit-table-container"></div>
      </div>

      
      {/* Terms Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mt-8">
          <button className="text-teal-600 text-sm font-medium border-b border-teal-600 pb-1 hover:border-teal-700">
            Terms & Conditions apply
          </button>
        </div>
      </div>
    </main>
  );
} 