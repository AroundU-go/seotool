-- ============================================================
-- SEOzapp – Pro Subscription Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Add pro-tracking columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_since TIMESTAMPTZ;

-- Allow service_role (webhook) to update profiles
-- (service_role bypasses RLS, but adding explicit policy for clarity)
CREATE POLICY "Service role can update profiles"
  ON public.profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);
