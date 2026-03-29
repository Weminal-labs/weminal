-- Weekly review snapshots
CREATE TABLE weekly_snapshots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL UNIQUE,
  week_end   DATE NOT NULL,
  snapshot   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_snapshots_week_start ON weekly_snapshots (week_start DESC);

CREATE TRIGGER set_snapshots_updated_at
  BEFORE UPDATE ON weekly_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE weekly_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON weekly_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON weekly_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON weekly_snapshots FOR UPDATE USING (true);
