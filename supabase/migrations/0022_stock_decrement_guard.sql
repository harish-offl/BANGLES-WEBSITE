-- ---------------------------------------------------------------------------
-- Idempotent stock decrement for paid orders
-- ---------------------------------------------------------------------------
-- The checkout callback and the Razorpay webhook can both report the same
-- payment. `stock_deducted_at` makes the database function claim the order so
-- inventory is only reduced once, even under concurrent delivery.
--
-- Safe to run whether or not the earlier version of `decrement_order_stock`
-- from migration 0021 already exists.
alter table public.orders
  add column if not exists stock_deducted_at timestamptz;

create or replace function public.decrement_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  current_stock integer;
begin
  update public.orders
     set stock_deducted_at = timezone('utc', now())
   where id = p_order_id
     and stock_deducted_at is null;

  if not found then
    return;
  end if;

  for item in
    select variant_id, quantity
    from public.order_items
    where order_id = p_order_id
      and variant_id is not null
      and quantity > 0
    order by variant_id
  loop
    select stock_quantity
      into current_stock
      from public.product_variants
     where id = item.variant_id
       for update;

    if not found then
      raise exception 'variant_not_found:%', item.variant_id;
    end if;

    -- NULL means stock is not tracked for this option; nothing to decrement.
    if current_stock is not null then
      if current_stock < item.quantity then
        raise exception 'insufficient_stock:%', item.variant_id;
      end if;

      update public.product_variants
         set stock_quantity = current_stock - item.quantity,
             updated_at = timezone('utc', now())
       where id = item.variant_id;
    end if;
  end loop;
end;
$$;

revoke all on function public.decrement_order_stock(uuid) from public;
grant execute on function public.decrement_order_stock(uuid) to service_role;
