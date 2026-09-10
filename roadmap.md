# Roadmap

## In progress
- Stripe payments: live secret key saved; verify checkout opens Stripe's hosted page.
- Add the webhook signing secret (`whsec_...`) once the endpoint
  `https://hergamehervoice.co.uk/api/public/stripe/webhook` is created in Stripe.

## Open
- Remove the unused `VITE_STRIPE_PUBLISHABLE_KEY` line from `.env.example` — nothing
  in the site reads it (waiting for go-ahead).
- Confirm the VPS `.env` carries `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and
  `PODCAST_RSS_URL` before the next deploy.
