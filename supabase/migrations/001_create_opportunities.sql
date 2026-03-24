-- Crypto Opportunities Database Schema
-- Covers: hackathons, grants, fellowships, bounties

-- Enum: opportunity types
CREATE TYPE opportunity_type AS ENUM ('hackathon', 'grant', 'fellowship', 'bounty');

-- Enum: opportunity statuses (pipeline workflow)
CREATE TYPE opportunity_status AS ENUM (
  'discovered',
  'evaluating',
  'applying',
  'accepted',
  'in_progress',
  'submitted',
  'completed',
  'rejected',
  'cancelled'
);

-- Main table
CREATE TABLE opportunities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            opportunity_type NOT NULL,
  description     TEXT,
  status          opportunity_status NOT NULL DEFAULT 'discovered',
  organization    TEXT,
  website_url     TEXT,
  start_date      DATE,
  end_date        DATE,
  reward_amount   NUMERIC(15,2),
  reward_currency TEXT DEFAULT 'USD',
  reward_token    TEXT,
  blockchains     TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  links           JSONB DEFAULT '[]',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- B-tree indexes for equality lookups
CREATE INDEX idx_opportunities_type ON opportunities (type);
CREATE INDEX idx_opportunities_status ON opportunities (status);
CREATE INDEX idx_opportunities_organization ON opportunities (organization);
CREATE INDEX idx_opportunities_start_date ON opportunities (start_date);
CREATE INDEX idx_opportunities_end_date ON opportunities (end_date);

-- GIN indexes for array containment (@> operator)
CREATE INDEX idx_opportunities_blockchains ON opportunities USING GIN (blockchains);
CREATE INDEX idx_opportunities_tags ON opportunities USING GIN (tags);

-- GIN index for JSONB lookups
CREATE INDEX idx_opportunities_links ON opportunities USING GIN (links);

-- Generated column for full-text search on name + description
ALTER TABLE opportunities ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
) STORED;

CREATE INDEX idx_opportunities_fts ON opportunities USING GIN (fts);

-- Enable RLS (no policies = no anon access; service_role bypasses)
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
