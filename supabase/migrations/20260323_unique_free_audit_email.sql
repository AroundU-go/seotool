-- ============================================================
-- SEOzapp – Enforce one free audit per email at the DB level
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- First, remove any existing duplicates (keep the earliest row per email)
DELETE FROM public.free_audits
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM public.free_audits
  ORDER BY email, created_at ASC
);

-- Now add a unique index so the same email can never appear twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_free_audits_unique_email
  ON public.free_audits (email);
