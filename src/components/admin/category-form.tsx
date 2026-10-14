"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";

import { saveCategoryAction } from "@/app/admin/actions";
import { initialActionState, type ActionState } from "@/lib/admin/action-state";
import { CheckboxRow, Field, FormMessage } from "@/components/admin/ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFormProps {
  category?: Category | null;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveCategoryAction,
    initialActionState,
  );
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const isEdit = Boolean(category);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <FormMessage state={state} />

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <Field label="Name" htmlFor="name" error={errors.name} required>
          <Input id="name" name="name" defaultValue={category?.name ?? ""} required maxLength={80} />
        </Field>
        <Field label="Slug" htmlFor="slug" error={errors.slug} required hint="Used in the collection anchor (#cat-slug).">
          <Input
            id="slug"
            name="slug"
            defaultValue={category?.slug ?? ""}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers and hyphens only"
          />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description}>
          <Textarea
            id="description"
            name="description"
            defaultValue={category?.description ?? ""}
            maxLength={600}
            rows={3}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Image URL" htmlFor="image_url" error={errors.image_url}>
            <Input id="image_url" name="image_url" defaultValue={category?.image_url ?? ""} />
          </Field>
          <Field
            label="Sort order"
            htmlFor="sort_order"
            error={errors.sort_order}
            hint="Lower numbers appear first."
          >
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              min="0"
              step="1"
              defaultValue={category?.sort_order ?? 0}
            />
          </Field>
        </div>
        <CheckboxRow
          id="is_active"
          name="is_active"
          label="Active"
          hint="Show this collection in navigation and filters."
          defaultChecked={category ? category.is_active : true}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={pending} className="h-11 gap-2 text-base">
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isEdit ? "Save changes" : "Create category"}
        </Button>
        <Link
          href="/admin/categories"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 text-base")}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
