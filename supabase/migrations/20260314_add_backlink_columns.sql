-- Add backlink columns to seo_analyses table
ALTER TABLE public.seo_analyses ADD COLUMN IF NOT EXISTS backlink_data JSONB;
ALTER TABLE public.seo_analyses ADD COLUMN IF NOT EXISTS new_backlinks_data JSONB;
ALTER TABLE public.seo_analyses ADD COLUMN IF NOT EXISTS poor_backlinks_data JSONB;
