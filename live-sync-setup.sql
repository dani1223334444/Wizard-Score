-- Live Sync Setup for Wizard Score App
-- Run this in your Supabase SQL Editor

-- Enable real-time for the games table
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- Create a policy to allow real-time subscriptions
CREATE POLICY "Enable real-time for games" ON games
FOR SELECT USING (true);

-- Add game_code column if it doesn't exist
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_code TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;

-- Create index for faster game code lookups
CREATE INDEX IF NOT EXISTS idx_games_game_code ON games(game_code);

-- Update existing games to have game codes (optional)
-- UPDATE games SET game_code = UPPER(SUBSTRING(MD5(id::text), 1, 6)) WHERE game_code IS NULL;

-- Grant necessary permissions
GRANT SELECT ON games TO authenticated;
GRANT SELECT ON games TO anon;
