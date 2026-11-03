"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface LocalImagePreviewProps {
  accept?: string;
  onImageSelect?: (file: File, previewUrl: string) => void;
  className?: string;
  label?: string;
}

/**
 * Local image preview component for file uploads.
 *
 * Uses a regular <img> with URL.createObjectURL() for local file previews
 * BEFORE upload. Do NOT use next/image for local files - it requires a URL
 * hostname configured in next.config.js.
 *
 * After upload, use next.image/SmartImage with the Supabase URL.
 */
export function LocalImagePreview({
  accept = "image/*",
  onImageSelect,
  className,
  label = "Upload image",
}: LocalImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert("Image must be 5 MB or smaller.");
      return;
    }

    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    onImageSelect?.(selected, url);
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative group">
        <input
          ref={inputRef}
          id="image_file"
          name="image_file"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:text-foreground"
        />
        {previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg border border-dashed border-white/50">
            <img
              // @next/no-img-element — local file preview uses URL.createObjectURL, not next/image
              src={previewUrl}
              alt="Preview"
              className="max-h-32 max-w-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 rounded-full bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
