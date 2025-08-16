-- Migration: Add video support to photos table
-- Run this in your Supabase SQL Editor after database-setup.sql

-- Add media_type column to photos table
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- Update existing records to have image type
UPDATE photos SET media_type = 'image' WHERE media_type IS NULL;

-- Add index for media type filtering if needed
CREATE INDEX IF NOT EXISTS idx_photos_media_type ON photos(media_type);

-- Update comments for clarity
COMMENT ON TABLE photos IS 'Stores both photo and video metadata for Lego creations';
COMMENT ON COLUMN photos.media_type IS 'Type of media: image or video';