-- ============================================================
-- SEOzapp – Fix seo_analyses table: add user_id + guest_email
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add missing columns (IF NOT EXISTS prevents errors on re-run)
ALTER TABLE public.seo_analyses ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.seo_analyses ADD COLUMN IF NOT EXISTS guest_email text;

-- 2. Create indexes for fast lookups by user_id and guest_email
CREATE INDEX IF NOT EXISTS idx_seo_analyses_user_id ON public.seo_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_analyses_guest_email ON public.seo_analyses(guest_email);

-- 3. Fix RLS policies: allow anyone to insert and select
--    (drop restrictive policies first if they exist, then recreate open ones)
DO $$
BEGIN
    -- Drop old restrictive policies if they exist
    DROP POLICY IF EXISTS "Users can view own analyses" ON public.seo_analyses;
    DROP POLICY IF EXISTS "Users can insert own analyses" ON public.seo_analyses;
    DROP POLICY IF EXISTS "Users can delete own analyses" ON public.seo_analyses;
    -- The original migration's open policies should remain, but recreate if missing
    DROP POLICY IF EXISTS "Anyone can view analyses" ON public.seo_analyses;
    DROP POLICY IF EXISTS "Anyone can create analyses" ON public.seo_analyses;
END $$;

-- Recreate open policies
CREATE POLICY "Anyone can view analyses"
  ON public.seo_analyses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create analyses"
  ON public.seo_analyses FOR INSERT
  WITH CHECK (true);
