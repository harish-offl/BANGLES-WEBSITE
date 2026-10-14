"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteButtonProps {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  confirmMessage: string;
  className?: string;
}

export function DeleteButton({
  action,
  id,
  label = "Delete",
  confirmMessage,
  className,
}: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="inline-flex"
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton label={label} className={className} />
    </form>
  );
}

function SubmitButton({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      aria-label={label}
      className={cn("text-muted-foreground hover:text-destructive", className)}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
