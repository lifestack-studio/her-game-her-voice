import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CreditCard, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/components/page-hero";
import {
  JERSEY_PRICE,
  JERSEY_SIZES,
  SIZING_GUIDE_URL,
  getJersey,
  type JerseySize,
} from "@/lib/jerseys";
import { createCheckoutSession } from "@/lib/checkout.functions";

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

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

function ProductPage() {
  const { jersey } = Route.useLoaderData();
  const startCheckout = useServerFn(createCheckoutSession);

  const [size, setSize] = useState<JerseySize | "">("");
  const [name, setName] = useState("HGHV");
  const [number, setNumber] = useState("45");
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [wantReceipt, setWantReceipt] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const total = useMemo(() => JERSEY_PRICE * quantity, [quantity]);

  const handleName = (value: string) => {
    setName(value.toUpperCase().slice(0, 12));
  };

  const handleNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 2);
    setNumber(digits);
  };

  const numberValue = number === "" ? 0 : Math.min(99, Number(number));

  const handleCheckout = async () => {
    if (!size) {
      toast.error("Please choose a size.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsRedirecting(true);
    try {
      const { url } = await startCheckout({
        data: {
          slug: jersey.slug,
          size,
          name: name || "HGHV",
          number: numberValue,
          quantity,
          email: email.trim(),
          receiptRequested: wantReceipt,
        },
      });
      window.location.href = url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed.";
      toast.error(message);
      setIsRedirecting(false);
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

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Receipt opt-in */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="receipt"
                    checked={wantReceipt}
                    onCheckedChange={(checked) => setWantReceipt(checked === true)}
                  />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor="receipt" className="text-sm font-normal">
                      Email me a copy of the receipt
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      We’ll also send your order details to the team from this address.
                    </p>
                  </div>
                </div>

                <Button
                  variant="coral"
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isRedirecting}
                >
                  <CreditCard className="size-5" />
                  {isRedirecting ? "Redirecting to Stripe…" : `Pay with Stripe — ${formatGBP(total)}`}
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
    </>
  );
}
