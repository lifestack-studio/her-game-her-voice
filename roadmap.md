# Roadmap

## Done
- Stripe payments: live secret key saved; checkout opens Stripe's hosted page at £65.00.
- Delivery address collection: Stripe Checkout now asks the buyer for name, address and
  country before payment (`shipping_address_collection` in `src/lib/checkout.functions.ts`,
  countries GB/IE/US/CA/AU/NZ). Verified live on checkout.stripe.com.
- Webhook records the delivery address alongside the order details.
- Webhook signing secret saved here for the Lovable preview.
- Removed the unused `VITE_STRIPE_PUBLISHABLE_KEY` line from `.env.example`, `README.md`
  (variable table and Stripe setup steps) — nothing in the site reads it.

## Open
- Live VPS still returns "Stripe webhook not configured" — `STRIPE_SECRET_KEY` and
  `STRIPE_WEBHOOK_SECRET` must be added to the VPS `.env` and the container restarted.
  Until then the live site cannot take a payment.
- Confirm `PODCAST_RSS_URL` is set on the VPS so the episode list keeps updating.
- Stripe shows "Choose currency" with euros (€78.75) pre-selected ahead of £65.00. This is
  Stripe Adaptive Pricing, not the site's currency (the code always requests `gbp`). Turn it
  off at dashboard.stripe.com/settings/adaptive-pricing, or restrict the account's currencies
  to GBP. No code change wanted here.

## Decided — not building
- Order notification emails: not wanted. Paid orders are recorded in the server log and in
  the Stripe dashboard only. Do not add an email domain, SMTP, or transactional email.
- No forced-currency code line in checkout: relying on the Stripe dashboard setting.
- Shipping cost: £65 covers the jersey only; no delivery fee added.
