-- 0007_product_colour_images.sql
-- Per-colour product photography.
--
-- Some products (currently the glass bangles) are sold in several colours and
-- have a distinct photo for each one. `colour_images` stores that mapping as
-- an ordered JSON array of { "colour": string, "image_url": string } objects so
-- the storefront can swap the gallery image when a colour is selected.
--
-- Kept alongside the existing `colours text[]` column rather than replacing it:
-- `colours` drives filtering/search, while `colour_images` only carries media.

alter table public.products
  add column if not exists colour_images jsonb not null default '[]'::jsonb;

comment on column public.products.colour_images is
  'Ordered [{ colour, image_url }] media per colour. Empty array when a product has no per-colour photography.';
