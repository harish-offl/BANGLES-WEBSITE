import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getAdminCategories, getAdminProduct } from "@/lib/admin/queries";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return { title: product ? `Edit ${product.name}` : "Edit product" };
}

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to products
        </Link>
        {product.is_active ? (
          <Link
            href={`/#product-${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View in store
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {query.saved ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-foreground"
        >
          Changes saved.
        </p>
      ) : null}

      <AdminPageHeader title="Edit product" description={product.name} />
      <ProductForm categories={categories} product={product} />
    </>
  );
}
