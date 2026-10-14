import { formatPrice } from "@/lib/site";

/**
 * WhatsApp helpers with no server dependency, so both the server (order
 * enquiry route) and client components (floating chat button, footer) can
 * build consistent links.
 */

export interface WhatsAppCartItem {
  name: string;
  quantity: number;
  unitPrice: number;
  variantLabel?: string | null;
  sku?: string | null;
  slug?: string;
  url?: string | null;
}

export interface WhatsAppMessageInput {
  storeName: string;
  items: WhatsAppCartItem[];
  siteUrl: string;
  /** Optional note appended after the line items, e.g. a delivery request. */
  closing?: string;
}

export const DEFAULT_CLOSING = "Please confirm availability and delivery details.";

/** Normalises Indian mobile numbers to WhatsApp international form. */
export function normaliseWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  // Drop a leading country-code duplicate (e.g. "0091..." -> "91...")
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Assume Indian numbers given the business location when no country code is present.
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

/** Digits-only international number, or `null` when nothing valid is stored. */
export function whatsappDigits(raw: string | null | undefined): string | null {
  return normaliseWhatsAppNumber(raw);
}

/**
 * Builds the human-readable enquiry message. It deliberately says "enquire"
 * and asks the store to confirm — a WhatsApp click hands the bag over for
 * confirmation, it does not place or pay for an order.
 */
export function buildWhatsAppMessage(input: WhatsAppMessageInput): string {
  const { storeName, items, siteUrl, closing = DEFAULT_CLOSING } = input;

  const lines: string[] = [];
  lines.push(`Hello ${storeName},`);
  lines.push("");
  lines.push("I would like to enquire about the following products:");
  lines.push("");

  let total = 0;
  let index = 0;

  for (const item of items) {
    index += 1;
    const subtotal = item.unitPrice * item.quantity;
    total += subtotal;

    lines.push(`${index}. ${item.name}`);
    if (item.variantLabel) lines.push(`   Variant: ${item.variantLabel}`);
    if (item.sku) lines.push(`   Code: ${item.sku}`);
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(`   Unit price: ${formatPrice(item.unitPrice)}`);
    lines.push(`   Subtotal: ${formatPrice(subtotal)}`);
    if (item.url) lines.push(`   Link: ${item.url}`);
    lines.push("");
  }

  lines.push(`Estimated order total: ${formatPrice(total)}`);
  lines.push("");
  lines.push(closing);
  lines.push("");
  lines.push(`— sent from ${siteUrl}`);

  return lines.join("\n");
}

/**
 * Produces a WhatsApp click-to-chat URL. The message is fully encoded with
 * `encodeURIComponent`, and the number is international with no spaces.
 * Returns `null` when no number is configured so callers can disable the
 * action instead of shipping a broken contact link.
 */
export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message: string,
): string | null {
  const normalised = normaliseWhatsAppNumber(phone);
  if (!normalised) return null;
  return `https://wa.me/${normalised}?text=${encodeURIComponent(message)}`;
}
