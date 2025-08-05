-- Aiden's Lego World Database Schema
-- Run this in your Supabase SQL Editor

-- Create creations table
CREATE TABLE IF NOT EXISTS creations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  creation_id TEXT NOT NULL REFERENCES creations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  name TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creations_date_added ON creations(date_added DESC);
CREATE INDEX IF NOT EXISTS idx_photos_creation_id ON photos(creation_id);

-- Enable Row Level Security (RLS) for public access
ALTER TABLE creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (no authentication required)
CREATE POLICY "Allow public read access on creations" ON creations
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on creations" ON creations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on photos" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on photos" ON photos
  FOR INSERT WITH CHECK (true);

-- Optional: Create functions for table creation (for app initialization)
CREATE OR REPLACE FUNCTION create_creations_table()
RETURNS void AS $$
BEGIN
  -- This function exists so the app can try to create tables
  -- Tables are already created above, so this is just a placeholder
  NULL;
END;
$$ LANGUAGE plpgsql;