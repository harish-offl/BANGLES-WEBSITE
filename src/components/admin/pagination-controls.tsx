"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  pageCount: number;
  total: number;
}

export function PaginationControls({ page, pageCount, total }: PaginationControlsProps) {
  const router = useRouter();

  return (
    <nav className="mt-6 flex items-center justify-between gap-2">
      <div className="text-sm text-muted-foreground">
        Page {page} of {pageCount} ({total} total)
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => {
            router.push(`?page=${page - 1}`, { scroll: false });
          }}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === pageCount}
          onClick={() => {
            router.push(`?page=${page + 1}`, { scroll: false });
          }}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
