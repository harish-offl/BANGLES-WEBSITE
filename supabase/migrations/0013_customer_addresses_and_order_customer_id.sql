-- 0013_customer_addresses_and_order_customer_id.sql
-- Customer addresses and linking orders to authenticated customers.

-- ---------------------------------------------------------------------------
-- customer_addresses table
-- ---------------------------------------------------------------------------
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  address_name text not null,        -- e.g. "Home", "Office", "Mom's house"
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_addresses_customer_id_idx
  on public.customer_addresses (customer_id);
create index if not exists customer_addresses_is_default_idx
  on public.customer_addresses (customer_id, is_default);

drop trigger if exists trg_customer_addresses_updated_at on public.customer_addresses;
create trigger trg_customer_addresses_updated_at
  before update on public.customer_addresses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- orders: link to authenticated customer
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists customer_id uuid references auth.users (id) on delete set null;

create index if not exists orders_customer_id_idx on public.orders (customer_id);

-- ---------------------------------------------------------------------------
-- Row Level Security for customer_addresses
-- ---------------------------------------------------------------------------
alter table public.customer_addresses enable row level security;

drop policy if exists customer_addresses_customer_all on public.customer_addresses;
create policy customer_addresses_customer_all on public.customer_addresses
  for all using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

grant select, insert, update, delete on public.customer_addresses to authenticated;

-- ---------------------------------------------------------------------------
-- orders: allow authenticated customers to read their own orders
-- ---------------------------------------------------------------------------
-- Customers can SELECT their own orders (matched by customer_id).
-- Admins keep full access via existing policies.
drop policy if exists orders_customer_select_own on public.orders;
create policy orders_customer_select_own on public.orders
  for select using (auth.uid() = customer_id);

-- Customers can INSERT their own orders (via checkout).
drop policy if exists orders_customer_insert_own on public.orders;
create policy orders_customer_insert_own on public.orders
  for insert with check (auth.uid() = customer_id);

grant select, insert on public.orders to authenticated;
grant select on public.order_items to authenticated;
