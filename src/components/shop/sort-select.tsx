"use client";

import { useRouter } from "next/navigation";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

interface SortSelectProps {
  pathname: string;
  /** Existing query string (excluding `sort` and `page`). */
  baseParams: string;
  value: string;
}

/** Minimal sort control that rewrites the `sort` query parameter. */
export function SortSelect({ pathname, baseParams, value }: SortSelectProps) {
  const router = useRouter();

  function handleChange(next: string) {
    const params = new URLSearchParams(baseParams);
    if (next && next !== "newest") params.set("sort", next);
    else params.delete("sort");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Sort</span>
      <select
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
