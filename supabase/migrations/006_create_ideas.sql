-- Ideas Pool: curated project ideas for hackathons and grants
-- Run after 005_create_weekly_snapshots.sql

CREATE TABLE ideas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  tagline           TEXT NOT NULL,

  -- Classification
  category          TEXT NOT NULL DEFAULT 'dapp',
  track             TEXT NOT NULL DEFAULT 'defi',
  difficulty        TEXT NOT NULL DEFAULT 'intermediate',
  tags              TEXT[] NOT NULL DEFAULT '{}',

  -- Content
  key_points        TEXT[] NOT NULL DEFAULT '{}',
  problem           TEXT,

  -- Signals (JSONB)
  market_signal     JSONB NOT NULL DEFAULT '{}',
  community_signal  JSONB NOT NULL DEFAULT '{}',

  -- Build guide (JSONB)
  build_guide       JSONB NOT NULL DEFAULT '{}',

  -- Chain support
  supported_chains  TEXT[] NOT NULL DEFAULT '{}',
  chain_overrides   JSONB NOT NULL DEFAULT '{}',

  -- Source / attribution
  source_type       TEXT,
  source_url        TEXT,
  source_author     TEXT,
  source_note       TEXT,

  -- Flags
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  votes             INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reuse existing updated_at trigger function
CREATE TRIGGER set_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_ideas_category         ON ideas (category);
CREATE INDEX idx_ideas_track            ON ideas (track);
CREATE INDEX idx_ideas_difficulty       ON ideas (difficulty);
CREATE INDEX idx_ideas_is_featured      ON ideas (is_featured) WHERE is_featured = true;
CREATE INDEX idx_ideas_votes            ON ideas (votes DESC);
CREATE INDEX idx_ideas_tags             ON ideas USING GIN (tags);
CREATE INDEX idx_ideas_supported_chains ON ideas USING GIN (supported_chains);
CREATE INDEX idx_ideas_created_at       ON ideas (created_at DESC);

-- Immutable helper required because array_to_string is STABLE, not IMMUTABLE,
-- and generated columns reject non-immutable expressions.
CREATE OR REPLACE FUNCTION ideas_fts_vector(
  p_title TEXT, p_tagline TEXT, p_problem TEXT,
  p_key_points TEXT[], p_tags TEXT[]
) RETURNS tsvector LANGUAGE sql IMMUTABLE AS $$
  SELECT to_tsvector('english'::regconfig,
    coalesce(p_title, '') || ' ' ||
    coalesce(p_tagline, '') || ' ' ||
    coalesce(p_problem, '') || ' ' ||
    coalesce(array_to_string(p_key_points, ' '), '') || ' ' ||
    coalesce(array_to_string(p_tags, ' '), '')
  )
$$;

-- Full-text search generated column
ALTER TABLE ideas ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  ideas_fts_vector(title, tagline, problem, key_points, tags)
) STORED;

CREATE INDEX idx_ideas_fts ON ideas USING GIN (fts);

-- RLS (service_role bypasses by default)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "ideas_public_read" ON ideas
  FOR SELECT USING (true);

-- Atomic vote increment (avoids read-modify-write race)
CREATE OR REPLACE FUNCTION increment_idea_votes(idea_slug TEXT)
RETURNS void AS $$
  UPDATE ideas SET votes = votes + 1 WHERE slug = idea_slug;
$$ LANGUAGE sql;
