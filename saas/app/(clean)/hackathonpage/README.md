# Hackathon Page & Usage Metering

This page renders pricing cards (Starter, Advanced) and a modal to submit usage events to Stripe Billing v2 meters.

## Routes
- Page: /hackathonpage
- API: POST /api/meter-events

## Env vars (saas/saas/.env.local)
- POSTGRES_URL
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- BASE_URL (e.g. http://localhost:3001)
- NEXT_PUBLIC_APP_URL (e.g. http://localhost:3001)

## Run locally
1) cd saas/saas
2) pnpm install
3) pnpm dev

## Usage modal
- Open via the "Input your usage" button (top-right above the grid)
- Fields: Customer Id, Date (defaults to today), System (Open AI/Claude/Grok/none), Usage events (number)
- Success message: Meter event has been registered under "<event_name>" for the customer "<customerId>"

## API behavior (/api/meter-events)
- If System is selected:
  - event_name: Sysevent36
  - payload: { stripe_customer_id, value (string), type: openai|claude|grok }
- If System not selected:
  - event_name: Event36
  - payload: { stripe_customer_id, value (string) }

Notes:
- Posts to https://api.stripe.com/v2/billing/meter_events with Stripe-Version: unsafe-development
- value must be sent as a string
