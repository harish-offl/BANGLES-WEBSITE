-- 0003_catalog_tables.sql
-- Catalogue tables: categories, products, product images and optional variants.
--
-- Notes on legacy data:
--   * `stock_quantity = null` means inventory is untracked (made to order).
--     The legacy site never published stock numbers, so none are invented.
--   * `compare_at_price` is null for every migrated product because the
--     original catalogue had no discounts.
--   * `legacy_id` / `legacy_image_source` retain provenance from the audit so
--     migrated rows can be traced back to the source site.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  sku text,
  price numeric(10, 2) not null default 0 check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  primary_image_url text,
  colours text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  seo_title text,
  seo_description text,
  legacy_id text,
  legacy_image_source text,
  sort_index integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on column public.products.stock_quantity is
  'Null means untracked / made to order. A number is an explicit count set by an admin.';

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_is_featured_idx on public.products (is_featured) where is_featured;
create index if not exists products_is_new_arrival_idx on public.products (is_new_arrival) where is_new_arrival;
create index if not exists products_price_idx on public.products (price);
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_colours_idx on public.products using gin (colours);
create index if not exists products_search_idx on public.products
  using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(sku, '')));

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  storage_path text,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists product_images_product_id_idx on public.product_images (product_id, sort_order);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_name text not null,
  variant_value text not null,
  sku text,
  price_override numeric(10, 2) check (price_override is null or price_override >= 0),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);

drop trigger if exists trg_product_variants_updated_at on public.product_variants;
create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();
