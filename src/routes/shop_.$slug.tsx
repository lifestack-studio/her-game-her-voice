import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHero } from "@/components/page-hero";
import { CONTACT_EMAIL } from "@/lib/site";
import {
  JERSEY_PRICE,
  JERSEY_SIZES,
  SIZING_GUIDE_URL,
  getJersey,
  type JerseySize,
} from "@/lib/jerseys";

export const Route = createFileRoute("/shop_/$slug")({
  loader: ({ params }) => {
    const jersey = getJersey(params.slug);
    if (!jersey) throw notFound();
    return { jersey };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.jersey.name ?? "Jersey";
    return {
      meta: [
        { title: `${name} | Her Game, Her Voice` },
        {
          name: "description",
          content: `Customise and order the ${name} — choose your size, name and number. Made to order by Rhino Direct.`,
        },
        { property: "og:title", content: `${name} | Her Game, Her Voice` },
        {
          property: "og:description",
          content: `Customise and order the ${name}.`,
        },
        { property: "og:image", content: loaderData?.jersey.image },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <h1 className="font-display text-3xl font-bold text-primary">Jersey not found</h1>
      <p className="mt-3 text-muted-foreground">We couldn’t find that jersey.</p>
      <Button asChild variant="coral" className="mt-6">
        <Link to="/shop">Back to Shop</Link>
      </Button>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <h1 className="font-display text-3xl font-bold text-primary">Something went wrong</h1>
      <Button asChild variant="coral" className="mt-6">
        <Link to="/shop">Back to Shop</Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined;

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

function ProductPage() {
  const { jersey } = Route.useLoaderData();

  const [size, setSize] = useState<JerseySize | "">("");
  const [name, setName] = useState("HGHV");
  const [number, setNumber] = useState("45");
  const [quantity, setQuantity] = useState(1);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [wantReceipt, setWantReceipt] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const total = useMemo(() => JERSEY_PRICE * quantity, [quantity]);

  const handleName = (value: string) => {
    setName(value.toUpperCase().slice(0, 12));
  };

  const handleNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 2);
    setNumber(digits);
  };

  const numberValue = number === "" ? 0 : Math.min(99, Number(number));

  const openReceiptStep = () => {
    if (!size) {
      toast.error("Please choose a size.");
      return;
    }
    setReceiptOpen(true);
  };

  const orderSummaryLines = () => [
    `Product: ${jersey.name}`,
    `Size: ${size}`,
    `Name on Jersey: ${name || "—"}`,
    `Jersey Number: ${numberValue}`,
    `Quantity: ${quantity}`,
    `Unit Price: ${formatGBP(JERSEY_PRICE)}`,
    `Total: ${formatGBP(total)}`,
  ];

  const submitOrder = async () => {
    if (wantReceipt) {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiptEmail.trim());
      if (!valid) {
        toast.error("Please enter a valid email for your receipt.");
        return;
      }
    }

    setSubmitting(true);
    const summary = orderSummaryLines().join("\n");
    const subject = `New jersey order — ${jersey.name}`;

    try {
      if (FORMSPREE_ENDPOINT) {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: subject,
            ...(wantReceipt && receiptEmail.trim() ? { _cc: receiptEmail.trim(), email: receiptEmail.trim() } : {}),
            Product: jersey.name,
            Size: size,
            "Name on Jersey": name,
            "Jersey Number": numberValue,
            Quantity: quantity,
            "Unit Price": formatGBP(JERSEY_PRICE),
            Total: formatGBP(total),
            "Receipt requested": wantReceipt ? "Yes" : "No",
          }),
        });
        if (!res.ok) throw new Error("Request failed");
      } else {
        const ccParam = wantReceipt && receiptEmail.trim() ? `&cc=${encodeURIComponent(receiptEmail.trim())}` : "";
        const body = encodeURIComponent(
          `${summary}\n\nReceipt requested: ${wantReceipt ? "Yes" : "No"}`,
        );
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}${ccParam}&body=${body}`;
      }
      setReceiptOpen(false);
      setConfirmed(true);
    } catch {
      toast.error("Something went wrong sending your order. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero title="Customise Your Jersey" subtitle="Made to order" />

      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
            <Link to="/shop">
              <ArrowLeft className="size-4" /> Back to Shop
            </Link>
          </Button>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Image */}
            <div className="overflow-hidden rounded-2xl bg-muted">
              <img
                src={jersey.image}
                alt={`${jersey.name} — Her Game, Her Voice`}
                width={1024}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Configurator */}
            <div>
              <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">
                {jersey.name}
              </h1>
              <p className="mt-2 text-2xl font-bold text-accent">{formatGBP(total)}</p>
              <p className="text-sm text-muted-foreground">{formatGBP(JERSEY_PRICE)} each</p>

              <div className="mt-8 space-y-6">
                {/* Size */}
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select value={size} onValueChange={(v) => setSize(v as JerseySize)}>
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Choose a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {JERSEY_SIZES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name">Name on Jersey</Label>
                    <span className="text-xs text-muted-foreground">{name.length}/12</span>
                  </div>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleName(e.target.value)}
                    maxLength={12}
                    placeholder="HGHV"
                  />
                </div>

                {/* Number */}
                <div className="space-y-2">
                  <Label htmlFor="number">Jersey Number (0–99)</Label>
                  <Input
                    id="number"
                    inputMode="numeric"
                    value={number}
                    onChange={(e) => handleNumber(e.target.value)}
                    onBlur={() => setNumber(String(numberValue))}
                    placeholder="45"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </Button>
                    <Input
                      id="quantity"
                      inputMode="numeric"
                      className="w-20 text-center"
                      value={quantity}
                      onChange={(e) => {
                        const n = Number(e.target.value.replace(/\D/g, ""));
                        setQuantity(Number.isFinite(n) && n >= 1 ? n : 1);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  variant="coral"
                  size="lg"
                  className="w-full"
                  onClick={openReceiptStep}
                >
                  <ShoppingBag className="size-5" /> Place Order — {formatGBP(total)}
                </Button>
              </div>

              {/* Description */}
              <div className="mt-8 space-y-3 rounded-2xl bg-secondary/30 p-5 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-primary">Note:</span> Custom jerseys are unable
                  to be returned or exchanged as they are made to order.
                </p>
                <p>
                  For a sizing guide, please visit:{" "}
                  <a
                    href={SIZING_GUIDE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent hover:underline"
                  >
                    Rhino Sports 5-Panel Pro V-Neck
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Receipt / confirmation dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your order</DialogTitle>
            <DialogDescription>Review your jersey details before sending.</DialogDescription>
          </DialogHeader>

          <ul className="space-y-1 rounded-xl bg-muted/50 p-4 text-sm">
            {orderSummaryLines().map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={wantReceipt}
                onChange={(e) => setWantReceipt(e.target.checked)}
                className="size-4 accent-[var(--color-accent,#FF4500)]"
              />
              Email me a copy of the receipt
            </label>
            {wantReceipt && (
              <Input
                type="email"
                placeholder="you@email.com"
                value={receiptEmail}
                onChange={(e) => setReceiptEmail(e.target.value)}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptOpen(false)}>
              Cancel
            </Button>
            <Button variant="coral" onClick={submitOrder} disabled={submitting}>
              {submitting ? "Sending…" : "Confirm & Send Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={confirmed} onOpenChange={setConfirmed}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order sent!</DialogTitle>
            <DialogDescription>
              Thanks — we’ve received your jersey order and will be in touch to arrange payment and
              delivery.
              {wantReceipt && receiptEmail ? ` A copy has been sent to ${receiptEmail}.` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild variant="coral">
              <Link to="/shop">Back to Shop</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
