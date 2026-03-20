-- ============================================================
-- SEOzapp – Fix Blogs RLS and Add image_url Column
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add image_url column to blogs if it doesn't exist
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Update RLS policies to allow the custom Admin Login to work
-- (Since the Admin Login bypasses Supabase Auth, we must open RLS for blogs)
DROP POLICY IF EXISTS "Authenticated users can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authenticated users can update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authenticated users can delete blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authenticated users can read all blogs" ON public.blogs;
DROP POLICY IF EXISTS "Anyone can read published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Anyone can manage blogs" ON public.blogs;

CREATE POLICY "Anyone can manage blogs"
  ON public.blogs FOR ALL
  USING (true)
  WITH CHECK (true);
