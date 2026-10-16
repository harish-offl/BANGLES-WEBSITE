import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  className?: string;
  /** Marks the first row as priority for the LCP image. */
  priorityCount?: number;
}

/** Responsive two-to-four column product grid used across listing pages. */
export function ProductGrid({ products, className, priorityCount = Infinity }: ProductGridProps) {
  return (
    <ul className={cn("grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((product, index) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} priority={index < priorityCount} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
