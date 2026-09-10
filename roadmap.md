# Roadmap

## Done
- Stripe payments: live secret key saved; checkout opens Stripe's hosted page at £65.00.
- Delivery address collection: Stripe Checkout now asks the buyer for name, address and
  country before payment (`shipping_address_collection` in `src/lib/checkout.functions.ts`,
  countries GB/IE/US/CA/AU/NZ). Verified live on checkout.stripe.com.
- Webhook records the delivery address alongside the order details.

## In progress
- Add the webhook signing secret (`whsec_...`) once the endpoint
  `https://hergamehervoice.co.uk/api/public/stripe/webhook` is created in Stripe.
- Order notification email: blocked until an email domain is configured for the project
  (nothing in the workspace yet). Once verified, scaffold the templates and send a summary
  from the webhook.

## Open
- Live VPS still returns "Stripe webhook not configured" — `STRIPE_SECRET_KEY` and
  `STRIPE_WEBHOOK_SECRET` must be added to the VPS `.env` and the container restarted.
- Stripe shows "Choose currency" with euros (€78.75) pre-selected ahead of £65.00. Set GBP
  as the default/only currency in the Stripe dashboard so UK buyers are not billed in euros.
- Remove the unused `VITE_STRIPE_PUBLISHABLE_KEY` line from `.env.example` — nothing in the
  site reads it (waiting for go-ahead).
