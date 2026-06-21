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


-- ═══════════════════════════════════════════
-- SARKARI SAATHI — E-COMMERCE MARKETPLACE TABLES
-- ═══════════════════════════════════════════

-- Table 6: Marketplace Groups (Exam Groups/Categories)
CREATE TABLE IF NOT EXISTS marketplace_groups (
  id TEXT PRIMARY KEY, -- Group name slug or custom ID (e.g. 'rajasthan-rsmssb-exams')
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 7: Marketplace Products (Notes, MCQs, Mock Tests)
CREATE TABLE IF NOT EXISTS marketplace_products (
  id TEXT PRIMARY KEY, -- Slug or custom UUID (e.g. 'rsmssb-patwari-notes')
  title TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  group_id TEXT REFERENCES marketplace_groups(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'Notes', 'MCQ', 'Mock Test'
  price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2) NOT NULL,
  pages INTEGER,
  language TEXT NOT NULL, -- 'Hindi', 'English', 'Bilingual'
  file_url TEXT, -- Link to Google Drive folder or PDF (manual delivery link)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 8: Marketplace Orders (Razorpay integration & Manual Email delivery tracking)
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  product_id TEXT REFERENCES marketplace_products(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  delivery_status TEXT DEFAULT 'pending', -- 'pending', 'delivered'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE marketplace_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to groups" ON marketplace_groups
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow public read access to products" ON marketplace_products
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow anyone to create an order" ON marketplace_orders
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow admin to manage all orders" ON marketplace_orders
  FOR ALL USING (TRUE);


