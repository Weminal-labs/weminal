-- Phase 6: Add bootcamp as 5th opportunity type with parent hackathon link
-- Bootcamps can optionally reference a parent hackathon via self-referential FK

-- T111: Add 'bootcamp' to opportunity_type enum
ALTER TYPE opportunity_type ADD VALUE IF NOT EXISTS 'bootcamp';

-- T112: Add parent_hackathon_id column with FK, constraint, and index
ALTER TABLE opportunities
  ADD COLUMN parent_hackathon_id UUID REFERENCES opportunities(id) ON DELETE SET NULL;

-- Only bootcamps can have a parent_hackathon_id
ALTER TABLE opportunities
  ADD CONSTRAINT bootcamp_parent_check CHECK (
    parent_hackathon_id IS NULL OR type = 'bootcamp'
  );

-- Partial index for fast bootcamp-by-hackathon lookups
CREATE INDEX idx_parent_hackathon ON opportunities (parent_hackathon_id)
  WHERE parent_hackathon_id IS NOT NULL;
