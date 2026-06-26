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
        const formspreeEndpoint = process.env.VITE_FORMSPREE_ENDPOINT;

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

          console.log("[stripe webhook] checkout.session.completed", {
            sessionId: session.id,
            metadata,
          });

          if (formspreeEndpoint) {
            const jersey = getJersey(metadata.slug);
            const quantity = Number(metadata.quantity);
            const total = Number.isFinite(quantity) && quantity >= 1 ? JERSEY_PRICE * quantity : JERSEY_PRICE;
            const subject = `New jersey order — ${jersey?.name ?? "Custom Jersey"}`;

            try {
              await fetch(formspreeEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                  _subject: subject,
                  ...(metadata.email ? { email: metadata.email } : {}),
                  Product: jersey?.name ?? "Custom Jersey",
                  Size: metadata.size,
                  "Name on Jersey": metadata.name,
                  "Jersey Number": metadata.number,
                  Quantity: metadata.quantity,
                  "Unit Price": formatGBP(JERSEY_PRICE),
                  Total: formatGBP(session.amount_total ? session.amount_total / 100 : total),
                  "Customer email": metadata.email,
                  "Receipt requested": metadata.receipt_requested,
                  "Stripe session id": session.id,
                }),
              });
            } catch (err) {
              console.error("[stripe webhook] failed to send order email", err);
            }
          }
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
