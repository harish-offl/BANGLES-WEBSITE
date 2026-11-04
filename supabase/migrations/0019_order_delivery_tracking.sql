-- 0019_order_delivery_tracking.sql
-- Add delivery stage tracking fields to orders table for Amazon/Flipkart-style
-- delivery progress tracking.

-- ---------------------------------------------------------------------------
-- orders: delivery stage tracking columns
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists delivery_stage text,
  add column if not exists courier_partner text,
  add column if not exists tracking_id text,
  add column if not exists tracking_updated_at timestamptz;

create index if not exists orders_delivery_stage_idx on public.orders (delivery_stage);
create index if not exists orders_tracking_id_idx on public.orders (tracking_id);

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------
comment on column public.orders.delivery_stage is
  'Current delivery stage: packed, shipped, out_for_delivery, delivered';
comment on column public.orders.courier_partner is
  'Courier partner company name, when assigned.';
comment on column public.orders.tracking_id is
  'Courier tracking / AWB number, when assigned.';
comment on column public.orders.tracking_updated_at is
  'Timestamp when delivery tracking information was last updated.';
