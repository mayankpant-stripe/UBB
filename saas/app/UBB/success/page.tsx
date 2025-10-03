'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SuccessData {
  customerId: string;
  customer?: { id: string; name?: string | null; email?: string | null };
  session?: { id: string; intentId?: string | null; mode?: string };
  billing?: {
    cadenceId?: string;
  } & (
    | { pricingPlanId: string; billingIntentId: string; status: string }
    | { rateCardId: string; rateCardSubscriptionId: string; status: string }
    | { subscriptionId: string; status: string; priceId: string; invoiceId: string; creditGrantId: string }
  );
  creditGrant?: { grantedUnits: string; availableUnits: string };
}

export default function SuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const urlCustomerId = params.get('customerid');
  const [manualCustomerId, setManualCustomerId] = useState(urlCustomerId || '');
  const [loadingManual, setLoadingManual] = useState(false);
  const [data, setData] = useState<SuccessData | null>(null);
  const [loading, setLoading] = useState(true); // Set to true initially
  const [error, setError] = useState<string | null>(null);
  const [openAiModal, setOpenAiModal] = useState(false);
  const [openAiDate, setOpenAiDate] = useState(() => new Date().toISOString().slice(0,10));
  const [openAiEvents, setOpenAiEvents] = useState<number | ''>('');
  const [openAiSubmitting, setOpenAiSubmitting] = useState(false);
  const [grokModal, setGrokModal] = useState(false);
  const [grokDate, setGrokDate] = useState(() => new Date().toISOString().slice(0,10));
  const [grokEvents, setGrokEvents] = useState<number | ''>('');
  const [grokSubmitting, setGrokSubmitting] = useState(false);
  const [claudeModal, setClaudeModal] = useState(false);
  const [claudeDate, setClaudeDate] = useState(() => new Date().toISOString().slice(0,10));
  const [claudeEvents, setClaudeEvents] = useState<number | ''>('');
  const [claudeSubmitting, setClaudeSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        // Path A: we have a checkout session → use existing flow
        if (sessionId) {
          const res = await fetch('/api/process-checkout-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.details || json.error || 'Failed to load success data');
          }
          let creditGrant: { grantedUnits: string; availableUnits: string } | undefined;
          try {
            const creditRes = await fetch('/api/credit-balance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customerId: json.customer?.id || json.customerId })
            });
            const creditJson = await creditRes.json();
            if (creditRes.ok && creditJson.success) {
              creditGrant = {
                grantedUnits: creditJson.grantedUnits,
                availableUnits: creditJson.availableUnits
              };
            }
          } catch {}
          setData({ ...json, ...(creditGrant ? { creditGrant } : {}) });
          // After processing, replace the URL with customerid to make refresh idempotent
          try {
            const cid = json.customer?.id || json.customerId;
            if (cid && typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.delete('session_id');
              url.searchParams.set('customerid', cid);
              window.history.replaceState({}, '', url.toString());
            }
          } catch {}
          return;
        }

        // Path B: manage-sub provided a customerid → fetch customer + credit balance
        if (urlCustomerId) {
          // fetch basic customer details
          let customer: any | undefined;
          try {
            const custRes = await fetch('/api/customer-details', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customerId: urlCustomerId })
            });
            const custJson = await custRes.json();
            if (custRes.ok && custJson.success) customer = custJson.customer;
          } catch {}

          let creditGrant: { grantedUnits: string; availableUnits: string } | undefined;
          try {
            const creditRes = await fetch('/api/credit-balance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customerId: urlCustomerId })
            });
            const creditJson = await creditRes.json();
            if (creditRes.ok && creditJson.success) {
              creditGrant = {
                grantedUnits: creditJson.grantedUnits,
                availableUnits: creditJson.availableUnits
              };
            }
          } catch {}

          setData({ success: true, customerId: urlCustomerId, customer, ...(creditGrant ? { creditGrant } : {}) } as any);
          return;
        }

        // Neither session nor customerid
        setError('Provide a session_id or customerid.');
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [sessionId, urlCustomerId]);

  const customerName = data?.customer?.name || 'Customer';
  const customerEmail = (data as any)?.customer?.email || '';
  const customerId = urlCustomerId || data?.customer?.id || data?.customerId || '';
  const paymentMethod = (data as any)?.customer?.paymentMethodId || (data as any)?.paymentMethodId || (data as any)?.session?.intentId || '';
  const grantedUnits = data?.creditGrant?.grantedUnits || '—';
  const availableUnits = data?.creditGrant?.availableUnits || '—';

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#1e1259' }}>

      <div className="relative max-w-6xl mx-auto px-4 py-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm tracking-wide uppercase font-semibold shadow">Customer ID</span>
            <input
              value={manualCustomerId}
              onChange={(e) => setManualCustomerId(e.target.value)}
              placeholder="cus_..."
              className="h-10 w-[20ch] md:w-[24ch] bg-white text-gray-900 text-sm px-3 rounded-full shadow outline-none placeholder-gray-400"
            />
            <button
              onClick={async () => {
                if (!manualCustomerId) return;
                try {
                  setLoadingManual(true);
                  // Fetch customer basics
                  const res = await fetch('/api/customer-details', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerId: manualCustomerId })
                  });
                  const json = await res.json();
                  if (!res.ok || !json.success) throw new Error(json.error || 'Failed');

                  // Fetch credit balance totals
                  let creditGrant: { grantedUnits: string; availableUnits: string } | undefined;
                  try {
                    const creditRes = await fetch('/api/credit-balance', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ customerId: manualCustomerId })
                    });
                    const creditJson = await creditRes.json();
                    if (creditRes.ok && creditJson.success) {
                      creditGrant = {
                        grantedUnits: creditJson.grantedUnits,
                        availableUnits: creditJson.availableUnits
                      };
                    }
                  } catch {}

                  setData((prev) => ({
                    ...(prev || { customerId: manualCustomerId }),
                    customerId: manualCustomerId,
                    customer: json.customer,
                    ...(creditGrant ? { creditGrant } : {})
                  }));
                } catch (e: any) {
                  setError(e.message || 'Failed to load customer');
                } finally {
                  setLoadingManual(false);
                }
              }}
              className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold shadow transition-colors"
            >
              {loadingManual ? 'Loading...' : 'Load'}
            </button>
          </div>
          <Link href="/newhack" className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-xl shadow transition-colors">
            Manage Subscription
          </Link>
        </div>

        {/* Content Card */}
        <div className="bg-purple-900 border-2 border-yellow-500 rounded-2xl p-6 text-white">
          {loading && <p className="text-white/80">Loading customer details...</p>}
          {error && <p className="text-red-300">Error: {error}</p>}
          {data && (
            <div className="space-y-8">
              {/* At-a-glance strip */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-white/15 border border-white/20 p-4">
                  <div className="text-white text-xs uppercase tracking-wide font-bold">Name</div>
                  <div className="text-white font-bold mt-1 truncate">{customerName || '—'}</div>
                </div>
                <div className="rounded-xl bg-white/15 border border-white/20 p-4">
                  <div className="text-white text-xs uppercase tracking-wide font-bold">Customer ID</div>
                  <div className="text-white font-bold font-mono mt-1 truncate">{customerId || '—'}</div>
                </div>
                <div className="rounded-xl bg-white/15 border border-white/20 p-4">
                  <div className="text-white text-xs uppercase tracking-wide font-bold">Email</div>
                  <div className="text-white font-bold mt-1 truncate">{customerEmail || '—'}</div>
                </div>
              </div>

              {/* Customer Details removed by request */}

              {/* Credit Grants */}
              <section>
                <div className="inline-flex items-center gap-2 bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow mb-4">
                  <span>Credit Grants</span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <span className="pill text-white font-bold bg-white/10 border border-white/20">Granted Credits</span>
                    <span className="pill text-white font-bold bg-white/10 border border-white/20">Available Credits</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <span className="metric text-white font-bold bg-white/10 border border-white/20">{grantedUnits}</span>
                    <span className="metric text-white font-bold bg-white/10 border border-white/20">{availableUnits}</span>
                  </div>
                </div>
              </section>

              {/* Input Usage */}
              <section>
                <div className="inline-flex items-center gap-2 bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow mb-4">
                  <span>Input Usage</span>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 p-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <button className="action green" onClick={() => setOpenAiModal(true)}>Input Open AI Usage</button>
                    <button className="action green" onClick={() => setClaudeModal(true)}>Input Claude Usage</button>
                    <button className="action green" onClick={() => setGrokModal(true)}>Input Grok Usage</button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* utility styles for chips/buttons in one place */}
      <style jsx>{`
        .chip { background: rgba(255,255,255,0.08); color: #fff; padding: 0.5rem 1rem; border-radius: 0.75rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.2); }
        .value { background: rgba(255,255,255,0.08); color: #fff; padding: 0.5rem 1rem; border-radius: 0.75rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.2); }
        .pill { padding: 0.75rem 1.25rem; border-radius: 0.75rem; text-align: center; }
        .metric { padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; text-align: center; }
        .action { padding: 0.875rem 1rem; border-radius: 0.75rem; font-weight: 700; color: #fff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.25), 0 4px 6px -4px rgba(0,0,0,0.25); transition: transform .15s ease, background-color .2s ease; }
        .action.green { background: #22c55e; }
        .action.green:hover { background: #16a34a; transform: translateY(-1px); }
        .action:active { transform: translateY(0); }
      `}</style>

      {openAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Record Open AI usage</h2>
              <button
                onClick={() => !openAiSubmitting && setOpenAiModal(false)}
                className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                disabled={openAiSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (openAiEvents === '' || !Number.isFinite(Number(openAiEvents))) return;
                try {
                  setOpenAiSubmitting(true);
                  const resp = await fetch('/api/meter-openai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      customerId,
                      date: openAiDate,
                      value: Number(openAiEvents)
                    })
                  });
                  const json = await resp.json();
                  if (!resp.ok || !json.success) {
                    throw new Error(json.error || 'Failed to register OpenAI usage');
                  }
                  setOpenAiModal(false);
                  setOpenAiEvents('');
                } catch (err) {
                  console.error(err);
                } finally {
                  setOpenAiSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={openAiDate}
                  onChange={(e) => setOpenAiDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={openAiEvents}
                  onChange={(e) => setOpenAiEvents(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                  step={1}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => !openAiSubmitting && setOpenAiModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                  disabled={openAiSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md disabled:bg-gray-400"
                  disabled={openAiSubmitting}
                >
                  {openAiSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {grokModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Record Grok usage</h2>
              <button
                onClick={() => !grokSubmitting && setGrokModal(false)}
                className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                disabled={grokSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (grokEvents === '' || !Number.isFinite(Number(grokEvents))) return;
                try {
                  setGrokSubmitting(true);
                  const resp = await fetch('/api/meter-grok', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      customerId,
                      date: grokDate,
                      value: Number(grokEvents)
                    })
                  });
                  const json = await resp.json();
                  if (!resp.ok || !json.success) {
                    throw new Error(json.error || 'Failed to register Grok usage');
                  }
                  setGrokModal(false);
                  setGrokEvents('');
                } catch (err) {
                  console.error(err);
                } finally {
                  setGrokSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={grokDate}
                  onChange={(e) => setGrokDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={grokEvents}
                  onChange={(e) => setGrokEvents(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                  step={1}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => !grokSubmitting && setGrokModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                  disabled={grokSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md disabled:bg-gray-400"
                  disabled={grokSubmitting}
                >
                  {grokSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {claudeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Record Claude usage</h2>
              <button
                onClick={() => !claudeSubmitting && setClaudeModal(false)}
                className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                disabled={claudeSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (claudeEvents === '' || !Number.isFinite(Number(claudeEvents))) return;
                try {
                  setClaudeSubmitting(true);
                  const resp = await fetch('/api/meter-claude', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      customerId,
                      date: claudeDate,
                      value: Number(claudeEvents)
                    })
                  });
                  const json = await resp.json();
                  if (!resp.ok || !json.success) {
                    throw new Error(json.error || 'Failed to register Claude usage');
                  }
                  setClaudeModal(false);
                  setClaudeEvents('');
                } catch (err) {
                  console.error(err);
                } finally {
                  setClaudeSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={claudeDate}
                  onChange={(e) => setClaudeDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={claudeEvents}
                  onChange={(e) => setClaudeEvents(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                  step={1}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => !claudeSubmitting && setClaudeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                  disabled={claudeSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md disabled:bg-gray-400"
                  disabled={claudeSubmitting}
                >
                  {claudeSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
