-- 0018_customer_cart_wishlist_profile_extensions.sql
-- Customer cart, wishlist, and profile field extensions.
-- Enables persistent cart/wishlist across devices and richer customer profiles.

-- ---------------------------------------------------------------------------
-- 1. profiles: add optional profile fields
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists gender text;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. customer_cart — one cart per customer
-- ---------------------------------------------------------------------------
create table if not exists public.customer_cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists customer_cart_user_id_idx
  on public.customer_cart (user_id);

drop trigger if exists trg_customer_cart_updated_at on public.customer_cart;
create trigger trg_customer_cart_updated_at
  before update on public.customer_cart
  for each row execute function public.set_updated_at();

alter table public.customer_cart enable row level security;

drop policy if exists customer_cart_customer_all on public.customer_cart;
create policy customer_cart_customer_all on public.customer_cart
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.customer_cart to authenticated;

-- ---------------------------------------------------------------------------
-- 3. customer_cart_items — line items in a customer cart
-- ---------------------------------------------------------------------------
create table if not exists public.customer_cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.customer_cart (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_cart_items_cart_id_idx
  on public.customer_cart_items (cart_id);
create index if not exists customer_cart_items_product_id_idx
  on public.customer_cart_items (product_id);
create unique index if not exists customer_cart_items_cart_product_unique
  on public.customer_cart_items (cart_id, product_id, variant_id);

drop trigger if exists trg_customer_cart_items_updated_at on public.customer_cart_items;
create trigger trg_customer_cart_items_updated_at
  before update on public.customer_cart_items
  for each row execute function public.set_updated_at();

alter table public.customer_cart_items enable row level security;

drop policy if exists customer_cart_items_customer_all on public.customer_cart_items;
create policy customer_cart_items_customer_all on public.customer_cart_items
  for all using (
    exists (
      select 1 from public.customer_cart c
      where c.id = customer_cart_items.cart_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.customer_cart c
      where c.id = customer_cart_items.cart_id
        and c.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.customer_cart_items to authenticated;

-- ---------------------------------------------------------------------------
-- 4. customer_wishlist — saved products per customer
-- ---------------------------------------------------------------------------
create table if not exists public.customer_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists customer_wishlist_user_product_unique
  on public.customer_wishlist (user_id, product_id);
create index if not exists customer_wishlist_user_id_idx
  on public.customer_wishlist (user_id);
create index if not exists customer_wishlist_product_id_idx
  on public.customer_wishlist (product_id);

drop trigger if exists trg_customer_wishlist_updated_at on public.customer_wishlist;
create trigger trg_customer_wishlist_updated_at
  before update on public.customer_wishlist
  for each row execute function public.set_updated_at();

alter table public.customer_wishlist enable row level security;

drop policy if exists customer_wishlist_customer_all on public.customer_wishlist;
create policy customer_wishlist_customer_all on public.customer_wishlist
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.customer_wishlist to authenticated;
