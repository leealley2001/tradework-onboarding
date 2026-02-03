-- ============================================
-- SUPABASE SETUP FOR CONTRACTOR ONBOARDING
-- Run this in your Supabase SQL Editor
-- Uses same Supabase instance as main TradeWorkToday site
-- ============================================

-- Create the onboarding table
CREATE TABLE IF NOT EXISTS onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  trade TEXT,
  access_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  current_step INTEGER DEFAULT 0,
  form_data JSONB DEFAULT '{}',
  signatures JSONB DEFAULT '{}',
  uploads JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_access_code ON onboarding(access_code);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_email ON onboarding(email);

-- Enable Row Level Security
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- Allow public access (contractors need to look up their own data)
CREATE POLICY "Allow public read" ON onboarding FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON onboarding FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON onboarding FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON onboarding FOR DELETE USING (true);

-- ============================================
-- STORAGE: Create bucket for uploaded documents
-- ============================================
-- Go to Supabase Dashboard > Storage > New Bucket
-- Name: onboarding-docs
-- Public: Yes

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get all pending onboardings
-- SELECT * FROM onboarding WHERE status = 'pending' ORDER BY created_at DESC;

-- Get completed onboardings
-- SELECT * FROM onboarding WHERE status = 'completed' ORDER BY completed_at DESC;

-- Get onboarding stats
-- SELECT status, COUNT(*) FROM onboarding GROUP BY status;
