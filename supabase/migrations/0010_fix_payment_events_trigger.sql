-- 0010_fix_payment_events_trigger.sql
--
-- Migration 0009 originally attached the shared `set_updated_at()` trigger to
-- `public.payment_events`. That trigger writes `new.updated_at`, but the
-- append-only `payment_events` table has no `updated_at` column, so any future
-- UPDATE on the table would fail with:
--   record "new" has no field "updated_at"
--
-- The event log is never updated (rows are inserted once and deduplicated by
-- `event_id`), so the trigger is removed entirely. This migration is idempotent
-- and safe to run whether or not 0009 has already been applied.

drop trigger if exists trg_payment_events_updated_at on public.payment_events;
