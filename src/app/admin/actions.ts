"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  AdminAccessError,
  requireAdminAccess,
} from "@/lib/admin/access";
import { getCatalog } from "@/lib/data";
import { getServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/service-role";
import {
  categoryInputSchema,
  productInputSchema,
  settingsUpdateSchema,
} from "@/lib/validation";
import type { ActionState } from "@/lib/admin/action-state";

function fieldErrorsFrom(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function revalidateStorefront(): void {
  revalidatePath("/", "layout");
}

/** Converts an empty form value into `null` so optional numeric/string fields clear. */
function optionalString(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  const text = optionalString(value);
  if (text === null) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseColours(value: FormDataEntryValue | null): string[] {
  const text = optionalString(value);
  if (!text) return [];
  return [...new Set(text.split(",").map((c) => c.trim()).filter(Boolean))];
}

async function resolveImageUrl(
  formData: FormData,
  fallback: string | null,
): Promise<{ url: string | null } | { error: string }> {
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    if (!isServiceRoleConfigured()) {
      return {
        error:
          "Image upload needs Supabase Storage. Configure SUPABASE_SERVICE_ROLE_KEY, or paste an image URL instead.",
      };
    }
    if (!file.type.startsWith("image/")) {
      return { error: "The uploaded file must be an image." };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: "Images must be 5 MB or smaller." };
    }
    try {
      const supabase = getServiceRoleClient();
      const safeName = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
      const path = `uploads/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) return { error: `Upload failed: ${error.message}` };
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      return { url: data.publicUrl };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Upload failed." };
    }
  }
  return { url: optionalString(formData.get("primary_image_url")) ?? fallback };
}

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let id: string | null = null;
  try {
    await requireAdminAccess();

    id = optionalString(formData.get("id"));
    const existing = id ? await getCatalog().getProductById(id) : null;

    const image = await resolveImageUrl(formData, existing?.primary_image_url ?? null);
    if ("error" in image) {
      return { status: "error", message: image.error, fieldErrors: { primary_image_url: image.error } };
    }

    const raw = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      sku: optionalString(formData.get("sku")),
      price: formData.get("price"),
      compare_at_price: optionalNumber(formData.get("compare_at_price")),
      stock_quantity: optionalNumber(formData.get("stock_quantity")),
      category_id: optionalString(formData.get("category_id")),
      primary_image_url: image.url,
      colours: parseColours(formData.get("colours")),
      is_active: formData.get("is_active") === "on",
      is_featured: formData.get("is_featured") === "on",
      is_new_arrival: formData.get("is_new_arrival") === "on",
      seo_title: optionalString(formData.get("seo_title")),
      seo_description: optionalString(formData.get("seo_description")),
    };

    const parsed = productInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        status: "error",
        message: "Please correct the highlighted fields.",
        fieldErrors: fieldErrorsFrom(parsed.error),
      };
    }

    const catalog = getCatalog();
    if (id) {
      await catalog.updateProduct(id, parsed.data);
    } else {
      await catalog.createProduct(parsed.data);
    }

    revalidateStorefront();
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return { status: "error", message: error.message };
    }
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not save the product.",
    };
  }

  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdminAccess();
  const id = optionalString(formData.get("id"));
  if (!id) return;
  await getCatalog().deleteProduct(id);
  revalidateStorefront();
  redirect("/admin/products?deleted=1");
}

export async function saveCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let id: string | null = null;
  try {
    await requireAdminAccess();
    id = optionalString(formData.get("id"));

    const raw = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: optionalString(formData.get("description")),
      image_url: optionalString(formData.get("image_url")),
      sort_order: formData.get("sort_order") ?? 0,
      is_active: formData.get("is_active") === "on",
    };

    const parsed = categoryInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        status: "error",
        message: "Please correct the highlighted fields.",
        fieldErrors: fieldErrorsFrom(parsed.error),
      };
    }

    const catalog = getCatalog();
    if (id) {
      await catalog.updateCategory(id, parsed.data);
    } else {
      await catalog.createCategory(parsed.data);
    }

    revalidateStorefront();
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return { status: "error", message: error.message };
    }
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not save the category.",
    };
  }

  redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdminAccess();
  const id = optionalString(formData.get("id"));
  if (!id) return;
  await getCatalog().deleteCategory(id);
  revalidateStorefront();
  redirect("/admin/categories?deleted=1");
}

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminAccess();

    const raw = {
      store_name: formData.get("store_name") ?? undefined,
      whatsapp_number: optionalString(formData.get("whatsapp_number")),
      contact_email: optionalString(formData.get("contact_email")),
      currency: optionalString(formData.get("currency")) ?? "INR",
      announcement: optionalString(formData.get("announcement")),
      shipping_info: optionalString(formData.get("shipping_info")),
      footer_note: optionalString(formData.get("footer_note")),
      facebook_url: optionalString(formData.get("facebook_url")),
      instagram_url: optionalString(formData.get("instagram_url")),
      youtube_url: optionalString(formData.get("youtube_url")),
      pinterest_url: optionalString(formData.get("pinterest_url")),
      location: optionalString(formData.get("location")),
      seo_title_template: optionalString(formData.get("seo_title_template")),
      seo_default_description: optionalString(formData.get("seo_default_description")),
      free_shipping_threshold: optionalNumber(formData.get("free_shipping_threshold")),
    };

    const parsed = settingsUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        status: "error",
        message: "Please correct the highlighted fields.",
        fieldErrors: fieldErrorsFrom(parsed.error),
      };
    }

    await getCatalog().updateSettings(parsed.data);
    revalidateStorefront();

    return { status: "success", message: "Settings saved." };
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return { status: "error", message: error.message };
    }
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not save settings.",
    };
  }
}
