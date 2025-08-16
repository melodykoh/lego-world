-- Fix for permission denied error
-- Run this in your Supabase SQL Editor

-- Drop all existing policies that query auth.users (these cause the permission error)
DROP POLICY IF EXISTS "Allow admin insert access on creations" ON creations;
DROP POLICY IF EXISTS "Allow admin update access on creations" ON creations;
DROP POLICY IF EXISTS "Allow admin delete access on creations" ON creations;
DROP POLICY IF EXISTS "Allow admin insert access on photos" ON photos;
DROP POLICY IF EXISTS "Allow admin update access on photos" ON photos;
DROP POLICY IF EXISTS "Allow admin delete access on photos" ON photos;

-- Create simple authenticated user policies (no auth.users queries)
CREATE POLICY "Allow authenticated insert access on creations" ON creations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update access on creations" ON creations
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete access on creations" ON creations
  FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated insert access on photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update access on photos" ON photos
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete access on photos" ON photos
  FOR DELETE USING (auth.uid() IS NOT NULL);