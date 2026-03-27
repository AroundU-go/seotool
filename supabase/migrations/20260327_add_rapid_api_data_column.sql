-- Migration to add rapid_api_data column to seo_analyses table
ALTER TABLE seo_analyses ADD COLUMN IF NOT EXISTS rapid_api_data JSONB;
