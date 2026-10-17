"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SmartImage } from "@/components/shared/smart-image";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCartActions, useCartLines } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/site";
import { cartKey, MAX_LINE_QUANTITY } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import type { ValidatedLine } from "@/lib/cart/validate";

interface CartViewProps {
  freeShippingThreshold: number | null;
  whatsappConfigured: boolean;
}

export function CartView({ freeShippingThreshold, whatsappConfigured }: CartViewProps) {
  const lines = useCartLines();
  const { setQuantity, remove, clear, setIssues } = useCartActions();

  const [validated, setValidated] = useState<Record<string, ValidatedLine>>({});
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState("");
  const signatureRef = useRef<string>("");

  const signature = useMemo(
    () =>
      lines
        .map(
          (l) =>
            `${cartKey(l.productId, l.variantId, l.size, l.colour)}:${l.quantity}`,
        )
        .join("|"),
    [lines],
  );

  const validate = useCallback(async () => {
    if (lines.length === 0) {
      setValidated({});
      return;
    }
    setValidating(true);
    try {
      const response = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
            size: l.size,
            colour: l.colour,
          })),
        }),
      });
      if (!response.ok) throw new Error("Could not verify your bag");
      const data = (await response.json()) as { lines: ValidatedLine[] };
      const map: Record<string, ValidatedLine> = {};
      for (const line of data.lines) {
        map[cartKey(line.productId, line.variantId, line.size, line.colour)] = line;
      }
      setValidated(map);
    } catch {
      // Verification is best-effort; the enquiry route re-checks server-side.
      toast.error("We could not verify your bag just now. You can still send an enquiry.");
    } finally {
      setValidating(false);
    }
  }, [lines]);

  useEffect(() => {
    if (signatureRef.current === signature) return;
    signatureRef.current = signature;
    void validate();
  }, [signature, validate]);

  const enriched = lines.map((line) => {
    const server = validated[cartKey(line.productId, line.variantId, line.size, line.colour)];
    const unitPrice = server?.unitPrice ?? line.unitPrice;
    const available = server ? server.available : true;
    const priceChanged =
      Boolean(server) && server.unitPrice !== null && server.unitPrice !== line.unitPrice;
    return { line, server, unitPrice, available, priceChanged };
  });

  const liveSubtotal = enriched.reduce(
    (sum, item) => (item.available ? sum + item.unitPrice * item.line.quantity : sum),
    0,
  );

  const unavailableCount = enriched.filter((item) => !item.available).length;

  // Publish issues to the store so the header could badge them if needed.
  useEffect(() => {
    setIssues(
      enriched
        .filter((item) => !item.available || item.priceChanged)
        .map((item) => ({
          key: cartKey(item.line.productId, item.line.variantId, item.line.size, item.line.colour),
          name: item.line.name,
          kind: item.available ? ("price-changed" as const) : ("unavailable" as const),
          message: item.available
            ? `Price updated to ${formatPrice(item.unitPrice)}`
            : (item.server?.stockLabel ?? "Unavailable"),
          previousPrice: item.line.unitPrice,
          currentPrice: item.unitPrice,
        })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, validated]);

  async function sendEnquiry() {
    if (lines.length === 0) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/order-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: note.trim() ? note.trim() : null,
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
            size: l.size,
            colour: l.colour,
          })),
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "We could not open WhatsApp. Please try again.");
        void validate();
        return;
      }

      toast.success("Opening WhatsApp with your selection…");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Something went wrong. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Browse the collection and add the pieces you love. You can send your selection to us on WhatsApp to confirm availability and delivery."
        action={
          <Link href="/#products" className={cn(buttonVariants({ size: "lg" }), "h-10")}>
            Shop the collection
          </Link>
        }
      />
    );
  }

  const remainingForFreeShipping =
    freeShippingThreshold && freeShippingThreshold > liveSubtotal
      ? freeShippingThreshold - liveSubtotal
      : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <ul className="divide-y divide-border border-y border-border">
          {enriched.map(({ line, server, unitPrice, available, priceChanged }) => {
            const key = cartKey(line.productId, line.variantId, line.size, line.colour);
            const options = [
              line.variantLabel,
              line.size ? `Size: ${line.size}` : null,
              line.colour ? `Colour: ${line.colour}` : null,
            ].filter(Boolean);
            return (
              <li key={key} className="flex gap-4 py-5">
                <Link
                  href={`/#product-${line.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-brand-c100 sm:size-28"
                >
                  <SmartImage src={line.imageUrl} alt="" fill sizes="112px" className="object-cover" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-base leading-snug">
                        <Link href={`/#product-${line.slug}`} className="hover:text-gold-strong">
                          {line.name}
                        </Link>
                      </h2>
                      {options.length > 0 ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {options.join(" · ")}
                        </p>
                      ) : null}
                      {line.sku ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">Code: {line.sku}</p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        remove(line.productId, line.variantId, line.size, line.colour)
                      }
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                      aria-label={`Remove ${line.name} from bag`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>

                  {!available ? (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                      <AlertCircle className="size-3.5" aria-hidden="true" />
                      {server?.stockLabel ?? "Currently unavailable"} — will not be included in the
                      enquiry.
                    </p>
                  ) : priceChanged ? (
                    <p className="flex items-center gap-1.5 text-xs text-gold-strong">
                      <AlertCircle className="size-3.5" aria-hidden="true" />
                      Price updated from {formatPrice(line.unitPrice)} to {formatPrice(unitPrice)}.
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-lg border border-input">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-r-none"
                        onClick={() =>
                          setQuantity(
                            line.productId,
                            line.quantity - 1,
                            line.variantId,
                            line.size,
                            line.colour,
                          )
                        }
                        disabled={line.quantity <= 1}
                        aria-label={`Decrease quantity of ${line.name}`}
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </Button>
                      <span className="w-9 text-center text-sm tabular-nums" aria-live="polite">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-l-none"
                        onClick={() =>
                          setQuantity(
                            line.productId,
                            line.quantity + 1,
                            line.variantId,
                            line.size,
                            line.colour,
                          )
                        }
                        disabled={line.quantity >= MAX_LINE_QUANTITY}
                        aria-label={`Increase quantity of ${line.name}`}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {available ? formatPrice(unitPrice * line.quantity) : "—"}
                      </p>
                      {available ? (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(unitPrice)} each
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              clear();
              toast.success("Bag cleared");
            }}
            className="text-muted-foreground"
          >
            Clear bag
          </Button>
          {validating ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Checking prices and availability…
            </p>
          ) : null}
        </div>

        <label htmlFor="order-note" className="mt-6 block">
          <span className="eyebrow">Notes for us (optional)</span>
          <Textarea
            id="order-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Colour preferences, delivery city, or a gift message…"
            className="mt-2 border-input bg-background"
          />
        </label>
      </div>

      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="rounded-2xl border border-border bg-brand-paper p-6">
          <h2 className="font-display text-xl">Order summary</h2>
          <div className="gold-rule mt-3 h-px w-full" aria-hidden="true" />

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Items</dt>
              <dd>{lines.reduce((sum, l) => sum + l.quantity, 0)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Estimated subtotal</dt>
              <dd className="font-medium">{formatPrice(liveSubtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>
                {freeShippingThreshold && liveSubtotal >= freeShippingThreshold
                  ? "Free"
                  : "₹40"}
              </dd>
            </div>
          </dl>

          {remainingForFreeShipping ? (
            <p className="mt-4 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              Add {formatPrice(remainingForFreeShipping)} more to qualify for free delivery.
            </p>
          ) : null}

          {unavailableCount > 0 ? (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {unavailableCount} item{unavailableCount === 1 ? "" : "s"} cannot be enquired about
              and will be left out.
            </p>
          ) : null}

          <Link href="/checkout" passHref legacyBehavior>
            <Button
              type="button"
              size="lg"
              disabled={submitting || (!validating && enriched.every((item) => !item.available))}
              className="mt-5 h-12 w-full gap-2 text-base"
            >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Pay Securely
          </Button>
          </Link>

          {!whatsappConfigured ? (
            <p className="mt-3 text-xs text-destructive">
              WhatsApp ordering is not configured yet. Please contact us another way.
            </p>
          ) : null}

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Pay securely online with UPI, cards, net banking and more. Your order is confirmed
            once payment succeeds.
          </p>
        </div>
      </aside>
    </div>
  );
}
