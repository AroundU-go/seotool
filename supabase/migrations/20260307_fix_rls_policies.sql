-- ============================================================
-- SEOzapp – Ensure RLS policies are correct (safety net)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Drop any restrictive policies that may have been created
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own analyses" ON public.seo_analyses;
    DROP POLICY IF EXISTS "Users can insert own analyses" ON public.seo_analyses;
    DROP POLICY IF EXISTS "Users can delete own analyses" ON public.seo_analyses;
END $$;

-- Ensure open policies exist (idempotent: drop if exists, then recreate)
DROP POLICY IF EXISTS "Anyone can view analyses" ON public.seo_analyses;
DROP POLICY IF EXISTS "Anyone can create analyses" ON public.seo_analyses;

CREATE POLICY "Anyone can view analyses"
  ON public.seo_analyses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create analyses"
  ON public.seo_analyses FOR INSERT
  WITH CHECK (true);

-- Ensure guest_email column exists
ALTER TABLE public.seo_analyses ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE public.seo_analyses ADD COLUMN IF NOT EXISTS user_id uuid;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_seo_analyses_user_id ON public.seo_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_analyses_guest_email ON public.seo_analyses(guest_email);
