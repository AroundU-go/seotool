-- ============================================================
-- SEOzapp – Enhanced Blogs Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add optional columns to public.blogs if they do not exist
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS category text DEFAULT 'blog';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author_name text DEFAULT 'SEOzapp Team';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS read_time text DEFAULT '3 min read';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;

-- 2. Indexes for fast lookup & filtering
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs (category);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON public.blogs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs (published);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs (slug);

-- 3. Ensure RLS policies allow reading and admin operations
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can manage blogs" ON public.blogs;
CREATE POLICY "Anyone can manage blogs"
  ON public.blogs FOR ALL
  USING (true)
  WITH CHECK (true);
