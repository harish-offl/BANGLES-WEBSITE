"use client";

import { useRef, useState, type FormEvent } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";

import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildReviewMessage, buildWhatsAppUrl } from "@/lib/whatsapp/shared";
import { reviewSchema } from "@/lib/validation/review";
import { cn } from "@/lib/utils";

interface ReviewSectionProps {
  storeName: string;
  whatsappNumber: string | null;
  siteUrl: string;
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

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

/**
 * "Share Your Experience" block. Collects a star rating, name, mobile number,
 * written review and an optional photo, then hands the review to WhatsApp for
 * the owner to publish — matching the store's WhatsApp-first flow.
 */
export function ReviewSection({ storeName, whatsappNumber, siteUrl }: ReviewSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [review, setReview] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleFile(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = reviewSchema.safeParse({
      rating,
      name,
      mobile,
      review,
      imageName: imageFile?.name ?? null,
    });

    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error));
      toast.error("Please check the highlighted fields.");
      return;
    }

    const url = buildWhatsAppUrl(
      whatsappNumber,
      buildReviewMessage({
        storeName,
        siteUrl,
        rating: parsed.data.rating,
        name: parsed.data.name,
        mobile: parsed.data.mobile,
        review: parsed.data.review,
        imageName: parsed.data.imageName,
      }),
    );

    if (!url) {
      toast.error("Reviews are not configured yet. Please contact us another way.");
      return;
    }

    setErrors({});
    setSubmitting(true);
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp with your review.");
    setSubmitting(false);
  }

  const activeRating = hoverRating || rating;

  return (
    <section id="review" className="scroll-mt-24 border-y border-border bg-brand-paper py-14 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Share your experience"
          title={
            <>
              Write a <em>review</em>
            </>
          }
          description="Loved your bangles? Tell us about your experience — your feedback helps other shoppers choose with confidence."
        />

        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl space-y-6" noValidate>
          <div className="space-y-2">
            <Label className="text-base font-medium">Your Rating</Label>
            <div className="flex items-center gap-1.5">
              {STAR_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Star
                    className={cn(
                      "size-7",
                      value <= activeRating
                        ? "fill-gold text-gold"
                        : "fill-transparent text-muted-foreground/50",
                    )}
                    aria-hidden="true"
                  />
                </button>
              ))}
              {rating ? (
                <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
              ) : null}
            </div>
            {errors.rating ? <p className="text-xs text-destructive">{errors.rating}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="review_name" className="text-base font-medium">
                Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="review_name"
                name="review_name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                aria-invalid={Boolean(errors.name)}
                className="h-11"
              />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="review_mobile" className="text-base font-medium">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="review_mobile"
                name="review_mobile"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                placeholder="Enter mobile number"
                aria-invalid={Boolean(errors.mobile)}
                className="h-11"
              />
              {errors.mobile ? <p className="text-xs text-destructive">{errors.mobile}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review_text" className="text-base font-medium">
              Share your experience with us… <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="review_text"
              name="review_text"
              rows={4}
              maxLength={1000}
              value={review}
              onChange={(event) => setReview(event.target.value)}
              placeholder="Tell us what you loved about your order…"
              aria-invalid={Boolean(errors.review)}
              className="min-h-28"
            />
            {errors.review ? <p className="text-xs text-destructive">{errors.review}</p> : null}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">Upload a photo (optional)</Label>
            <div className="rounded-2xl border border-dashed border-input bg-white/60 p-4">
              {previewUrl ? (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Your uploaded review photo"
                    className="size-20 rounded-xl border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{imageFile?.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Attach this photo in the WhatsApp chat after you submit.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        handleFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold-strong hover:text-foreground"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                      Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-5 text-sm text-muted-foreground transition-colors hover:bg-brand-c100"
                >
                  <ImagePlus className="size-4" aria-hidden="true" />
                  Add a photo (JPG, PNG or WebP up to 5 MB)
                </button>
              )}
              <input
                ref={fileInputRef}
                id="review_image"
                name="review_image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button type="submit" size="lg" disabled={submitting} className="h-11 gap-2 px-8 text-base">
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
