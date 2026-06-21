-- ═══════════════════════════════════════════
-- SARKARI SAATHI V4 — SYNC SCHEMA MIGRATION
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- 1. marketplace_groups — add missing columns
ALTER TABLE marketplace_groups
  ADD COLUMN IF NOT EXISTS name_hi TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. marketplace_products — add is_featured flag
ALTER TABLE marketplace_products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 3. marketplace_products — fix: allow exam_name to be nullable
ALTER TABLE marketplace_products
  ALTER COLUMN exam_name DROP NOT NULL;

-- 4. marketplace_products — add cover_image for thumbnails
ALTER TABLE marketplace_products
  ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 5. marketplace_groups — add cover_image for category logos
ALTER TABLE marketplace_groups
  ADD COLUMN IF NOT EXISTS cover_image TEXT;
