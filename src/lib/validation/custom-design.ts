import { z } from "zod";

/** Standard Indian bangle sizes (inches) offered for custom orders. */
export const CUSTOM_SIZES = ["2.2", "2.4", "2.6", "2.8"] as const;
export type CustomSize = (typeof CUSTOM_SIZES)[number];

const sizeSchema = z.custom<CustomSize>(
  (value) => typeof value === "string" && (CUSTOM_SIZES as readonly string[]).includes(value),
  { message: "Please choose a bangle size." },
);

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(200)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address.");

const mobileSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid mobile number.")
  .max(20)
  .regex(/^[+()\-\s0-9]{7,20}$/, "Enter a valid mobile number.");

/**
 * Customer-supplied custom design brief. Submitted from the `/customize` page
 * and turned into a WhatsApp enquiry — nothing is charged or reserved online.
 */
export const customDesignSchema = z.object({
  size: sizeSchema,
  colours: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
  customColour: z.string().trim().max(30).nullable().default(null),
  comments: z.string().trim().max(1000).nullable().default(null),
  mobile: mobileSchema,
  address: z.string().trim().min(1, "Address is required.").max(500),
  email: emailSchema,
  imageName: z.string().trim().max(200).nullable().default(null),
});

export type CustomDesignValues = z.infer<typeof customDesignSchema>;
