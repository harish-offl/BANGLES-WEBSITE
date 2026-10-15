"use client";

import { useRef, useState, type FormEvent } from "react";
import { Check, ImagePlus, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildCustomDesignMessage, buildWhatsAppUrl } from "@/lib/whatsapp/shared";
import { CUSTOM_SIZES, customDesignSchema } from "@/lib/validation/custom-design";
import { cn } from "@/lib/utils";

const COLOUR_SWATCHES = [
  { name: "Red", hex: "#b4232a" },
  { name: "Maroon", hex: "#6d1f2a" },
  { name: "Pink", hex: "#e58fa6" },
  { name: "Peach", hex: "#f0ada2" },
  { name: "Gold", hex: "#c6a15b" },
  { name: "Silver", hex: "#c9ccd1" },
  { name: "Green", hex: "#2f6b4f" },
  { name: "Dark green", hex: "#214d3a" },
  { name: "Blue", hex: "#3a5a9b" },
  { name: "Purple", hex: "#6b4a8f" },
  { name: "Orange", hex: "#d97a2b" },
  { name: "Yellow", hex: "#e0b83a" },
  { name: "White", hex: "#ffffff" },
  { name: "Black", hex: "#1f1b1a" },
] as const;

const HEX_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Normalises a typed colour code ("b4232a", "#B4232A") to "#b4232a". */
function normaliseHex(value: string): string | null {
  const trimmed = value.trim();
  if (!HEX_PATTERN.test(trimmed)) return null;
  return (trimmed.startsWith("#") ? trimmed : `#${trimmed}`).toLowerCase();
}

interface CustomizeFormProps {
  storeName: string;
  whatsappNumber: string | null;
  siteUrl: string;
}

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
 * Custom design brief. The customer composes a design (reference image,
 * colours, size and notes) and submits it as a WhatsApp enquiry — matching the
 * store's WhatsApp-first ordering flow. Images are previewed locally and the
 * customer attaches the file in the chat.
 */
export function CustomizeForm({ storeName, whatsappNumber, siteUrl }: CustomizeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [size, setSize] = useState<string>("");
  const [colours, setColours] = useState<string[]>([]);
  const [colourCode, setColourCode] = useState<string>("");
  const [colourError, setColourError] = useState<string>("");
  const [comments, setComments] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleColour(hex: string) {
    setColours((current) =>
      current.includes(hex) ? current.filter((c) => c !== hex) : [...current, hex],
    );
  }

  function addColourCode() {
    const hex = normaliseHex(colourCode);
    if (!hex) {
      setColourError("Enter a valid colour code, for example #b4232a.");
      return;
    }
    setColourError("");
    setColours((current) => (current.includes(hex) ? current : [...current, hex]));
    setColourCode("");
  }

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

    const parsed = customDesignSchema.safeParse({
      size,
      colours,
      comments: comments.trim() ? comments.trim() : null,
      mobile,
      address,
      email,
      imageName: imageFile?.name ?? null,
    });

    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error));
      toast.error("Please check the highlighted fields.");
      return;
    }

    if (!whatsappNumber) {
      toast.error("WhatsApp ordering is not configured yet. Please contact us another way.");
      return;
    }

    setErrors({});
    setSubmitting(true);

    const message = buildCustomDesignMessage({
      storeName,
      siteUrl,
      size: parsed.data.size,
      colours: parsed.data.colours,
      customColour: parsed.data.customColour,
      comments: parsed.data.comments,
      mobile: parsed.data.mobile,
      address: parsed.data.address,
      email: parsed.data.email,
      imageName: parsed.data.imageName,
    });

    const url = buildWhatsAppUrl(whatsappNumber, message);
    if (!url) {
      setSubmitting(false);
      toast.error("WhatsApp ordering is not configured yet. Please contact us another way.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp with your design brief.");
    setSubmitting(false);
  }

  const colourLabels = colours.map(
    (hex) => COLOUR_SWATCHES.find((s) => s.hex === hex)?.name ?? hex,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Image upload */}
      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl">Add Your Designs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a reference photo, choose your colours and size, then tell us anything else.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-input bg-brand-c100/50 p-4">
          {previewUrl ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Your uploaded design reference"
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
                  Remove image
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl px-4 py-6 text-center transition-colors hover:bg-brand-c100"
            >
              <span className="grid size-11 place-items-center rounded-full bg-white text-gold shadow-sm">
                <ImagePlus className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-foreground">Upload</span>
              <span className="text-xs text-muted-foreground">JPG, PNG or WebP up to 5 MB</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            id="design_image"
            name="design_image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
        </div>
      </section>

      {/* Colour picker */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <Label className="text-base font-medium">Colour Picker</Label>
          <span className="text-xs text-muted-foreground">
            {colourLabels.length ? colourLabels.join(", ") : "Select or enter one or more"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {COLOUR_SWATCHES.map((swatch) => {
            const selected = colours.includes(swatch.hex);
            return (
              <button
                key={swatch.hex}
                type="button"
                aria-pressed={selected}
                aria-label={swatch.name}
                title={swatch.name}
                onClick={() => toggleColour(swatch.hex)}
                className={cn(
                  "relative grid size-9 place-items-center rounded-full border shadow-sm transition-transform hover:scale-105",
                  selected ? "border-transparent ring-2 ring-ring ring-offset-2" : "border-border",
                )}
                style={{ backgroundColor: swatch.hex }}
              >
                {selected ? (
                  <Check
                    className={cn(
                      "size-4",
                      swatch.hex === "#ffffff" || swatch.hex === "#e0b83a" || swatch.hex === "#c9ccd1"
                        ? "text-brand-ink"
                        : "text-white",
                    )}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-brand-c100/40 p-3">
          <Label htmlFor="colour_code" className="text-xs font-medium text-muted-foreground">
            Enter a colour code
          </Label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="color"
              aria-label="Pick a colour"
              value={normaliseHex(colourCode) ?? "#f0ada2"}
              onChange={(event) => {
                setColourCode(event.target.value);
                setColourError("");
              }}
              className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-input bg-white p-1"
            />
            <Input
              id="colour_code"
              name="colour_code"
              value={colourCode}
              onChange={(event) => {
                setColourCode(event.target.value);
                setColourError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addColourCode();
                }
              }}
              placeholder="#b4232a"
              spellCheck={false}
              autoComplete="off"
              className="h-11 w-36 font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addColourCode}
              disabled={!colourCode.trim()}
              className="h-11"
            >
              Add colour
            </Button>
          </div>
          {colourError ? (
            <p className="mt-2 text-xs text-destructive">{colourError}</p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Type a hex code (for example #b4232a) or use the swatch, then press Add colour.
            </p>
          )}
        </div>

        {colours.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-2 pt-1">
            {colours.map((hex) => (
              <li key={hex}>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-2 pr-1.5 text-xs text-foreground">
                  <span
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: hex }}
                    aria-hidden="true"
                  />
                  <span className="font-mono">{hex}</span>
                  <button
                    type="button"
                    onClick={() => toggleColour(hex)}
                    aria-label={`Remove ${hex}`}
                    className="grid size-5 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-brand-c100 hover:text-foreground"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {errors.colours ? <p className="text-xs text-destructive">{errors.colours}</p> : null}
      </section>

      {/* Size */}
      <section className="space-y-3">
        <Label className="text-base font-medium">Select Size</Label>
        <div className="flex flex-wrap gap-2.5">
          {CUSTOM_SIZES.map((option) => {
            const selected = size === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => setSize(option)}
                className={cn(
                  "h-11 min-w-16 rounded-xl border px-5 text-sm font-medium transition-colors",
                  selected
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-gold",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
        {errors.size ? <p className="text-xs text-destructive">{errors.size}</p> : null}
      </section>

      {/* Comments */}
      <section className="space-y-2">
        <Label htmlFor="design_comments" className="text-base font-medium">
          Comment Box
        </Label>
        <Textarea
          id="design_comments"
          name="design_comments"
          rows={4}
          maxLength={1000}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Enter your design comments here..."
          className="min-h-28"
        />
        {errors.comments ? <p className="text-xs text-destructive">{errors.comments}</p> : null}
      </section>

      {/* Contact details */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="design_mobile" className="text-base font-medium">
            Mobile Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="design_mobile"
            name="design_mobile"
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

        <div className="space-y-2">
          <Label htmlFor="design_email" className="text-base font-medium">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="design_email"
            name="design_email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            aria-invalid={Boolean(errors.email)}
            className="h-11"
          />
          {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="design_address" className="text-base font-medium">
            Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="design_address"
            name="design_address"
            rows={3}
            maxLength={500}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter your address"
            aria-invalid={Boolean(errors.address)}
          />
          {errors.address ? <p className="text-xs text-destructive">{errors.address}</p> : null}
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          We confirm the price, colours and delivery time on WhatsApp. No payment is taken online.
        </p>
        <Button type="submit" size="lg" disabled={submitting} className="h-11 gap-2 px-6 text-base">
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          Submit Design
        </Button>
      </div>
    </form>
  );
}
