-- Add format (in_person/online/hybrid) and location fields

ALTER TABLE opportunities
  ADD COLUMN format TEXT DEFAULT 'online',
  ADD COLUMN location TEXT;

-- Index for filtering by format
CREATE INDEX idx_format ON opportunities (format);
