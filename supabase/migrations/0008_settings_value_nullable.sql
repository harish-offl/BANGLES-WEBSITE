-- The admin settings form posts every key on each save, and supabase-js
-- serialises a JS `null` as SQL NULL. The original `value jsonb not null`
-- constraint rejected that with:
--   null value in column "value" of relation "store_settings"
--   violates not-null constraint
-- which made it impossible to save (or clear) optional settings such as
-- contact_email. JSON null and SQL NULL both read back as JS null through
-- PostgREST, so the constraint is simply dropped.
alter table public.store_settings
  alter column value drop not null;

-- Repair rows that were stored as the JSON *string* "null" while working
-- around the constraint; they should be JSON null instead.
update public.store_settings
set value = 'null'::jsonb
where value = '"null"'::jsonb;
