import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { JERSEY_PRICE, getJersey } from "@/lib/jerseys";

const stripeApiVersion = "2026-06-24.dahlia";

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!secretKey || !endpointSecret) {
          return new Response("Stripe webhook not configured", { status: 500 });
        }

        const payload = await request.text();
        const signature = request.headers.get("stripe-signature") ?? "";

        const stripe = new Stripe(secretKey, { apiVersion: stripeApiVersion });
        let event: Stripe.Event;

        try {
          event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Invalid webhook signature";
          return new Response(`Webhook verification failed: ${message}`, { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const metadata = session.metadata ?? {};
          const jersey = getJersey(metadata.slug);
          const quantity = Number(metadata.quantity);
          const total =
            Number.isFinite(quantity) && quantity >= 1 ? JERSEY_PRICE * quantity : JERSEY_PRICE;

          // Order details are logged here and also visible in the Stripe
          // dashboard (Payments → session metadata).
          console.log("[stripe webhook] checkout.session.completed", {
            sessionId: session.id,
            product: jersey?.name ?? "Custom Jersey",
            size: metadata.size,
            nameOnJersey: metadata.name,
            jerseyNumber: metadata.number,
            quantity: metadata.quantity,
            unitPrice: formatGBP(JERSEY_PRICE),
            total: formatGBP(session.amount_total ? session.amount_total / 100 : total),
            customerEmail: metadata.email,
            receiptRequested: metadata.receipt_requested,
          });
        }


        return new Response("OK", { status: 200 });
      },
    },
  },
});
