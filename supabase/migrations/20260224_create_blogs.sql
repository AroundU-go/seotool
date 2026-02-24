-- ============================================================
-- SEOzapp – Blogs Table Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  published boolean DEFAULT false,
  author_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Public can read published blogs
CREATE POLICY "Anyone can read published blogs"
  ON public.blogs FOR SELECT
  USING (published = true);

-- Authenticated users can read all blogs (for admin)
CREATE POLICY "Authenticated users can read all blogs"
  ON public.blogs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow insert for authenticated users
CREATE POLICY "Authenticated users can insert blogs"
  ON public.blogs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow update for authenticated users
CREATE POLICY "Authenticated users can update blogs"
  ON public.blogs FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow delete for authenticated users
CREATE POLICY "Authenticated users can delete blogs"
  ON public.blogs FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs (slug);
-- Create index on published for filtering
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs (published);
