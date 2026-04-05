-- Remove duplicate opportunities, keeping the earliest created record per group.
-- Dedup logic: same website_url (non-empty) OR same name (case-insensitive).

-- Step 1: Remove duplicates grouped by website_url (keep oldest)
DELETE FROM opportunities
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY lower(trim(website_url))
        ORDER BY created_at ASC
      ) AS rn
    FROM opportunities
    WHERE website_url IS NOT NULL AND trim(website_url) <> ''
  ) ranked
  WHERE rn > 1
);

-- Step 2: Remove duplicates grouped by name (case-insensitive) for records
-- without a website_url (keep oldest)
DELETE FROM opportunities
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY lower(trim(name))
        ORDER BY created_at ASC
      ) AS rn
    FROM opportunities
    WHERE website_url IS NULL OR trim(website_url) = ''
  ) ranked
  WHERE rn > 1
);

-- Add a unique index on website_url to prevent future duplicates at the DB level
CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunities_website_url_unique
  ON opportunities (lower(trim(website_url)))
  WHERE website_url IS NOT NULL AND trim(website_url) <> '';
