-- 0014_order_tracking_fields.sql
-- Add tracking-related fields to orders and create order_tracking_events table
-- for Amazon/Flipkart style order tracking.

-- ---------------------------------------------------------------------------
-- orders: tracking-related fields
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists courier_name text,
  add column if not exists courier_tracking_url text,
  add column if not exists estimated_delivery timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz;

create index if not exists orders_tracking_number_idx on public.orders (tracking_number);

-- ---------------------------------------------------------------------------
-- order_tracking_events table
-- ---------------------------------------------------------------------------
create table if not exists public.order_tracking_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null check (
    status in (
      'pending', 'confirmed', 'processing', 'packed', 'shipped',
      'out_for_delivery', 'delivered', 'cancelled', 'delivery_failed',
      'return_requested', 'returned', 'refund_initiated', 'refunded'
    )
  ),
  description text,
  location text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_tracking_events_order_id_idx on public.order_tracking_events (order_id);
create index if not exists order_tracking_events_created_at_idx on public.order_tracking_events (created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security for order_tracking_events
-- ---------------------------------------------------------------------------
alter table public.order_tracking_events enable row level security;

-- Customers can read tracking events for their own orders (matched by order
-- number lookup through orders table).
drop policy if exists order_tracking_events_customer_read on public.order_tracking_events;
create policy order_tracking_events_customer_read on public.order_tracking_events
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_tracking_events.order_id
    )
  );

-- Admins have full access.
drop policy if exists order_tracking_events_admin_all on public.order_tracking_events;
create policy order_tracking_events_admin_all on public.order_tracking_events
  for all using (public.is_admin())
  with check (public.is_admin());

grant select on public.order_tracking_events to authenticated;

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------
comment on table public.order_tracking_events is
  'Timeline of tracking events for customer orders. Append-only; never overwrite prior events.';
comment on column public.order_tracking_events.status is
  'Tracking status for this event.';
comment on column public.order_tracking_events.description is
  'Human-readable description of what happened at this event.';
comment on column public.order_tracking_events.location is
  'Location where this event occurred (city, facility, etc.), when available.';
comment on column public.orders.tracking_number is
  'Courier tracking / AWB number, when available.';
comment on column public.orders.courier_name is
  'Courier company name, when assigned.';
comment on column public.orders.courier_tracking_url is
  'External courier tracking URL, when available.';
comment on column public.orders.estimated_delivery is
  'Estimated delivery date/time, when known.';
comment on column public.orders.shipped_at is
  'Timestamp when the order was shipped.';
comment on column public.orders.delivered_at is
  'Timestamp when the order was delivered.';
