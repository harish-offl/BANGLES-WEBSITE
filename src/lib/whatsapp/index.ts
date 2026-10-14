import "server-only";

import { LEGACY_FACTS } from "@/lib/site";

import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  type WhatsAppMessageInput,
} from "./shared";

export * from "./shared";

/** Server-side helper used by route handlers that respond with a ready link. */
export function buildOrderEnquiryUrl(
  input: WhatsAppMessageInput & { whatsappNumber?: string | null },
): string | null {
  const message = buildWhatsAppMessage(input);
  return buildWhatsAppUrl(input.whatsappNumber ?? LEGACY_FACTS.whatsappNumber, message);
}
