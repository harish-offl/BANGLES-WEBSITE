-- 0016_google_auth_profiles.sql
-- Support Google OAuth sign-in by adding the profile columns the customer
-- identity helper reads (email, phone, avatar_url). The `handle_new_user`
-- trigger is updated to persist Google-provided metadata when present, and
-- existing rows are back-filled from auth.users so nothing is lost.

-- ---------------------------------------------------------------------------
-- 1. profiles: add columns used by the customer identity helper
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists avatar_url text;

-- Back-fill email for any profiles that predate this migration.
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;

-- ---------------------------------------------------------------------------
-- 2. handle_new_user: persist Google metadata when available
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  v_display_name text;
  v_email text;
  v_phone text;
  v_avatar text;
begin
  meta := new.raw_user_meta_data;

  v_display_name := coalesce(
    meta ->> 'full_name',
    meta ->> 'name',
    meta ->> 'display_name',
    split_part(new.email, '@', 1)
  );

  v_email := coalesce(meta ->> 'email', new.email);
  v_phone := coalesce(meta ->> 'phone', meta ->> 'phone_number');
  v_avatar := coalesce(
    meta ->> 'avatar_url',
    meta ->> 'picture',
    meta ->> 'avatar'
  );

  insert into public.profiles (id, display_name, email, phone, avatar_url)
  values (new.id, v_display_name, v_email, v_phone, v_avatar)
  on conflict (id) do update set
    display_name = coalesce(public.profiles.display_name, v_display_name),
    email       = coalesce(public.profiles.email, v_email),
    phone       = coalesce(public.profiles.phone, v_phone),
    avatar_url  = coalesce(public.profiles.avatar_url, v_avatar),
    updated_at  = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. RLS: customers may read their own profile; admins full access.
--    (Existing policies already cover this; nothing to change here.)
-- ---------------------------------------------------------------------------