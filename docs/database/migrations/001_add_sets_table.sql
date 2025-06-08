-- Migration: Add sets table for MTG set release dates
-- This table stores basic information about MTG sets for date sorting and deck analysis

-- Create sets table
CREATE TABLE IF NOT EXISTS sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  released_at DATE,
  set_type TEXT,
  digital BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sets_set_code ON sets(set_code);
CREATE INDEX IF NOT EXISTS idx_sets_released_at ON sets(released_at);
CREATE INDEX IF NOT EXISTS idx_sets_digital ON sets(digital);

-- Add comments for documentation
COMMENT ON TABLE sets IS 'MTG sets with release dates for deck dating and analysis';
COMMENT ON COLUMN sets.set_code IS 'Three-letter set code (e.g., "neo", "snc")';
COMMENT ON COLUMN sets.name IS 'Full set name (e.g., "Kamigawa: Neon Dynasty")';
COMMENT ON COLUMN sets.released_at IS 'Set release date for chronological sorting';
COMMENT ON COLUMN sets.set_type IS 'Set type from Scryfall (e.g., "expansion", "core", "alchemy")';
COMMENT ON COLUMN sets.digital IS 'Whether this is a digital-only set';

-- Enable Row Level Security (RLS) for multi-user safety
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users (sets are public data)
CREATE POLICY "Allow read access to sets" ON sets
  FOR SELECT
  USING (true);

-- Create policy to allow insert/update only for authenticated users
-- (In practice, only the import process should write to this table)
CREATE POLICY "Allow insert/update for authenticated users" ON sets
  FOR ALL
  USING (auth.role() = 'authenticated');
