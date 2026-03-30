-- ============================================================
-- SEOzapp – Drop FK constraint on seo_analyses.user_id
-- The FK to profiles(id) causes INSERT failures when a user's
-- profile doesn't exist (Google OAuth edge cases, trigger failures).
-- We rely on guest_email for lookups, so the FK is unnecessary.
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Find and drop the FK constraint on user_id
-- The constraint name varies, so we use a dynamic approach
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'seo_analyses'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.column_name = 'user_id'
    LIMIT 1;

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.seo_analyses DROP CONSTRAINT ' || quote_ident(constraint_name);
        RAISE NOTICE 'Dropped FK constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No FK constraint found on seo_analyses.user_id — already removed or never existed';
    END IF;
END $$;

-- Verify: ensure the open RLS policies exist (idempotent)
DROP POLICY IF EXISTS "Anyone can view analyses" ON public.seo_analyses;
DROP POLICY IF EXISTS "Anyone can create analyses" ON public.seo_analyses;

CREATE POLICY "Anyone can view analyses"
  ON public.seo_analyses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create analyses"
  ON public.seo_analyses FOR INSERT
  WITH CHECK (true);
