-- Phase 5: Hacker Calendar — new tables for calendar blocks, milestones, proposals

-- Enum: block status
CREATE TYPE block_status AS ENUM ('planned', 'in_progress', 'done', 'skipped');

-- Enum: milestone type
CREATE TYPE milestone_type AS ENUM ('deadline', 'office_hour', 'announcement', 'checkpoint', 'other');

-- Enum: proposal status
CREATE TYPE proposal_status AS ENUM ('draft', 'submitted', 'accepted', 'rejected');

-- Calendar blocks — time-blocking for opportunities
CREATE TABLE calendar_blocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  date            DATE NOT NULL,
  slot            TEXT NOT NULL DEFAULT 'AM' CHECK (slot IN ('AM', 'PM', 'ALL_DAY')),
  hours           NUMERIC(3,1) DEFAULT 4 CHECK (hours >= 0.5 AND hours <= 12),
  notes           TEXT,
  status          block_status NOT NULL DEFAULT 'planned',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blocks_date ON calendar_blocks (date);
CREATE INDEX idx_blocks_opportunity ON calendar_blocks (opportunity_id);
CREATE INDEX idx_blocks_status ON calendar_blocks (status);

CREATE TRIGGER set_blocks_updated_at
  BEFORE UPDATE ON calendar_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;

-- Milestones — key dates for opportunities
CREATE TABLE milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  date            DATE NOT NULL,
  time            TIME,
  type            milestone_type NOT NULL DEFAULT 'other',
  links           JSONB DEFAULT '[]',
  notes           TEXT,
  completed       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestones_opportunity ON milestones (opportunity_id);
CREATE INDEX idx_milestones_date ON milestones (date);
CREATE INDEX idx_milestones_type ON milestones (type);

CREATE TRIGGER set_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Proposals — grant/hack proposal drafts
CREATE TABLE proposals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  content         TEXT,
  status          proposal_status NOT NULL DEFAULT 'draft',
  submission_url  TEXT,
  links           JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposals_opportunity ON proposals (opportunity_id);
CREATE INDEX idx_proposals_status ON proposals (status);

CREATE TRIGGER set_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
