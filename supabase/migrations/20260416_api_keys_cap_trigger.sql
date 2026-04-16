-- Enforce the 10 active API keys per user cap at the database level.
-- The app-level check in src/api/routes/me.ts is racy: two concurrent POST /me/keys
-- requests can both pass the count check and insert an 11th key before either commits.
-- This trigger closes that window by re-counting inside the same transaction as the insert.

CREATE OR REPLACE FUNCTION enforce_api_key_cap()
RETURNS TRIGGER AS $$
DECLARE
  active_count INT;
BEGIN
  -- Only check on INSERT of a key that is active (not pre-revoked)
  IF NEW.revoked_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*)
  INTO active_count
  FROM api_keys
  WHERE user_id = NEW.user_id
    AND revoked_at IS NULL;

  IF active_count >= 10 THEN
    RAISE EXCEPTION 'API key cap exceeded: user already has 10 active keys'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS api_keys_cap_trigger ON api_keys;
CREATE TRIGGER api_keys_cap_trigger
  BEFORE INSERT ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION enforce_api_key_cap();
