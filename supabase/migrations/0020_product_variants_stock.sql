-- 0020_product_variants_stock.sql
-- Ensure product_variants has a unique constraint on (product_id, variant_value)
-- so each size variant is unique per product. Also add helpful indexes.

-- Unique constraint: one variant per product+size combination
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'product_variants_product_id_variant_value_key'
      AND conrelid = 'public.product_variants'::regclass
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT product_variants_product_id_variant_value_key
      UNIQUE (product_id, variant_value);
  END IF;
END $$;

-- Index for fast variant lookups by product
CREATE INDEX IF NOT EXISTS product_variants_product_id_variant_value_idx
  ON public.product_variants (product_id, variant_value);

-- Index for fast stock lookups
CREATE INDEX IF NOT EXISTS product_variants_stock_idx
  ON public.product_variants (stock_quantity)
  WHERE stock_quantity IS NOT NULL;
