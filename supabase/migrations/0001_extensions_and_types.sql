-- 0001_extensions_and_types.sql
-- Extensions and shared enums for the Bangles by Beauty schema.
--
-- `gen_random_uuid()` is provided by pgcrypto on older Postgres versions;
-- Supabase ships it by default, but the extension is created here so the
-- migration also works on a vanilla Postgres 13+ instance.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_role') then
    create type public.profile_role as enum ('customer', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'
    );
  end if;
end $$;

-- Shared trigger to keep `updated_at` current. Every mutable table reuses it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;
