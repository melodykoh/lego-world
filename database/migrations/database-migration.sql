-- Migration script to add user ownership to existing data
-- Run this AFTER creating your admin account

-- Add user_id column to existing creations table
ALTER TABLE creations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update all existing creations to belong to the admin user
-- Replace 'your-email@example.com' with your actual email
UPDATE creations 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'melodykoh0818@gmail.com' 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Update policies to restrict admin access to specific email
DROP POLICY IF EXISTS "Allow authenticated insert access on creations" ON creations;
DROP POLICY IF EXISTS "Allow authenticated update access on creations" ON creations;
DROP POLICY IF EXISTS "Allow authenticated delete access on creations" ON creations;
DROP POLICY IF EXISTS "Allow authenticated insert access on photos" ON photos;
DROP POLICY IF EXISTS "Allow authenticated update access on photos" ON photos;
DROP POLICY IF EXISTS "Allow authenticated delete access on photos" ON photos;

-- Create single admin policies (replace email with yours)
CREATE POLICY "Allow admin insert access on creations" ON creations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'melodykoh0818@gmail.com'
    )
  );

CREATE POLICY "Allow admin update access on creations" ON creations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'melodykoh0818@gmail.com'
    )
  ) WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'melodykoh0818@gmail.com'
    )
  );

CREATE POLICY "Allow admin delete access on creations" ON creations
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'melodykoh0818@gmail.com'
    )
  );

CREATE POLICY "Allow admin insert access on photos" ON photos
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'melodykoh0818@gmail.com'
    )
  );

CREATE POLICY "Allow admin update access on photos" ON photos
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'melodykoh0818@gmail.com'
    )
  ) WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'melodykoh0818@gmail.com'
    )
  );

CREATE POLICY "Allow admin delete access on photos" ON photos
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'melodykoh0818@gmail.com'
    )
  );