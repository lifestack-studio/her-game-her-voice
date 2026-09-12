import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { JERSEY_PRICE, getJersey } from "@/lib/jerseys";

const stripeApiVersion = "2026-06-24.dahlia";

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

const formatDelivery = (session: Stripe.Checkout.Session) => {
  // Stripe returns the address collected by `shipping_address_collection`
  // under `collected_information`, not on a top-level `shipping` field.
  const shipping = session.collected_information?.shipping_details;
  if (!shipping) return "Not provided";
  const { address } = shipping;
  const line = [address.line1, address.line2, address.city, address.state, address.postal_code, address.country]
    .filter(Boolean)
    .join(", ");
  return `${shipping.name ? `${shipping.name}, ` : ""}${line}`;
};

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
            deliveryAddress: formatDelivery(session),
          });
        }


        return new Response("OK", { status: 200 });
      },
    },
  },
});
