import { z } from "zod";

/** Star ratings are whole numbers from 1 to 5. */
export const REVIEW_RATINGS = [1, 2, 3, 4, 5] as const;

/**
 * Customer review submitted from the home page. Turned into a WhatsApp
 * message for the store owner — nothing is published automatically.
 */
export const reviewSchema = z.object({
  rating: z
    .number({ message: "Please choose a rating." })
    .int()
    .min(1, "Please choose a rating.")
    .max(5, "Please choose a rating."),
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  mobile: z
    .string()
    .trim()
    .min(7, "Enter a valid mobile number.")
    .max(20)
    .regex(/^[+()\-\s0-9]{7,20}$/, "Enter a valid mobile number."),
  review: z.string().trim().min(1, "Please share your experience.").max(1000),
  imageName: z.string().trim().max(200).nullable().default(null),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
