"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import { saveSettingsAction } from "@/app/admin/actions";
import { initialActionState, type ActionState } from "@/lib/admin/action-state";
import { Field, FormMessage } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { StoreSettings } from "@/types";

interface SettingsFormProps {
  settings: StoreSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveSettingsAction,
    initialActionState,
  );
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <FormMessage state={state} />

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg">Store</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store name" htmlFor="store_name" error={errors.store_name} required>
            <Input id="store_name" name="store_name" defaultValue={settings.store_name} required />
          </Field>
          <Field
            label="Currency"
            htmlFor="currency"
            error={errors.currency}
            hint="Three-letter code, e.g. INR."
          >
            <Input id="currency" name="currency" defaultValue={settings.currency} maxLength={3} />
          </Field>
          <Field
            label="Location"
            htmlFor="location"
            error={errors.location}
            hint="Shown in the footer and contact page."
          >
            <Input id="location" name="location" defaultValue={settings.location ?? ""} />
          </Field>
          <Field
            label="Free delivery threshold (₹)"
            htmlFor="free_shipping_threshold"
            error={errors.free_shipping_threshold}
            hint="Blank disables the free-delivery nudge."
          >
            <Input
              id="free_shipping_threshold"
              name="free_shipping_threshold"
              type="number"
              min="0"
              step="1"
              defaultValue={settings.free_shipping_threshold ?? ""}
            />
          </Field>
          <Field
            label="Delivery fee inside Tamil Nadu (₹)"
            htmlFor="delivery_fee_tn"
            error={errors.delivery_fee_tn}
            hint="Charged when the address is inside Tamil Nadu."
          >
            <Input
              id="delivery_fee_tn"
              name="delivery_fee_tn"
              type="number"
              min="0"
              step="1"
              defaultValue={settings.delivery_fee_tn ?? ""}
            />
          </Field>
          <Field
            label="Delivery fee outside Tamil Nadu (₹)"
            htmlFor="delivery_fee_outside_tn"
            error={errors.delivery_fee_outside_tn}
            hint="Charged when the address is outside Tamil Nadu."
          >
            <Input
              id="delivery_fee_outside_tn"
              name="delivery_fee_outside_tn"
              type="number"
              min="0"
              step="1"
              defaultValue={settings.delivery_fee_outside_tn ?? ""}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="WhatsApp number"
            htmlFor="whatsapp_number"
            error={errors.whatsapp_number}
            hint="Digits with country code, e.g. 916381137076."
          >
            <Input
              id="whatsapp_number"
              name="whatsapp_number"
              defaultValue={settings.whatsapp_number ?? ""}
            />
          </Field>
          <Field
            label="Contact email"
            htmlFor="contact_email"
            error={errors.contact_email}
            hint="Leave blank if you have not published one."
          >
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={settings.contact_email ?? ""}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg">Social links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook URL" htmlFor="facebook_url" error={errors.facebook_url}>
            <Input id="facebook_url" name="facebook_url" defaultValue={settings.facebook_url ?? ""} />
          </Field>
          <Field label="Instagram URL" htmlFor="instagram_url" error={errors.instagram_url}>
            <Input
              id="instagram_url"
              name="instagram_url"
              defaultValue={settings.instagram_url ?? ""}
            />
          </Field>
          <Field label="YouTube URL" htmlFor="youtube_url" error={errors.youtube_url}>
            <Input id="youtube_url" name="youtube_url" defaultValue={settings.youtube_url ?? ""} />
          </Field>
          <Field label="Pinterest URL" htmlFor="pinterest_url" error={errors.pinterest_url}>
            <Input
              id="pinterest_url"
              name="pinterest_url"
              defaultValue={settings.pinterest_url ?? ""}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg">Storefront copy</h2>
        <Field label="Announcement bar" htmlFor="announcement" error={errors.announcement}>
          <Input id="announcement" name="announcement" defaultValue={settings.announcement ?? ""} />
        </Field>
        <Field label="Shipping note" htmlFor="shipping_info" error={errors.shipping_info}>
          <Textarea
            id="shipping_info"
            name="shipping_info"
            defaultValue={settings.shipping_info ?? ""}
            rows={2}
          />
        </Field>
        <Field label="Footer note" htmlFor="footer_note" error={errors.footer_note}>
          <Textarea
            id="footer_note"
            name="footer_note"
            defaultValue={settings.footer_note ?? ""}
            rows={2}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg">SEO defaults</h2>
        <Field
          label="Title template"
          htmlFor="seo_title_template"
          error={errors.seo_title_template}
          hint="Use %s for the page title, e.g. %s · Bangles by Beauty."
        >
          <Input
            id="seo_title_template"
            name="seo_title_template"
            defaultValue={settings.seo_title_template ?? ""}
          />
        </Field>
        <Field
          label="Default description"
          htmlFor="seo_default_description"
          error={errors.seo_default_description}
        >
          <Textarea
            id="seo_default_description"
            name="seo_default_description"
            defaultValue={settings.seo_default_description ?? ""}
            rows={3}
          />
        </Field>
      </section>

      <Button type="submit" size="lg" disabled={pending} className="h-11 gap-2 text-base">
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="size-4" aria-hidden="true" />
        )}
        Save settings
      </Button>
    </form>
  );
}
