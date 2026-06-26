Plan: self-hosted Stripe payment for jerseys

## Goal
Replace the current email-only order flow on the jersey detail pages with a real Stripe Checkout flow that works on your own self-hosted Docker server. The customer customises the jersey, clicks to pay, is redirected to Stripe to complete payment, then returns to a confirmation page. Order details still reach the contact email.

## Why this fits self-hosting
Lovable's built-in Payments requires Lovable Cloud. This plan uses Stripe's own APIs (bring-your-own-account) directly inside the app. You will need a Stripe account and API keys, but the checkout server and the site stay on your Docker host.

## What will be built

### 1. Dependencies
Add the official Stripe packages:
- `stripe` (server-side)
- `@stripe/stripe-js` (client-side, optional but used for redirection helpers)

### 2. Server functions (src/lib/)
Create `src/lib/stripe.server.ts` or extend `src/lib/config.server.ts` to read the Stripe secret key server-side only.

Create a server function (e.g. in `src/lib/checkout.functions.ts`) that:
- Accepts `{ slug, size, name, number, quantity, email }`
- Validates size, quantity, name length, and number range
- Creates a Stripe Checkout Session with:
  - One line item: `Custom Jersey - {jersey.name}` at the existing £65 unit price times quantity
  - `metadata` containing: jersey slug, size, name, number, quantity, customer email, receipt preference
  - `success_url` pointing to `/shop/success?session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url` pointing back to `/shop/{slug}`
- Returns `{ url: session.url }` for the client to redirect to

Create a second server function to verify the session on the success page:
- Accepts `session_id`
- Calls `stripe.checkout.sessions.retrieve(session_id)`
- Returns the payment status and the embedded metadata

### 3. Environment variables
Add to `.env.example` (and your Docker host `.env`):

```text
VITE_STRIPE_PUBLISHABLE_KEY=pk_...          # public, ships to browser
STRIPE_SECRET_KEY=sk_...                    # server-only, never sent to client
STRIPE_WEBHOOK_SECRET=whsec_...               # optional, for /api/public/stripe/webhook
```

`STRIPE_WEBHOOK_SECRET` is optional but recommended for production. If you don't use webhooks, the success page verification is enough.

### 4. Client changes
Update `src/routes/shop_.$slug.tsx`:
- Replace the "Place Order" dialog flow with a single validated flow
- Collect email before redirect (this is used for Stripe receipt and order email)
- When the user clicks the final payment button, call the checkout server function
- Redirect the browser to the returned Stripe Checkout URL
- Show a loading state while the session is created

Create a new route `src/routes/shop.success.tsx`:
- Reads `session_id` from the query string
- Calls the verify-session server function
- Shows a success message with the order details
- If the payment is complete, sends the order summary to the contact email via the existing Formspree/mailto path (so the fulfilment team still gets the jersey details)
- Shows an error if the session is missing or unpaid

### 5. Optional: Stripe webhook endpoint
Create `src/routes/api/public/stripe/webhook.ts`:
- Handles `POST` from Stripe
- Verifies the signature using `STRIPE_WEBHOOK_SECRET`
- On `checkout.session.completed`, emails the order metadata to the contact email
- Returns `200 OK` to Stripe

This is useful if a customer closes the browser after paying but before reaching the success page. It is not strictly required for the basic flow.

### 6. Documentation
Update `README.md` (or a new `SELFHOSTING.md`) with:
- How to get a Stripe account and keys
- Which env vars to set on the Docker host
- How to add the webhook endpoint URL in Stripe if you use it
- How to test with Stripe's test mode

## Data flow

```text
Customer on /shop/{slug}
  |
  v
Fills size, name, number, quantity, email
  |
  v
Clicks "Pay with Stripe"
  |
  v
POST -> createServerFn -> Stripe Checkout Session
  |
  v
Redirect to stripe.com/checkout
  |
  v
Customer pays on Stripe
  |
  v
Redirect to /shop/success?session_id=xxx
  |
  v
Server verifies session + metadata
  |
  v
Success page shows order summary
  |
  v
Formspree/mailto sends order to contact email
```

## What stays the same
- Jersey price (£65) and size/name/number rules stay exactly as they are.
- The made-to-order "no returns/exchanges" disclaimer and sizing-guide link stay.
- The "More Merch" external shop link is unchanged.
- The existing contact email (`hergamehervoicepodcast@gmail.com`) is used for order notifications.

## What the user must provide
- A Stripe account (standard free signup)
- `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` from the Stripe dashboard
- A public domain with HTTPS (Stripe requires this for live mode)

## Notes
- The current Formspree endpoint (`VITE_FORMSPREE_ENDPOINT`) is reused for sending the order details after payment. If Formspree is not configured, the flow falls back to the mailto link as it does today.
- No database is added. All order data is stored in the Stripe Checkout Session metadata.
- Webhook setup is optional; the success page is the primary confirmation path.

## Estimated files changed/created
- `package.json` — add Stripe packages
- `.env.example` — add Stripe env vars
- `src/lib/config.server.ts` — add Stripe secret key read
- `src/lib/checkout.functions.ts` — new: create checkout session
- `src/routes/shop_.$slug.tsx` — update order flow
- `src/routes/shop.success.tsx` — new: success page
- `src/routes/api/public/stripe/webhook.ts` — new: optional webhook
- `README.md` — add Stripe setup instructions

Approve this plan and I'll implement it.