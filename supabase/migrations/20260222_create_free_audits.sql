-- ============================================================
-- SEOzapp – Free Audits Tracking Table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Track free audits per email (limit 2 per free user)
CREATE TABLE IF NOT EXISTS public.free_audits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.free_audits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (users track their own audits)
CREATE POLICY "Anyone can insert free audits"
  ON public.free_audits FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read (for count checks)
CREATE POLICY "Anyone can read free audits"
  ON public.free_audits FOR SELECT
  USING (true);
