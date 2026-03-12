-- ============================================================
-- SEOzapp – Add top_keywords_data column to seo_analyses
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- The top_keywords_data column is used in the code but was never added
-- to the database, causing saveAnalysis to fail silently.
ALTER TABLE public.seo_analyses ADD COLUMN IF NOT EXISTS top_keywords_data jsonb;
