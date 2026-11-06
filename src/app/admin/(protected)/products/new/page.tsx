import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getAdminCategories, getAdminColourPalettes } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const [categories, palettesByCategory] = await Promise.all([
    getAdminCategories(),
    getAdminColourPalettes(),
  ]);

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to products
      </Link>
      <AdminPageHeader title="New product" description="Add a piece to the catalogue." />
      <ProductForm categories={categories} palettesByCategory={palettesByCategory} />
    </>
  );
}
