-- Check for any remaining duplicates after our cleanup
-- This will help us see if Lloyd's energy dragon has duplicates in the database

SELECT 
  creation_id,
  url,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ' ORDER BY id) as photo_ids,
  RIGHT(url, 50) as filename_suffix
FROM photos 
GROUP BY creation_id, url 
HAVING COUNT(*) > 1
ORDER BY creation_id, url;

-- Also check for Lloyd's energy dragon specifically
SELECT 
  c.name,
  c.date_added,
  p.id,
  RIGHT(p.url, 50) as filename_suffix,
  p.media_type
FROM creations c
JOIN photos p ON c.id = p.creation_id
WHERE c.name ILIKE '%lloyd%' OR c.name ILIKE '%dragon%' OR c.name ILIKE '%energy%'
ORDER BY c.date_added, p.id;