import { z } from "zod";

/** Slugs are used in public URLs, so keep them lowercase and URL-safe. */
export const slugSchema = z
  .string()
  .trim()
  .min(1, "A slug is required")
  .max(90, "Keep slugs under 90 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and hyphens only",
  );

export const colourSchema = z.string().trim().min(1).max(40);

/**
 * Foreign keys are opaque strings rather than strict UUIDs because the local
 * development driver mints `local-*` identifiers. Supabase rows are UUIDs, so
 * this stays valid either way; the value is always re-checked against the
 * database before use.
 */
export const referenceIdSchema = z.string().trim().min(1).max(80);

/**
 * Catalogue payload used by the admin product forms and the API routes that
 * back them. Values arrive from a form as strings, hence `z.coerce`.
 */
export const productInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(160),
    slug: slugSchema,
    description: z.string().trim().min(1, "Description is required").max(4000),
    sku: z.string().trim().max(40).nullable(),
    price: z.coerce.number().min(0, "Price cannot be negative").max(10_000_000),
    compare_at_price: z.coerce.number().min(0).max(10_000_000).nullable(),
    stock_quantity: z.coerce.number().int().min(0).max(1_000_000).nullable(),
    category_id: referenceIdSchema.nullable(),
    primary_image_url: z.string().trim().max(1000).nullable(),
    colours: z.array(colourSchema).max(20).default([]),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    is_new_arrival: z.boolean().default(false),
    seo_title: z.string().trim().max(70).nullable(),
    seo_description: z.string().trim().max(180).nullable(),
  })
  .refine(
    (value) => value.compare_at_price === null || value.compare_at_price > value.price,
    {
      message: "A was-price must be higher than the selling price",
      path: ["compare_at_price"],
    },
  );

export const productUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    slug: slugSchema.optional(),
    description: z.string().trim().min(1).max(4000).optional(),
    sku: z.string().trim().max(40).nullable().optional(),
    price: z.coerce.number().min(0).max(10_000_000).optional(),
    compare_at_price: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
    stock_quantity: z.coerce.number().int().min(0).max(1_000_000).nullable().optional(),
    category_id: referenceIdSchema.nullable().optional(),
    primary_image_url: z.string().trim().max(1000).nullable().optional(),
    colours: z.array(colourSchema).max(20).optional(),
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    is_new_arrival: z.boolean().optional(),
    seo_title: z.string().trim().max(70).nullable().optional(),
    seo_description: z.string().trim().max(180).nullable().optional(),
  })
  .refine(
    (value) =>
      value.compare_at_price == null ||
      value.price == null ||
      value.compare_at_price > value.price,
    {
      message: "A was-price must be higher than the selling price",
      path: ["compare_at_price"],
    },
  );

export type ProductInputValues = z.infer<typeof productInputSchema>;
export type ProductUpdateValues = z.infer<typeof productUpdateSchema>;
