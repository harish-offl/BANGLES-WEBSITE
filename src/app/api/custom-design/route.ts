import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/api/rate-limit";
import { getCatalog } from "@/lib/data";
import { getServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/service-role";
import { SITE_URL } from "@/lib/site";
import { customDesignSchema } from "@/lib/validation/custom-design";
import { buildCustomDesignMessage, buildWhatsAppUrl } from "@/lib/whatsapp/shared";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Mirrors the `product-images` bucket's allowed types in 0006_storage.sql. */
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function optionalString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalStrings(values: FormDataEntryValue[]): string[] {
  return values.filter((value): value is string => typeof value === "string");
}

/**
 * Accepts the custom-design brief as multipart form data, stores the reference
 * photo in Supabase Storage, and returns a click-to-chat link for the store's
 * configured WhatsApp number. The number is always resolved on the server from
 * store settings — the client cannot redirect the enquiry elsewhere — and the
 * photo travels as a hosted link inside the message body.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`custom-design:${clientKey(request)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const parsed = customDesignSchema.safeParse({
    size: optionalString(formData.get("size")),
    colours: optionalStrings(formData.getAll("colours")),
    comments: optionalString(formData.get("comments")),
    mobile: optionalString(formData.get("mobile")) ?? "",
    address: optionalString(formData.get("address")) ?? "",
    email: optionalString(formData.get("email")) ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const imageFile = formData.get("design_image");
  let imageUrl: string | null = null;
  let imageName: string | null = null;

  if (imageFile instanceof File && imageFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG, WebP or AVIF image." },
        { status: 400 },
      );
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Design photos must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    imageName = imageFile.name || "design-reference.jpg";

    if (isServiceRoleConfigured()) {
      try {
        const supabase = getServiceRoleClient();
        const safeName = imageName.replace(/[^\w.-]+/g, "-").toLowerCase();
        const path = `custom-designs/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from("product-images").upload(path, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });
        if (!error) {
          const { data } = supabase.storage.from("product-images").getPublicUrl(path);
          imageUrl = data.publicUrl;
        }
      } catch {
        // Fall through: the message still goes out, noting the photo must be attached.
      }
    }
  }

  const settings = await getCatalog().getSettings();

  const message = buildCustomDesignMessage({
    storeName: settings.store_name,
    siteUrl: SITE_URL,
    size: parsed.data.size,
    colours: parsed.data.colours,
    customColour: parsed.data.customColour,
    comments: parsed.data.comments,
    mobile: parsed.data.mobile,
    address: parsed.data.address,
    email: parsed.data.email,
    imageUrl,
    imageName: imageUrl ? null : imageName,
  });

  const url = buildWhatsAppUrl(settings.whatsapp_number, message);
  if (!url) {
    return NextResponse.json(
      { error: "WhatsApp ordering is not configured yet. Please contact us another way." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { url, imageSent: Boolean(imageUrl) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
