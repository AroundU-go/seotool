/*
  # SEO Analysis History Table

  1. New Tables
    - `seo_analyses`
      - `id` (uuid, primary key) - Unique identifier for each analysis
      - `website` (text) - The analyzed website URL
      - `seo_data` (jsonb) - SEO analysis results
      - `ai_visibility_data` (jsonb) - AI visibility check results
      - `ai_bot_data` (jsonb) - AI bot checker results
      - `loading_speed_data` (jsonb) - Loading speed analysis results
      - `created_at` (timestamptz) - When the analysis was performed
      - `ip_address` (text) - IP address of the requester (for rate limiting)

  2. Security
    - Enable RLS on `seo_analyses` table
    - Add policy for public read access (analyses are public)
    - Add policy for public insert access (anyone can create analyses)

  3. Indexes
    - Index on `website` for faster lookups
    - Index on `created_at` for sorting and cleanup
*/

CREATE TABLE IF NOT EXISTS seo_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website text NOT NULL,
  seo_data jsonb,
  ai_visibility_data jsonb,
  ai_bot_data jsonb,
  loading_speed_data jsonb,
  created_at timestamptz DEFAULT now(),
  ip_address text
);

ALTER TABLE seo_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view analyses"
  ON seo_analyses
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create analyses"
  ON seo_analyses
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_seo_analyses_website ON seo_analyses(website);
CREATE INDEX IF NOT EXISTS idx_seo_analyses_created_at ON seo_analyses(created_at DESC);
