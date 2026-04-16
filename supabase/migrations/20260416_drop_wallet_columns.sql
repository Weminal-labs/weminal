-- Wallet linking feature dropped. user_profiles keeps its shell for future
-- profile fields (handle, bio, display_name, etc.).

ALTER TABLE user_profiles DROP COLUMN IF EXISTS solana_wallet;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS evm_wallet;
