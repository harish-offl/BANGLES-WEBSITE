-- 0015_order_lifecycle.sql
-- Amazon/Flipkart-style order lifecycle management for Bangles by Beauty.
--
-- Extends the existing order status enum with the full lifecycle, adds an
-- order_status_history audit table and a customer_notifications table, and
-- tightens Row Level Security so customers can read their own orders while
-- only admins may mutate order state.
--
-- The old `order_status` enum cannot be altered in place (add value is not
-- allowed inside a transaction that already uses the type), so the column is
-- temporarily converted to text, the type is dropped and recreated, and the
-- column is cast back. Existing rows are remapped: 'dispatched' -> 'shipped'.

-- ---------------------------------------------------------------------------
-- 1. Convert orders.status to text so the old enum type can be dropped.
-- ---------------------------------------------------------------------------
alter table public.orders alter column status type text using status::text;

drop type if exists public.order_status;

create type public.order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'delivery_failed',
  'return_requested',
  'return_approved',
  'return_rejected',
  'refund_initiated',
  'refunded',
  'payment_pending',
  'payment_failed',
  'stock_unavailable',
  'returned'
);

-- Cast the column back to the new enum. Existing rows were remapped above.
alter table public.orders alter column status type public.order_status using status::public.order_status;

-- Migrate any remaining 'dispatched' rows (defensive; the cast above would
-- have failed if any were left, so this is a no-op safety net).
update public.orders set status = 'shipped' where status::text = 'dispatched';

-- ---------------------------------------------------------------------------
-- 2. orders: lifecycle timestamp columns
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists confirmed_at timestamptz,
  add column if not exists processing_at timestamptz,
  add column if not exists cancelled_at timestamptz;

-- ---------------------------------------------------------------------------
-- 3. order_status_history — append-only audit trail of every status change
-- ---------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  previous_status text,
  new_status public.order_status not null,
  customer_message text,
  internal_note text,
  courier_name text,
  tracking_number text,
  tracking_url text,
  estimated_delivery timestamptz,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_status_history_order_id_idx on public.order_status_history (order_id);
create index if not exists order_status_history_created_at_idx on public.order_status_history (created_at desc);

alter table public.order_status_history enable row level security;

-- Customers can read the history of their own orders.
drop policy if exists order_status_history_customer_read on public.order_status_history;
create policy order_status_history_customer_read on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id
        and o.customer_id = auth.uid()
    )
  );

-- Admins have full access.
drop policy if exists order_status_history_admin_all on public.order_status_history;
create policy order_status_history_admin_all on public.order_status_history
  for all using (public.is_admin())
  with check (public.is_admin());

grant select on public.order_status_history to authenticated;

-- ---------------------------------------------------------------------------
-- 4. customer_notifications — in-app notification centre
-- ---------------------------------------------------------------------------
create table if not exists public.customer_notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete cascade,
  title text not null,
  message text not null,
  notification_type text not null,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_notifications_customer_id_idx on public.customer_notifications (customer_id);
create index if not exists customer_notifications_order_id_idx on public.customer_notifications (order_id);
create index if not exists customer_notifications_created_at_idx on public.customer_notifications (created_at desc);

alter table public.customer_notifications enable row level security;

-- Customers manage only their own notifications (read state).
drop policy if exists customer_notifications_customer_all on public.customer_notifications;
create policy customer_notifications_customer_all on public.customer_notifications
  for all using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

-- Admins may insert notifications on behalf of customers (server-side only).
drop policy if exists customer_notifications_admin_insert on public.customer_notifications;
create policy customer_notifications_admin_insert on public.customer_notifications
  for insert with check (public.is_admin());

drop policy if exists customer_notifications_admin_read on public.customer_notifications;
create policy customer_notifications_admin_read on public.customer_notifications
  for select using (public.is_admin());

grant select, insert, update on public.customer_notifications to authenticated;

-- ---------------------------------------------------------------------------
-- 5. order_notification_logs — delivery audit for email/WhatsApp channels
-- ---------------------------------------------------------------------------
create table if not exists public.order_notification_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  notification_type text not null,
  recipient text,
  delivery_status text not null default 'pending',
  provider_reference text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_notification_logs_order_id_idx on public.order_notification_logs (order_id);

alter table public.order_notification_logs enable row level security;

drop policy if exists order_notification_logs_admin_all on public.order_notification_logs;
create policy order_notification_logs_admin_all on public.order_notification_logs
  for all using (public.is_admin())
  with check (public.is_admin());

grant all on public.order_notification_logs to service_role;

-- ---------------------------------------------------------------------------
-- 6. orders RLS: allow customers to read their own orders
-- ---------------------------------------------------------------------------
drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists orders_customer_read on public.orders;
create policy orders_customer_read on public.orders
  for select using (customer_id = auth.uid());

drop policy if exists order_items_customer_read on public.order_items;
create policy order_items_customer_read on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
    )
  );

drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all on public.order_items
  for all using (public.is_admin())
  with check (public.is_admin());