-- 0017_performance_indexes.sql
-- Performance indexes for product/category lookups used by storefront routes.
-- Run this migration on the production Supabase project before deploying.

-- ---------------------------------------------------------------------------
-- 1. Products: fast slug-based lookups for product detail pages
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);

-- ---------------------------------------------------------------------------
-- 2. Categories: fast slug-based lookups for collection pages
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories (is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories (sort_order);

-- ---------------------------------------------------------------------------
-- 3. Junction table: fast category-product assignment lookups
--    (Only if migration 0011_category_product_assignments has been applied)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'category_products') then
    create index if not exists idx_category_products_category_id on public.category_products (category_id);
    create index if not exists idx_category_products_product_id on public.category_products (product_id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Product images & variants: fast product-scoped gallery queries
--    (Only if migration 0007_product_colour_images has been applied)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'product_colour_images') then
    create index if not exists idx_product_colour_images_product_id on public.product_colour_images (product_id);
  end if;
end $$;

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants (product_id);

-- ---------------------------------------------------------------------------
-- 5. Order items: fast bestseller/ranking queries
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- 6. Customers: fast customer-scoped order lookups
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
