-- Per-image layout control: how each photo/video appears in the project page.
-- layout: wide (full column, 16:9) | square (half column, 1:1) | portrait (half column, 4:5)
-- mode:   cover (fill the box, may crop) | contain (show the whole file)
ALTER TABLE images ADD COLUMN layout TEXT NOT NULL DEFAULT 'square';
ALTER TABLE images ADD COLUMN mode TEXT NOT NULL DEFAULT 'cover';

-- Existing uploads: the first image of each project becomes the wide hero,
-- everything else stays square.
UPDATE images SET layout = 'wide' WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY sort_order ASC, created_at ASC) AS rn
    FROM images
  ) WHERE rn = 1
);