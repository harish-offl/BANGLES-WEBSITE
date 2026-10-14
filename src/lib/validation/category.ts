import { z } from "zod";

import { slugSchema } from "./product";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: slugSchema,
  description: z.string().trim().max(600).nullable(),
  image_url: z.string().trim().max(1000).nullable(),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryInputSchema.partial();

export type CategoryInputValues = z.infer<typeof categoryInputSchema>;
export type CategoryUpdateValues = z.infer<typeof categoryUpdateSchema>;
