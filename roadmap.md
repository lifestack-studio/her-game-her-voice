# Roadmap

## In progress
- Stripe payments: live secret key saved and checkout verified (opens Stripe's hosted
  page, £65.00 shown).
- Add the webhook signing secret (`whsec_...`) once the endpoint
  `https://hergamehervoice.co.uk/api/public/stripe/webhook` is created in Stripe.
- Live VPS still returns "Stripe webhook not configured" — `STRIPE_SECRET_KEY` and
  `STRIPE_WEBHOOK_SECRET` must be added to the VPS `.env` and the container restarted.

## Open
- Remove the unused `VITE_STRIPE_PUBLISHABLE_KEY` line from `.env.example` — nothing
  in the site reads it (waiting for go-ahead).
- Optional: check Stripe's currency setting — checkout offered "Choose currency"
  with euros first for a UK-priced order.
