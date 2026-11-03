-- 0011_category_product_assignments.sql
-- Junction table for many-to-many category-product assignments.
--
-- Products can now be assigned to multiple categories. The existing
-- `products.category_id` column is preserved for backward compatibility but
-- the `category_products` table is the source of truth for category
-- membership used by the admin assignment UI and storefront filtering.

create table if not exists public.category_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (category_id, product_id)
);

create index if not exists category_products_category_id_idx on public.category_products (category_id);
create index if not exists category_products_product_id_idx on public.category_products (product_id);

drop trigger if exists trg_category_products_updated_at on public.category_products;
create trigger trg_category_products_updated_at
  before update on public.category_products
  for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.category_products enable row level security;

-- Public can read assignments where the product is active (storefront visibility)
drop policy if exists category_products_public_read on public.category_products;
create policy category_products_public_read on public.category_products
  for select using (
    exists (
      select 1 from public.products p
      where p.id = category_products.product_id and p.is_active = true
    )
  );

-- Admins have full access
drop policy if exists category_products_admin_write on public.category_products;
create policy category_products_admin_write on public.category_products
  for all using (public.is_admin())
  with check (public.is_admin());

-- Grants
grant select on public.category_products to anon, authenticated;
grant select, insert, update, delete on public.category_products to authenticated;

-- Migrate existing category_id relationships into the junction table
insert into public.category_products (category_id, product_id, sort_order)
  select category_id, id, sort_index
  from public.products
  where category_id is not null
  on conflict (category_id, product_id) do nothing;

comment on table public.category_products is
  'Many-to-many junction table linking categories to products. Replaces the single category_id column on products as the source of truth for category membership.';
comment on column public.category_products.sort_order is
  'Display order of the product within the category.'
