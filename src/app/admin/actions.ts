"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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
import type { OrderStatus, Product, Paginated, ProductFilters } from "@/types";

const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "delivery_failed",
  "return_requested",
  "return_approved",
  "return_rejected",
  "refund_initiated",
  "refunded",
  "payment_pending",
  "payment_failed",
  "stock_unavailable",
  "returned",
];

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

function revalidateInventory(productId: string): void {
  revalidateTag("products", { expire: 0 });
  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidateStorefront();
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
      const created = await catalog.createProduct(parsed.data);
      id = created.id;
    }

    // Handle variants: delete all existing and recreate from form data
    const variantsJson = optionalString(formData.get("variants_json"));
    if (id && variantsJson) {
      try {
        const variants = JSON.parse(variantsJson) as Array<{
          id?: string;
          variant_name: string;
          variant_value: string;
          stock_quantity: number;
          price_override?: number | null;
          is_active?: boolean;
        }>;

        // Delete existing variants
        await catalog.deleteProductVariants(id);

        // Create new variants
        for (const v of variants) {
          await catalog.createVariant(id, {
            variant_name: v.variant_name,
            variant_value: v.variant_value,
            stock_quantity: v.stock_quantity ?? 0,
            price_override: v.price_override ?? null,
            is_active: v.is_active ?? true,
          });
        }
      } catch (err) {
        console.error("Failed to save variants:", err);
        // Don't fail the whole product save if variants fail
      }
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
    let savedCategory: { id: string } | null = null;
    if (id) {
      await catalog.updateCategory(id, parsed.data);
      savedCategory = { id };
    } else {
      const created = await catalog.createCategory(parsed.data);
      savedCategory = { id: created.id };
    }

    // Save product assignments for this category (new or existing)
    if (savedCategory) {
      const productIdsParam = optionalString(formData.get("category_product_ids"));
      const productIds = productIdsParam
        ? productIdsParam.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      await catalog.replaceCategoryProducts(savedCategory.id, productIds);
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
  try {
    await getCatalog().deleteCategory(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete the category.";
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }
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

export async function getCategoryAssignmentProducts(categoryId: string): Promise<Product[]> {
  await requireAdminAccess();
  const catalog = getCatalog();
  const productIds = await catalog.getCategoryProductIds(categoryId);
  if (!productIds.length) return [];
  return catalog.getProductsByIds(productIds);
}

export async function searchAssignableProducts({
  q,
  page,
  pageSize,
  sort,
}: {
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: ProductFilters["sort"];
}): Promise<Paginated<Product>> {
  await requireAdminAccess();
  const catalog = getCatalog();
  return catalog.listProducts({
    q,
    page: page ?? 1,
    pageSize: pageSize ?? 24,
    sort: sort ?? "newest",
    include_inactive: true,
  });
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdminAccess();
  const id = optionalString(formData.get("id"));
  const status = optionalString(formData.get("status")) as OrderStatus | null;
  if (!id || !status || !ORDER_STATUSES.includes(status)) return;
  try {
    await getCatalog().updateOrderStatus(id, status);
  } catch {
    redirect("/admin/orders?error=1");
  }
  redirect("/admin/orders?saved=1");
}

/**
 * Full lifecycle status update with transition validation, audit trail and
 * customer notification. Used by the enhanced admin order management UI.
 *
 * On success the caller is redirected back to the admin orders page with a
 * `saved=1` query param. On an invalid transition or server error the caller
 * is redirected back with an `error` message instead.
 */
export async function updateOrderLifecycleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let orderId: string | null = null;
  try {
    const access = await requireAdminAccess();
    const catalog = getCatalog();

    orderId = optionalString(formData.get("orderId"));
    if (!orderId) {
      return { status: "error", message: "Missing order ID." };
    }

    const order = await catalog.getOrderById(orderId);
    if (!order) {
      return { status: "error", message: "Order not found." };
    }

    const deliveryStage = optionalString(formData.get("deliveryStage")) || undefined;
    const courierPartner = optionalString(formData.get("courierPartner")) || undefined;
    const trackingId = optionalString(formData.get("trackingId")) || undefined;

    await catalog.updateOrderLifecycle({
      orderId: order.id,
      deliveryStage,
      courierPartner,
      trackingId,
      updatedBy: access.identity?.userId ?? "local-admin",
    });

    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
    revalidatePath("/order/[id]");

    return { status: "success", message: "Order tracking updated." };
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return { status: "error", message: error.message };
    }
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not update the order status.",
    };
  }
}

/**
 * Server action to update stock for a product variant (size).
 * Called from the admin inventory management page.
 */
export async function updateVariantStockAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminAccess();
    const catalog = getCatalog();

    const productId = optionalString(formData.get("productId"));
    if (!productId) {
      return { status: "error", message: "Missing product ID." };
    }

    // Collect all variant stock updates from the form
    const updates: { variantId: string; stockQuantity: number }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("variant_") && value !== null) {
        const variantId = key.replace("variant_", "");
        const stockQuantity = Number(value);
        if (Number.isInteger(stockQuantity) && stockQuantity >= 0) {
          updates.push({ variantId, stockQuantity });
        }
      }
    }

    if (updates.length === 0) {
      return { status: "error", message: "No stock changes to save." };
    }

    // Apply each update sequentially
    for (const update of updates) {
      await catalog.updateVariantStock(update.variantId, update.stockQuantity);
    }

    revalidateInventory(productId);

    return { status: "success", message: "Stock updated." };
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return { status: "error", message: error.message };
    }
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not update stock.",
    };
  }
}

export async function addProductVariantAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminAccess();
    const catalog = getCatalog();

    const productId = optionalString(formData.get("productId"));
    if (!productId) {
      return { status: "error", message: "Missing product ID." };
    }

    const product = await catalog.getProductById(productId);
    if (!product) {
      return { status: "error", message: "Product not found." };
    }

    const size = optionalString(formData.get("size"));
    if (!size) {
      return {
        status: "error",
        message: "Enter a size.",
        fieldErrors: { size: "Size is required." },
      };
    }
    if (size.length > 50) {
      return {
        status: "error",
        message: "Size must be 50 characters or fewer.",
        fieldErrors: { size: "Size must be 50 characters or fewer." },
      };
    }

    const stockValue = optionalString(formData.get("stock"));
    const stockQuantity = stockValue === null ? 0 : Number(stockValue);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return {
        status: "error",
        message: "Stock must be a non-negative whole number.",
        fieldErrors: { stock: "Enter a whole number of 0 or more." },
      };
    }

    const variantSku = optionalString(formData.get("sku"));

    const existing = await catalog.getProductVariants(productId);
    const duplicate = existing.some(
      (variant) =>
        variant.variant_value.trim().toLowerCase() === size.toLowerCase(),
    );
    if (duplicate) {
      return {
        status: "error",
        message: `Size ${size} already exists for this product. Update its stock below.`,
        fieldErrors: { size: "This size already exists." },
      };
    }

    await catalog.createVariant(productId, {
      variant_name: "Size",
      variant_value: size,
      sku: variantSku,
      stock_quantity: stockQuantity,
      price_override: null,
      is_active: true,
    });

    revalidateInventory(productId);

    return { status: "success", message: `Size ${size} added with stock ${stockQuantity}.` };
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return { status: "error", message: error.message };
    }
    const message =
      error instanceof Error ? error.message : "Could not add the size.";
    if (/duplicate|unique/i.test(message)) {
      return {
        status: "error",
        message: "That size already exists for this product.",
        fieldErrors: { size: "This size already exists." },
      };
    }
    return { status: "error", message };
  }
}

export async function addProductVariantsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminAccess();
    const catalog = getCatalog();

    const productId = optionalString(formData.get("productId"));
    if (!productId) {
      return { status: "error", message: "Missing product ID." };
    }

    const product = await catalog.getProductById(productId);
    if (!product) {
      return { status: "error", message: "Product not found." };
    }

    const sizes = formData.getAll("size");
    const stocks = formData.getAll("stock");
    const skus = formData.getAll("sku");

    if (sizes.length === 0) {
      return { status: "error", message: "Add at least one size." };
    }

    const fieldErrors: Record<string, string> = {};
    const seen = new Set<string>();
    const rows: { size: string; stockQuantity: number; sku: string | null }[] = [];

    for (let index = 0; index < sizes.length; index += 1) {
      const size = String(sizes[index] ?? "").trim();
      if (!size) {
        fieldErrors[`size_${index}`] = "Size is required.";
        continue;
      }
      if (size.length > 50) {
        fieldErrors[`size_${index}`] = "Size must be 50 characters or fewer.";
        continue;
      }

      const key = size.toLowerCase();
      if (seen.has(key)) {
        fieldErrors[`size_${index}`] = "This size is listed more than once.";
        continue;
      }
      seen.add(key);

      const stockRaw = String(stocks[index] ?? "").trim();
      const stockQuantity = stockRaw === "" ? 0 : Number(stockRaw);
      if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
        fieldErrors[`stock_${index}`] = "Enter a whole number of 0 or more.";
        continue;
      }

      const skuRaw = String(skus[index] ?? "").trim();
      rows.push({
        size,
        stockQuantity,
        sku: skuRaw.length ? skuRaw : null,
      });
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "error",
        message: "Please correct the highlighted sizes.",
        fieldErrors,
      };
    }

    const existing = await catalog.getProductVariants(productId);
    const existingSizes = new Set(
      existing.map((variant) => variant.variant_value.trim().toLowerCase()),
    );
    const duplicateSizes = rows
      .filter((row) => existingSizes.has(row.size.toLowerCase()))
      .map((row) => row.size);

    if (duplicateSizes.length > 0) {
      return {
        status: "error",
        message: `${duplicateSizes.join(", ")} already ${
          duplicateSizes.length === 1 ? "exists" : "exist"
        } for this product. Update the existing stock instead.`,
      };
    }

    for (const row of rows) {
      await catalog.createVariant(productId, {
        variant_name: "Size",
        variant_value: row.size,
        sku: row.sku,
        stock_quantity: row.stockQuantity,
        price_override: null,
        is_active: true,
      });
    }

    revalidateInventory(productId);

    return {
      status: "success",
      message: `Added ${rows.length} size${rows.length === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return { status: "error", message: error.message };
    }
    const message =
      error instanceof Error ? error.message : "Could not add the sizes.";
    if (/duplicate|unique/i.test(message)) {
      return {
        status: "error",
        message: "One of these sizes already exists for this product.",
      };
    }
    return { status: "error", message };
  }
}

export async function deleteProductVariantAction(formData: FormData): Promise<void> {
  await requireAdminAccess();
  const catalog = getCatalog();
  const productId = optionalString(formData.get("productId"));
  const variantId = optionalString(formData.get("variantId"));

  if (!productId || !variantId) {
    redirect("/admin/inventory");
  }

  const product = await catalog.getProductById(productId);
  const belongsToProduct = product?.variants?.some(
    (variant) => variant.id === variantId,
  );
  if (!belongsToProduct) {
    redirect(`/admin/inventory/${productId}?error=1`);
  }

  await catalog.deleteVariant(variantId);
  revalidateInventory(productId);
  redirect(`/admin/inventory/${productId}?deleted=1`);
}
