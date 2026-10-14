import { z } from "zod";

/**
 * Store settings are edited field-by-field in the admin panel. Every field is
 * optional so a partial save never wipes unrelated values.
 */
export const settingsUpdateSchema = z.object({
  store_name: z.string().trim().min(1).max(120).optional(),
  whatsapp_number: z.string().trim().max(20).nullable().optional(),
  contact_email: z.email("Enter a valid email address").nullable().optional(),
  currency: z.string().trim().length(3).optional(),
  announcement: z.string().trim().max(280).nullable().optional(),
  shipping_info: z.string().trim().max(600).nullable().optional(),
  footer_note: z.string().trim().max(280).nullable().optional(),
  facebook_url: z.url("Enter a full URL").nullable().optional(),
  instagram_url: z.url("Enter a full URL").nullable().optional(),
  youtube_url: z.url("Enter a full URL").nullable().optional(),
  pinterest_url: z.url("Enter a full URL").nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  seo_title_template: z.string().trim().max(120).nullable().optional(),
  seo_default_description: z.string().trim().max(300).nullable().optional(),
  free_shipping_threshold: z.coerce.number().min(0).max(1_000_000).nullable().optional(),
});

export type SettingsUpdateValues = z.infer<typeof settingsUpdateSchema>;
