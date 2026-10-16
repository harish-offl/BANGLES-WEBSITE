import { z } from "zod";

import { referenceIdSchema } from "./product";

/**
 * The bag is sent to `/api/order-enquiry` as identifiers and quantities only.
 * Prices and names are re-resolved server-side so a tampered client can never
 * change what the enquiry says.
 */
export const enquiryItemSchema = z.object({
  productId: referenceIdSchema,
  variantId: referenceIdSchema.nullable().default(null),
  quantity: z.coerce.number().int().min(1).max(99),
  /** Selected bangle size, e.g. "2.10"; validated against the catalogue server-side. */
  size: z.string().trim().max(10).nullable().default(null),
  /** Selected colour option. */
  colour: z.string().trim().max(40).nullable().default(null),
});

export const enquirySchema = z.object({
  items: z.array(enquiryItemSchema).min(1, "Your bag is empty").max(50),
  note: z.string().trim().max(500).nullable().default(null),
});

export type EnquiryValues = z.infer<typeof enquirySchema>;
export type EnquiryItemValues = z.infer<typeof enquiryItemSchema>;
