"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";

import { saveProductAction } from "@/app/admin/actions";
import { initialActionState, type ActionState } from "@/lib/admin/action-state";
import { CheckboxRow, Field, FormMessage } from "@/components/admin/ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types";

interface ProductFormProps {
  categories: Category[];
  product?: Product | null;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveProductAction,
    initialActionState,
  );
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const isEdit = Boolean(product);

  return (
    <form action={formAction} className="space-y-8">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <FormMessage state={state} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg">Details</h2>

            <Field label="Name" htmlFor="name" error={errors.name} required>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name ?? ""}
                required
                maxLength={160}
                placeholder="Golden square kundan bangles"
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="slug"
              error={errors.slug}
              required
              hint="Lowercase, hyphen-separated. Used in the product URL."
            >
              <Input
                id="slug"
                name="slug"
                defaultValue={product?.slug ?? ""}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Lowercase letters, numbers and hyphens only"
                placeholder="golden-square-kundan-bangles"
              />
            </Field>

            <Field label="Description" htmlFor="description" error={errors.description} required>
              <Textarea
                id="description"
                name="description"
                defaultValue={product?.description ?? ""}
                required
                rows={5}
                maxLength={4000}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SKU" htmlFor="sku" error={errors.sku} hint="Optional product code.">
                <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} maxLength={40} />
              </Field>
              <Field label="Category" htmlFor="category_id" error={errors.category_id}>
                <select
                  id="category_id"
                  name="category_id"
                  defaultValue={product?.category_id ?? ""}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <option value="">Uncategorised</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                      {category.is_active ? "" : " (hidden)"}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              label="Colours"
              htmlFor="colours"
              error={errors.colours}
              hint="Comma-separated, e.g. Red, Gold, Green. Used by the shop colour filter."
            >
              <Input
                id="colours"
                name="colours"
                defaultValue={(product?.colours ?? []).join(", ")}
                placeholder="Red, Gold"
              />
            </Field>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg">Pricing &amp; stock</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price (₹)" htmlFor="price" error={errors.price} required>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={product?.price ?? ""}
                  required
                />
              </Field>
              <Field
                label="Was-price (₹)"
                htmlFor="compare_at_price"
                error={errors.compare_at_price}
                hint="Leave blank if not discounted."
              >
                <Input
                  id="compare_at_price"
                  name="compare_at_price"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={product?.compare_at_price ?? ""}
                />
              </Field>
              <Field
                label="Stock"
                htmlFor="stock_quantity"
                error={errors.stock_quantity}
                hint="Blank = made to order."
              >
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={product?.stock_quantity ?? ""}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg">Search engine listing</h2>
            <Field
              label="SEO title"
              htmlFor="seo_title"
              error={errors.seo_title}
              hint="Up to 70 characters. Falls back to the product name."
            >
              <Input
                id="seo_title"
                name="seo_title"
                defaultValue={product?.seo_title ?? ""}
                maxLength={70}
              />
            </Field>
            <Field
              label="SEO description"
              htmlFor="seo_description"
              error={errors.seo_description}
              hint="Up to 180 characters."
            >
              <Textarea
                id="seo_description"
                name="seo_description"
                defaultValue={product?.seo_description ?? ""}
                maxLength={180}
                rows={3}
              />
            </Field>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <section className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg">Visibility</h2>
            <div className="space-y-2">
              <CheckboxRow
                id="is_active"
                name="is_active"
                label="Active"
                hint="Visible in the storefront."
                defaultChecked={product ? product.is_active : true}
              />
              <CheckboxRow
                id="is_featured"
                name="is_featured"
                label="Featured"
                hint="Shown in the home page featured rail."
                defaultChecked={product?.is_featured ?? false}
              />
              <CheckboxRow
                id="is_new_arrival"
                name="is_new_arrival"
                label="New arrival"
                hint="Shown in the new arrivals rail."
                defaultChecked={product?.is_new_arrival ?? false}
              />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg">Image</h2>
            <Field
              label="Image URL"
              htmlFor="primary_image_url"
              error={errors.primary_image_url}
              hint="Paste a URL, or upload a file below."
            >
              <Input
                id="primary_image_url"
                name="primary_image_url"
                defaultValue={product?.primary_image_url ?? ""}
                placeholder="/images/products/example.jpg"
              />
            </Field>
            <Field label="Upload image" htmlFor="image_file" hint="JPG, PNG, WebP or AVIF up to 5 MB.">
              <input
                id="image_file"
                name="image_file"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:text-foreground"
              />
            </Field>
            {product?.primary_image_url ? (
              <p className="text-xs text-muted-foreground">
                Current:{" "}
                <span className="break-all text-foreground">{product.primary_image_url}</span>
              </p>
            ) : null}
          </section>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" disabled={pending} className="h-11 gap-2 text-base">
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {isEdit ? "Save changes" : "Create product"}
            </Button>
            <Link
              href="/admin/products"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 justify-center text-base")}
            >
              Cancel
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
