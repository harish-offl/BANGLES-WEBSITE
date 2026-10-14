-- 0004_orders.sql
-- Enquiry/order records.
--
-- The storefront does not take payment: customers send their selection to the
-- studio over WhatsApp. These tables let an admin keep a written record of
-- enquiries that were agreed, without ever claiming a payment happened online.
-- Line items snapshot the product name, variant and unit price at the time the
-- order was recorded so later catalogue edits do not rewrite history.

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('BB-' || to_char(timezone('utc', now()), 'YYMM') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0')),
  customer_name text,
  customer_phone text,
  status public.order_status not null default 'pending',
  currency text not null default 'INR',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  selected_variant_snapshot text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10, 2) not null default 0 check (unit_price >= 0),
  line_total numeric(12, 2) not null default 0 check (line_total >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

comment on table public.order_items is
  'Snapshot of what was agreed. `product_id` may become null if a product is deleted, but the snapshot columns preserve the historical record.';
