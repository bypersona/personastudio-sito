-- Expand the per-image layout catalogue: layout now holds an aspect key.
-- Rule: aspect > 1 fills the full column width, aspect <= 1 takes half.
UPDATE images SET layout = CASE layout
  WHEN 'wide' THEN '16-9'
  WHEN 'square' THEN '1-1'
  WHEN 'portrait' THEN '4-5'
  ELSE layout
END;