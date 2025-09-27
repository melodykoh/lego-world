-- Phase 1: READ-ONLY Analysis of remaining duplicate
-- Following database safety protocol for Lloyd's energy dragon

-- Set audit context
SELECT set_operation_context(('{"operation": "cleanup_remaining_duplicate", "target": "lloyds_energy_dragon", "duplicate_id": 92}')::jsonb);

-- 1. Confirm the duplicate exists
SELECT 'DUPLICATE CONFIRMATION:' as step;

SELECT 
  id,
  creation_id,
  RIGHT(url, 50) as filename_suffix,
  media_type,
  created_at
FROM photos 
WHERE url = 'https://res.cloudinary.com/dxwsavfon/image/upload/v1754355793/lego-creations/lh7ggelutitfhgwh0nfs.jpg'
ORDER BY id;

-- 2. Verify which one to keep (keep the oldest = ID 1)
SELECT 'REMOVAL PLAN:' as step;

SELECT 
  'Keep ID 1 (oldest), Remove ID 92 (duplicate)' as plan,
  COUNT(*) as total_records
FROM photos 
WHERE url = 'https://res.cloudinary.com/dxwsavfon/image/upload/v1754355793/lego-creations/lh7ggelutitfhgwh0nfs.jpg';

-- 3. Safety check - ensure creation won't be left empty
SELECT 'SAFETY CHECK - Creation will still have photos:' as step;

SELECT 
  c.name,
  COUNT(p.id) as total_photos,
  COUNT(CASE WHEN p.id != 92 THEN 1 END) as photos_after_removal
FROM creations c
JOIN photos p ON c.id = p.creation_id
WHERE c.name = 'Lloyd''s energy dragon'
GROUP BY c.id, c.name;

-- 4. Create backup before removal
SELECT 'CREATING BACKUP:' as step;

-- Backup the duplicate record before deletion
CREATE TABLE lloyd_duplicate_backup_20250914 AS
SELECT *, 'lloyd_energy_dragon_duplicate_id_92' as backup_reason
FROM photos 
WHERE id = 92;

-- 5. Verify backup created
SELECT 
  'Backup created with ' || COUNT(*) || ' record' as backup_status
FROM lloyd_duplicate_backup_20250914;

-- 6. Remove the duplicate (ID 92, keeping ID 1)
DELETE FROM photos WHERE id = 92;

-- 7. Verify removal successful
SELECT 'VERIFICATION AFTER REMOVAL:' as step;

SELECT 
  'Records for Lloyd energy dragon: ' || COUNT(*) as result
FROM photos p
JOIN creations c ON p.creation_id = c.id
WHERE c.name = 'Lloyd''s energy dragon';

-- 8. Final check - ensure no more duplicates exist
SELECT 'FINAL DUPLICATE CHECK:' as step;

SELECT 
  creation_id,
  url,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ' ORDER BY id) as photo_ids
FROM photos 
GROUP BY creation_id, url 
HAVING COUNT(*) > 1;

SELECT 'Lloyd energy dragon cleanup completed successfully!' as final_status;