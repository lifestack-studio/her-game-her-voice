import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { CONTACT_EMAIL } from "@/lib/site";
import { verifyCheckoutSession } from "@/lib/checkout.functions";
import { JERSEY_PRICE, getJersey } from "@/lib/jerseys";

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined;

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

export const Route = createFileRoute("/shop/success")({
  head: () => ({
    meta: [
      { title: "Order Confirmation | Her Game, Her Voice" },
      {
        name: "description",
        content: "Thank you for your order. We’ll be in touch to confirm your custom jersey.",
      },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { session_id } = useSearch({ from: "/shop/success" });
  const verifySession = useServerFn(verifyCheckoutSession);

  const [state, setState] = useState<{
    status: "loading" | "success" | "unpaid" | "missing" | "error";
    message?: string;
    metadata?: Record<string, string>;
  }>({ status: "loading" });

  const emailSentRef = useRef(false);

  useEffect(() => {
    if (!session_id) {
      setState({ status: "missing" });
      return;
    }

    let cancelled = false;

    verifySession({ data: { sessionId: session_id } })
      .then((result) => {
        if (cancelled) return;

        if (result.status === "paid" && result.metadata) {
          if (!emailSentRef.current) {
            emailSentRef.current = true;
            void sendOrderConfirmation(result.metadata, result.amountTotal ?? JERSEY_PRICE);
          }
        }

        setState({
          status: result.status === "paid" ? "success" : "unpaid",
          metadata: result.metadata ?? undefined,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Could not confirm your order.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [session_id, verifySession]);

  return (
    <>
      <PageHero title="Order Confirmation" subtitle="Thank you" />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center">
          {state.status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="size-10 animate-spin text-accent" />
              <p className="text-muted-foreground">Confirming your payment…</p>
            </div>
          )}

          {state.status === "success" && state.metadata && (
            <div className="space-y-6">
              <CheckCircle className="mx-auto size-14 text-green-500" />
              <div>
                <h1 className="font-display text-3xl font-bold text-primary">Payment received</h1>
                <p className="mt-2 text-muted-foreground">
                  Thank you for your order. We’ve received your payment and will send your jersey
                  details to the team.
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/30 p-6 text-left text-sm">
                <h2 className="mb-4 font-display text-lg font-semibold text-primary">Order summary</h2>
                <dl className="grid gap-2">
                  <OrderRow label="Product" value={productName(state.metadata)} />
                  <OrderRow label="Size" value={state.metadata.size} />
                  <OrderRow label="Name on Jersey" value={state.metadata.name} />
                  <OrderRow label="Jersey Number" value={state.metadata.number} />
                  <OrderRow label="Quantity" value={state.metadata.quantity} />
                  <OrderRow label="Email" value={state.metadata.email} />
                  <OrderRow label="Total" value={formatGBP(totalFromMetadata(state.metadata))} />
                </dl>
              </div>

              <Button asChild variant="coral" size="lg">
                <Link to="/shop">Back to Shop</Link>
              </Button>
            </div>
          )}

          {state.status === "unpaid" && (
            <div className="space-y-6">
              <XCircle className="mx-auto size-14 text-orange-500" />
              <h1 className="font-display text-3xl font-bold text-primary">Payment not complete</h1>
              <p className="text-muted-foreground">
                We couldn’t confirm a successful payment for this session. If you cancelled or
                something went wrong, you can return to the shop and try again.
              </p>
              <Button asChild variant="coral" size="lg">
                <Link to="/shop">Back to Shop</Link>
              </Button>
            </div>
          )}

          {state.status === "missing" && (
            <div className="space-y-6">
              <XCircle className="mx-auto size-14 text-orange-500" />
              <h1 className="font-display text-3xl font-bold text-primary">No session found</h1>
              <p className="text-muted-foreground">
                We couldn’t find a checkout session to confirm. If you were expecting a
                confirmation, please contact us.
              </p>
              <Button asChild variant="coral" size="lg">
                <Link to="/shop">Back to Shop</Link>
              </Button>
            </div>
          )}

          {state.status === "error" && (
            <div className="space-y-6">
              <XCircle className="mx-auto size-14 text-destructive" />
              <h1 className="font-display text-3xl font-bold text-primary">Something went wrong</h1>
              <p className="text-muted-foreground">{state.message}</p>
              <Button asChild variant="coral" size="lg">
                <Link to="/shop">Back to Shop</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function OrderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-primary">{value}</dd>
    </div>
  );
}

function productName(metadata: Record<string, string>): string {
  const jersey = getJersey(metadata.slug);
  return jersey?.name ?? "Custom Jersey";
}

function totalFromMetadata(metadata: Record<string, string>): number {
  const quantity = Number(metadata.quantity);
  return Number.isFinite(quantity) && quantity >= 1 ? JERSEY_PRICE * quantity : JERSEY_PRICE;
}

async function sendOrderConfirmation(metadata: Record<string, string>, amountTotal: number | null) {
  const jersey = getJersey(metadata.slug);
  const quantity = Number(metadata.quantity);
  const total = Number.isFinite(quantity) && quantity >= 1 ? JERSEY_PRICE * quantity : JERSEY_PRICE;
  const subject = `New jersey order — ${jersey?.name ?? "Custom Jersey"}`;

  if (FORMSPREE_ENDPOINT) {
    try {
      await fetch(FORMSPREE_ENDPOINT, {
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
          Total: formatGBP(amountTotal ? amountTotal / 100 : total),
          "Customer email": metadata.email,
          "Receipt requested": metadata.receipt_requested,
        }),
      });
    } catch {
      // Silent failure — Stripe already recorded the order.
    }
  } else {
    const body = encodeURIComponent(
      [
        `Product: ${jersey?.name ?? "Custom Jersey"}`,
        `Size: ${metadata.size}`,
        `Name on Jersey: ${metadata.name}`,
        `Jersey Number: ${metadata.number}`,
        `Quantity: ${metadata.quantity}`,
        `Total: ${formatGBP(amountTotal ? amountTotal / 100 : total)}`,
        `Customer email: ${metadata.email}`,
        `Receipt requested: ${metadata.receipt_requested}`,
      ].join("\n"),
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
  }
}
