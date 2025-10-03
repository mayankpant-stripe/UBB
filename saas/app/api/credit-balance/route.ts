import { NextRequest, NextResponse } from 'next/server';

async function computeCreditBalance(customerId: string) {
  console.log('[credit-balance] customerId =', customerId);

    const headers = {
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'Stripe-Version': '2025-05-28.basil;checkout_product_catalog_preview=v1'
    } as Record<string, string>;

    // Determine reference time using the customer's test clock if present
    let refTimeMs = Date.now();
    try {
      const custUrl = `https://api.stripe.com/v1/customers/${encodeURIComponent(customerId)}`;
      const custRes = await fetch(custUrl, { method: 'GET', headers });
      const custText = await custRes.text();
      if (custRes.ok) {
        const custJson = custText ? JSON.parse(custText) : {};
        const testClockId: string | undefined =
          typeof custJson?.test_clock === 'string'
            ? custJson.test_clock
            : custJson?.test_clock?.id || undefined;
        if (testClockId) {
          console.log('[credit-balance] customer test_clock =', testClockId);
          const tcUrl = `https://api.stripe.com/v1/test_helpers/test_clocks/${encodeURIComponent(testClockId)}`;
          const tcRes = await fetch(tcUrl, { method: 'GET', headers });
          const tcText = await tcRes.text();
          if (tcRes.ok) {
            const tcJson = tcText ? JSON.parse(tcText) : {};
            const frozen = tcJson?.frozen_time; // epoch seconds
            if (typeof frozen === 'number' && isFinite(frozen)) {
              refTimeMs = frozen < 1e12 ? frozen * 1000 : frozen;
              console.log('[credit-balance] using test clock time (ms) =', refTimeMs);
            }
          } else {
            console.warn('[credit-balance] failed to fetch test clock', tcRes.status, tcText);
          }
        }
      } else {
        console.warn('[credit-balance] failed to fetch customer', custRes.status, custText);
      }
    } catch (e: any) {
      console.warn('[credit-balance] test clock lookup error', e?.message || String(e));
    }

    // no GET bodies; use query params for v1 endpoints

    // 1) Retrieve all credit grants for the customer
    const grantsUrl = `https://api.stripe.com/v1/billing/credit_grants?customer=${encodeURIComponent(customerId)}`;
    console.log('[credit-balance] credit_grants GET', { url: grantsUrl });
    const grantsRes = await fetch(grantsUrl, { method: 'GET', headers });
    const grantsText = await grantsRes.text();
    if (!grantsRes.ok) {
      return {
        success: false,
        error: `Failed to fetch credit grants: ${grantsRes.status} - ${grantsText}`,
        status: grantsRes.status
      } as const;
    }
    const grantsJson = grantsText ? JSON.parse(grantsText) : {};
    const grants: any[] = Array.isArray((grantsJson as any).data)
      ? (grantsJson as any).data
      : Array.isArray((grantsJson as any).items)
      ? (grantsJson as any).items
      : [];
    console.log('[credit-balance] fetched grants =', grants.length, grants.map((g:any)=>({id:g?.id, expires_at:g?.expires_at||g?.expiration?.at||null})));

    // 3) Filter to grants not expired relative to ref time
    const activeGrants = grants.filter((g) => {
      const expRaw = g?.expires_at ?? g?.expiration?.at ?? null;
      if (expRaw == null) return true;
      let expMs: number = NaN;
      if (typeof expRaw === 'number') {
        expMs = expRaw < 1e12 ? expRaw * 1000 : expRaw;
      } else if (typeof expRaw === 'string' && /^\d+$/.test(expRaw)) {
        const num = Number(expRaw);
        expMs = num < 1e12 ? num * 1000 : num;
      } else {
        expMs = new Date(expRaw).getTime();
      }
      return isFinite(expMs) ? expMs >= refTimeMs : true;
    });
    console.log('[credit-balance] active grants =', activeGrants.length, activeGrants.map((g:any)=>g?.id));

    let totalGranted = 0;
    let totalAvailable = 0;
    const perGrantSummaries: Array<{ grantId: string; granted: number; available: number; error?: string }> = [];

    // 3) For each applicable grant, GET credit_balance_summary with filters
    for (const grant of activeGrants) {
      const grantId = grant?.id || grant?.credit_grant_id || grant?.credit_grant || null;
      if (!grantId) continue;

      // Get the original grant amount from the grant object itself
      const originalGrantAmount = grant?.amount?.monetary?.value 
        ?? grant?.amount?.custom_pricing_unit?.value
        ?? grant?.amount?.value
        ?? 0;
      const originalIsMonetary = Boolean(grant?.amount?.monetary) && !grant?.amount?.custom_pricing_unit;
      
      let originalGrantValue = Number(originalGrantAmount) || 0;
      if (originalIsMonetary) originalGrantValue = originalGrantValue / 100;

      const filter = encodeURIComponent(
        JSON.stringify({
          applicability_scope: { price_type: 'metered' },
          credit_grant: grantId,
          type: 'credit_grant'
        })
      );
      const params = new URLSearchParams();
      params.set('customer', customerId);
      params.set('filter[applicability_scope][price_type]', 'metered');
      params.set('filter[credit_grant]', grantId);
      params.set('filter[type]', 'credit_grant');
      const sumUrl = `https://api.stripe.com/v1/billing/credit_balance_summary?${params.toString()}`;
      console.log('[credit-balance] credit_balance_summary GET', { url: sumUrl });
      const sumRes = await fetch(sumUrl, { method: 'GET', headers });
      const sumText = await sumRes.text();
      if (!sumRes.ok) {
        console.warn('[credit-balance] summary error for', grantId, sumRes.status, sumText);
        perGrantSummaries.push({ grantId, granted: originalGrantValue, available: 0, error: `${sumRes.status}: ${sumText}` });
        totalGranted += originalGrantValue;
        continue;
      }
      const sumJson = sumText ? JSON.parse(sumText) : {};
      // Some versions return balances under `balances[0]`
      const summaryNode = Array.isArray(sumJson?.balances) && sumJson.balances.length > 0
        ? sumJson.balances[0]
        : sumJson;

      // available: balances[0].available_balance.custom_pricing_unit.value OR .monetary.value OR .value
      const availableValRaw =
        summaryNode?.available_balance?.custom_pricing_unit?.value
        ?? summaryNode?.available_balance?.monetary?.value
        ?? summaryNode?.available_balance?.value
        ?? '0';
      const availableIsMonetary = Boolean(summaryNode?.available_balance?.monetary) && !summaryNode?.available_balance?.custom_pricing_unit;

      let a = Number(availableValRaw) || 0;
      if (availableIsMonetary) a = a / 100;
      
      totalAvailable += a;
      totalGranted += originalGrantValue;  // Use original grant amount, not current balance
      perGrantSummaries.push({ grantId, granted: originalGrantValue, available: a });
      console.log('[credit-balance] grant summary', { grantId, granted: originalGrantValue, available: a });
    }
  return {
    success: true,
    grantedUnits: String(totalGranted),
    availableUnits: String(totalAvailable),
    includedUnits: String(totalGranted),
    debug: {
      grants: grants.map((g) => ({ id: g?.id, expires_at: g?.expires_at || g?.expiration?.at || null })),
      activeGrants: activeGrants.map((g) => ({ id: g?.id, expires_at: g?.expires_at || g?.expiration?.at || null })),
      summaries: perGrantSummaries
    }
  } as const;
}

// Fetch active credit grants for a customer and then summarize balances per grant
export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    console.log('[credit-balance] raw POST body =', body);
    const customerId: string | undefined = body?.customerId || body?.customer;
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'customerId is required' }, { status: 400 });
    }
    const result = await computeCreditBalance(customerId);
    if ('status' in result && result.status !== 200) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status as number });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const customerId = url.searchParams.get('customerId') || url.searchParams.get('customer') || undefined;
    console.log('[credit-balance] GET query =', Object.fromEntries(url.searchParams));
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'customerId is required' }, { status: 400 });
    }
    const result = await computeCreditBalance(customerId);
    if ('status' in result && result.status !== 200) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status as number });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


