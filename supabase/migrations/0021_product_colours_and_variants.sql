-- 0021_product_colours_and_variants.sql
-- Adds category-level colour palettes and colour + size inventory.
--
-- Glass bangles are sold in several colours, and each colour/size combination
-- needs its own stock and photograph. A product therefore remains a single
-- catalogue row; the colourways are variants rather than duplicate products.
--
-- Everything is idempotent so this file can be re-run safely (and is included
-- in supabase/deploy.sql).

-- ---------------------------------------------------------------------------
-- Category colour palette
-- ---------------------------------------------------------------------------
create table if not exists public.product_colours (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  name text not null,
  hex_code text not null default '#C9A227',
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint product_colours_name_not_blank check (length(btrim(name)) > 0)
);

create unique index if not exists product_colours_category_name_key
  on public.product_colours (category_id, lower(btrim(name)));

create index if not exists product_colours_category_sort_idx
  on public.product_colours (category_id, sort_order);

drop trigger if exists trg_product_colours_updated_at on public.product_colours;
create trigger trg_product_colours_updated_at
  before update on public.product_colours
  for each row execute function public.set_updated_at();

alter table public.product_colours enable row level security;

drop policy if exists product_colours_read on public.product_colours;
create policy product_colours_read on public.product_colours
  for select using (is_active or public.is_admin());

drop policy if exists product_colours_admin_write on public.product_colours;
create policy product_colours_admin_write on public.product_colours
  for all using (public.is_admin())
  with check (public.is_admin());

grant select on public.product_colours to anon, authenticated;
grant select, insert, update, delete on public.product_colours to authenticated;

-- ---------------------------------------------------------------------------
-- Variant colour + size columns
-- ---------------------------------------------------------------------------
alter table public.product_variants add column if not exists colour text;
alter table public.product_variants add column if not exists colour_hex text;
alter table public.product_variants add column if not exists size text;
alter table public.product_variants add column if not exists image_url text;

comment on column public.product_variants.colour is
  'Colourway name (glass bangles). Null for products sold in a single colour.';
comment on column public.product_variants.size is
  'Display size, e.g. 2.10. Kept separately from variant_value so colour variants can share the same size.';

-- Backfill the size column for the legacy size-only variants.
update public.product_variants
set size = variant_value
where size is null
  and variant_name ilike 'size';

-- The old unique constraint allowed only one row per (product, size), which
-- would make the same size impossible for two colours. Replace it with a
-- colour-aware unique index.
alter table public.product_variants
  drop constraint if exists product_variants_product_id_variant_value_key;

create unique index if not exists product_variants_product_colour_size_key
  on public.product_variants (
    product_id,
    coalesce(lower(colour), ''),
    coalesce(lower(size), lower(variant_value))
  );

create index if not exists product_variants_colour_size_idx
  on public.product_variants (product_id, colour, size);

-- ---------------------------------------------------------------------------
-- Order item variant snapshot
-- ---------------------------------------------------------------------------
alter table public.order_items add column if not exists variant_id uuid;
alter table public.order_items add column if not exists colour text;
alter table public.order_items add column if not exists size text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_variant_id_fkey'
      and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_variant_id_fkey
      foreign key (variant_id) references public.product_variants (id) on delete set null;
  end if;
end $$;

create index if not exists order_items_variant_id_idx
  on public.order_items (variant_id);

-- ---------------------------------------------------------------------------
-- Seed the Glass Bangles palette
-- ---------------------------------------------------------------------------
insert into public.product_colours (category_id, name, hex_code, sort_order)
select c.id, v.name, v.hex_code, v.sort_order
from public.categories c
cross join (values
  ('Forest Green', '#2F5D3A', 0),
  ('Pista Green', '#A3C585', 1),
  ('Pink', '#EAB8C8', 2),
  ('Maroon', '#6D1F2C', 3),
  ('Red', '#C62828', 4),
  ('Rust Orange', '#B85C2E', 5),
  ('Orange', '#F28C28', 6)
) as v(name, hex_code, sort_order)
where c.slug = 'glass-bangles'
  and not exists (
    select 1 from public.product_colours pc
    where pc.category_id = c.id
      and lower(btrim(pc.name)) = lower(v.name)
  );

-- Normalise the existing glass product colour names (the migrated data had
-- both "Pista" and "Pista Green") without deleting the product.
update public.products p
set colours = coalesce((
  select array_agg(distinct canonical order by canonical)
  from (
    select case
      when lower(btrim(c)) = 'pista' then 'Pista Green'
      else btrim(c)
    end as canonical
    from unnest(p.colours) as c
    where btrim(c) <> ''
  ) mapped
), '{}')
where p.category_id in (
  select id from public.categories where slug = 'glass-bangles'
);

-- Normalise the per-colour photo map the same way so gallery lookups match.
update public.products p
set colour_images = coalesce((
  select jsonb_agg(
    jsonb_build_object('colour', dedup.colour, 'image_url', dedup.image_url)
    order by dedup.colour
  )
  from (
    select distinct on (lower(mapped.colour))
      mapped.colour,
      mapped.image_url
    from (
      select
        case
          when lower(btrim(e ->> 'colour')) = 'pista' then 'Pista Green'
          else btrim(e ->> 'colour')
        end as colour,
        btrim(e ->> 'image_url') as image_url
      from jsonb_array_elements(coalesce(p.colour_images, '[]'::jsonb)) as e
      where btrim(coalesce(e ->> 'colour', '')) <> ''
        and btrim(coalesce(e ->> 'image_url', '')) <> ''
    ) mapped
    order by lower(mapped.colour), mapped.image_url
  ) dedup
), '[]'::jsonb)
where p.category_id in (
  select id from public.categories where slug = 'glass-bangles'
);

-- Reuse each product's existing per-colour photograph for the palette swatch.
update public.product_colours pc
set image_url = source.image_url,
    updated_at = timezone('utc', now())
from (
  select
    p.category_id,
    case
      when lower(btrim(e ->> 'colour')) = 'pista' then 'Pista Green'
      else btrim(e ->> 'colour')
    end as colour,
    btrim(e ->> 'image_url') as image_url
  from public.products p
  cross join lateral jsonb_array_elements(coalesce(p.colour_images, '[]'::jsonb)) as e
  where p.category_id in (
    select id from public.categories where slug = 'glass-bangles'
  )
    and btrim(coalesce(e ->> 'colour', '')) <> ''
    and btrim(coalesce(e ->> 'image_url', '')) <> ''
) source
where pc.category_id = source.category_id
  and lower(btrim(pc.name)) = lower(source.colour)
  and pc.image_url is null;

-- Create the colour x size matrix for every glass product. Existing variants
-- are left untouched; stock_quantity is NULL (untracked / made to order) so
-- the migration never invents inventory counts or resets real stock.
insert into public.product_variants (
  product_id,
  variant_name,
  variant_value,
  size,
  colour,
  colour_hex,
  image_url,
  sku,
  price_override,
  stock_quantity,
  is_active
)
select
  p.id,
  'Size',
  s.size,
  s.size,
  pc.name,
  pc.hex_code,
  pc.image_url,
  null,
  null,
  null,
  true
from public.products p
join public.product_colours pc
  on pc.category_id = p.category_id
 and pc.is_active
cross join (values ('2.2'), ('2.4'), ('2.6'), ('2.8'), ('2.10')) as s(size)
where p.category_id in (
  select id from public.categories where slug = 'glass-bangles'
)
  and not exists (
    select 1
    from public.product_variants v
    where v.product_id = p.id
      and coalesce(lower(v.colour), '') = lower(pc.name)
      and coalesce(lower(v.size), lower(v.variant_value)) = lower(s.size)
  );

-- ---------------------------------------------------------------------------
-- Atomic stock decrement used after a payment is captured
-- ---------------------------------------------------------------------------
-- Guards against double-decrementing when both the checkout callback and the
-- Razorpay webhook report the same payment.
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
  -- Claim the order first. A second concurrent call (webhook + callback) sees
  -- stock_deducted_at set and returns without touching inventory again.
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

-- ---------------------------------------------------------------------------
-- Performance indexes for the hot listing/order paths
-- ---------------------------------------------------------------------------
create index if not exists products_active_created_idx
  on public.products (is_active, created_at desc);

create index if not exists products_active_price_idx
  on public.products (is_active, price);

create index if not exists orders_customer_created_idx
  on public.orders (customer_id, created_at desc);

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);

create index if not exists order_items_order_product_idx
  on public.order_items (order_id, product_id);
