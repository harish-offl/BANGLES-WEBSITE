import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CategoryForm } from "@/components/admin/category-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getAdminCategory } from "@/lib/admin/queries";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditCategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await getAdminCategory(id);
  return { title: category ? `Edit ${category.name}` : "Edit category" };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getAdminCategory(id);

  if (!category) notFound();

  return (
    <>
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to categories
      </Link>
      <AdminPageHeader title="Edit category" description={category.name} />
      <CategoryForm category={category} />
    </>
  );
}
