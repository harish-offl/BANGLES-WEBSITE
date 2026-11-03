-- 0012_order_address_state.sql
-- Add shipping address and state to orders table for delivery tracking.

alter table public.orders
  add column if not exists shipping_address text,
  add column if not exists customer_state text;

create index if not exists orders_customer_state_idx on public.orders (customer_state);
