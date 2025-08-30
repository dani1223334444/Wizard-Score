-- Supabase Database Setup for Wizard Score App
-- Run this in your Supabase SQL Editor

-- Create the games table
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  players JSONB NOT NULL,
  rounds JSONB NOT NULL DEFAULT '[]',
  current_round INTEGER NOT NULL DEFAULT 1,
  total_rounds INTEGER NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  rules JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_updated_at ON games(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_is_complete ON games(is_complete);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for now - you can restrict this later)
CREATE POLICY "Allow all operations" ON games
  FOR ALL USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at 
  BEFORE UPDATE ON games 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for game statistics
CREATE OR REPLACE VIEW game_stats AS
SELECT 
  COUNT(*) as total_games,
  COUNT(*) FILTER (WHERE is_complete = true) as completed_games,
  COUNT(*) FILTER (WHERE is_complete = false) as active_games,
  AVG(total_rounds) as avg_rounds_per_game
FROM games;

-- Grant necessary permissions
GRANT ALL ON games TO anon;
GRANT ALL ON games TO authenticated;
GRANT ALL ON game_stats TO anon;
GRANT ALL ON game_stats TO authenticated;

