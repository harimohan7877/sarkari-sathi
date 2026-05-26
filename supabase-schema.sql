-- ═══════════════════════════════════════════
-- SARKARI SAATHI V3 — COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- Table 1: User Profiles (auth ke baad banta hai)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  phone TEXT,
  city TEXT,
  district TEXT,
  state TEXT DEFAULT 'rajasthan',
  age INTEGER,
  education TEXT,
  category TEXT,
  gender TEXT,
  has_cet_graduate BOOLEAN DEFAULT FALSE,
  has_cet_senior_secondary BOOLEAN DEFAULT FALSE,
  has_rscit BOOLEAN DEFAULT FALSE,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP,
  ai_messages_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Guest Sessions (temporary — login se pehle)
CREATE TABLE guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  name TEXT,
  city TEXT,
  state TEXT DEFAULT 'rajasthan',
  age INTEGER,
  education TEXT,
  category TEXT,
  gender TEXT,
  has_cet_graduate BOOLEAN DEFAULT FALSE,
  has_cet_senior_secondary BOOLEAN DEFAULT FALSE,
  has_rscit BOOLEAN DEFAULT FALSE,
  ai_messages_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Table 3: AI Chat History
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  guest_session_id UUID REFERENCES guest_sessions(id) ON DELETE CASCADE,
  exam_id TEXT,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 4: Saved Exams (logged in users ke liye)
CREATE TABLE saved_exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  saved_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, exam_id)
);

-- Table 5: Payments
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  amount INTEGER DEFAULT 3000,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS (Row Level Security) enable karo
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Guest sessions — public access (anon key se)
CREATE POLICY "Anyone can create guest session"
  ON guest_sessions FOR INSERT
  WITH CHECK (TRUE);

-- NOTE: SELECT and UPDATE are disabled for public/anon roles for security.
-- Next.js backend uses supabaseAdmin client (service role) to query and update guest sessions safely.


-- Chat messages policies
CREATE POLICY "Users can read own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Saved exams policies
CREATE POLICY "Users can read own saved exams"
  ON saved_exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved exams"
  ON saved_exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved exams"
  ON saved_exams FOR DELETE
  USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (TRUE);

-- Function: Auto-create profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════
-- SARKARI SAATHI V3 — ADMIN PANEL UPDATES
-- ═══════════════════════════════════════════

-- 1. Add is_admin field to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create Admin Settings Table for AI Provider & API Keys
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_provider TEXT NOT NULL DEFAULT 'openrouter',
  gemini_key TEXT DEFAULT '',
  openai_key TEXT DEFAULT '',
  claude_key TEXT DEFAULT '',
  openrouter_key TEXT DEFAULT '',
  groq_key TEXT DEFAULT '',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Run migration if table exists but lacks groq_key
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS groq_key TEXT DEFAULT '';

-- RLS enable on admin_settings (By default, only service role has access since no policy is created)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Insert default row if none exists
INSERT INTO admin_settings (active_provider)
SELECT 'openrouter'
WHERE NOT EXISTS (SELECT 1 FROM admin_settings);

