import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { getRequestUrl } from "@tanstack/react-start/server";
import { JERSEY_PRICE, JERSEY_SIZES, getJersey } from "./jerseys";
import type { JerseySize } from "./jerseys";

const orderSchema = z.object({
  slug: z.string().min(1),
  size: z.enum(JERSEY_SIZES),
  name: z.string().trim().toUpperCase().max(12),
  number: z.coerce.number().int().min(0).max(99),
  quantity: z.coerce.number().int().min(1).max(10),
  email: z.string().email(),
  receiptRequested: z.boolean().default(false),
});

const checkoutResponseSchema = z.object({
  url: z.string().url(),
});

const verifySchema = z.object({
  sessionId: z.string().min(1),
});

const stripeApiVersion = "2025-04-30.basil";


export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY on the server.");
    }

    const jersey = getJersey(data.slug);
    if (!jersey) {
      throw new Error("Jersey not found.");
    }

    const stripe = new Stripe(secretKey, { apiVersion: stripeApiVersion });
    const requestUrl = getRequestUrl();
    const origin = requestUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Custom Jersey — ${jersey.name}`,
              description: `Size: ${data.size}, Name: ${data.name}, Number: ${data.number}`,
              images: [new URL(jersey.image, origin).toString()],
            },
            unit_amount: JERSEY_PRICE * 100,
          },
          quantity: data.quantity,
        },
      ],
      metadata: {
        slug: data.slug,
        size: data.size,
        name: data.name,
        number: String(data.number),
        quantity: String(data.quantity),
        email: data.email,
        receipt_requested: String(data.receiptRequested),
      },
      customer_email: data.email,
      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/${data.slug}`,
      automatic_tax: { enabled: false },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return checkoutResponseSchema.parse({ url: session.url });
  });

export const verifyCheckoutSession = createServerFn({ method: "GET" })
  .inputValidator((input) => verifySchema.parse(input))
  .handler(async ({ data }) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Stripe is not configured.");
    }

    const stripe = new Stripe(secretKey, { apiVersion: stripeApiVersion });
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);

    return {
      status: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      customerEmail: session.customer_email,
    };
  });
