-- 0009_razorpay_payments.sql
--
-- Extends the existing orders table for Razorpay-powered checkout and adds an
-- immutable payment-events log so payment status is driven only by verified
-- server-side events (Razorpay Checkout verification + webhooks).
--
-- Apply this to your Supabase project before enabling Razorpay checkout.
-- All monetary additions are stored in integer paise (₹1 = 100 paise).

-- ---------------------------------------------------------------------------
-- orders: payment + fulfilment detail
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists customer_email text,
  add column if not exists shipping_address text,
  add column if not exists shipping_fee_paise integer not null default 0 check (shipping_fee_paise >= 0),
  add column if not exists discount_paise integer not null default 0 check (discount_paise >= 0),
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending','authorized','paid','failed','refunded','partially_refunded')),
  add column if not exists razorpay_order_id text unique,
  add column if not exists razorpay_payment_id text unique;

create index if not exists orders_razorpay_order_id_idx on public.orders (razorpay_order_id);
create index if not exists orders_razorpay_payment_id_idx on public.orders (razorpay_payment_id);
create index if not exists orders_payment_status_idx on public.orders (payment_status);

-- ---------------------------------------------------------------------------
-- payment_events: idempotent log of Razorpay webhook / verification events
-- ---------------------------------------------------------------------------
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'razorpay' check (provider = 'razorpay'),
  event_id text not null unique,
  event_type text not null,
  internal_order_id uuid references public.orders (id) on delete set null,
  processing_status text not null default 'pending'
    check (processing_status in ('pending','processed','ignored')),
  created_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz
);

create index if not exists payment_events_event_id_idx on public.payment_events (event_id);
create index if not exists payment_events_order_idx on public.payment_events (internal_order_id);

-- payment_events is an append-only log, so it deliberately has no updated_at
-- column and no set_updated_at() trigger.

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.payment_events enable row level security;

drop policy if exists payment_events_admin_all on public.payment_events;
create policy payment_events_admin_all on public.payment_events
  for all using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.payment_events to authenticated;

comment on table public.payment_events is
  'Deduplicated log of Razorpay payment events. process idempotently; never trust unverified events.';
comment on column public.orders.payment_status is
  'Authoritative payment state. Updated only after server-side Razorpay signature verification or a verified webhook.';
comment on column public.orders.razorpay_order_id is
  'Razorpay order id created server-side for this order.';
comment on column public.orders.razorpay_payment_id is
  'Razorpay payment id captured after successful verification.';
