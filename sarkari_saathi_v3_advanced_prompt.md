# SARKARI SAATHI — VERSION 3.0 MASTER PROMPT
## Complete Advanced System | Auth + Payment + Study Material
## Claude Code ke liye — EK TASK EK BAAR

---

> ⚠️ GOLDEN RULE:
> Ek section complete karo → "Done. Next?" bolo → phir agla.
> Kabhi 2 sections ek saath mat karo.
> Koi assumption nahi — kuch missing ho toh turant pucho.

---

# ════════════════════════════════════
# SYSTEM ARCHITECTURE OVERVIEW
# (Pehle padho — phir build karo)
# ════════════════════════════════════

```
TECH STACK (final — change nahi karna):
├── Frontend:   Next.js 14 (App Router)
├── Auth:       Supabase Auth (email OTP — no password needed)
├── Database:   Supabase (PostgreSQL — free tier)
├── AI:         Claude API (Haiku + Sonnet smart routing)
├── Payments:   Razorpay (₹30 one-time)
├── Styling:    Tailwind CSS
├── Fonts:      Noto Sans Devanagari
└── Deploy:     Vercel

USER TIERS:
Guest    → 5 AI questions, 1 exam preview (no study material)
Registered → 10 AI questions total, full exam info, basic resources
Paid (₹30) → Unlimited AI, complete study material, PYQs, syllabus

PAGES:
/            → Landing + Profile Form
/results     → Eligible exams + resources list
/exam/[id]   → Single exam deep dive (chat + info + study material)
/auth        → Login/Signup page
/payment     → ₹30 payment page
/dashboard   → Logged-in user dashboard (saved exams, history)
```

---

# ════════════════════════════════════
# TASK 1 — SUPABASE SETUP + DATABASE
# ════════════════════════════════════

## Step 1A: Supabase project banao

```
1. supabase.com → New Project
2. Project name: sarkari-saathi
3. Password: (strong generate karo — save karo)
4. Region: Southeast Asia (Singapore — India ke liye best)
5. Free plan select karo
```

## Step 1B: .env.local mein add karo

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxx  (secret — never expose)
ANTHROPIC_API_KEY=sk-ant-xxxxx
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
NEXT_PUBLIC_APP_URL=https://sarkari-saathi.vercel.app
```

## Step 1C: Supabase SQL Editor mein yeh tables banao

```sql
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
  name TEXT,                    -- optional, jo user ne diya
  city TEXT,                    -- optional location
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
  exam_id TEXT,                 -- konse exam ke baare mein chat hua
  role TEXT NOT NULL,           -- 'user' ya 'assistant'
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
  amount INTEGER DEFAULT 3000,  -- paise mein (₹30 = 3000 paise)
  status TEXT DEFAULT 'pending',-- pending/success/failed
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

CREATE POLICY "Anyone can read own guest session by token"
  ON guest_sessions FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone can update own guest session"
  ON guest_sessions FOR UPDATE
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
```

## Step 1D: lib/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Client-side (browser)
export const supabase = createClientComponentClient();

// Server-side (API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Message limits
export const MESSAGE_LIMITS = {
  guest: 5,        // Bina login — 5 messages
  registered: 10,  // Login ke baad free — 10 total
  paid: 999        // ₹30 ke baad — unlimited
};

export async function getUserTier(userId?: string, guestToken?: string) {
  if (userId) {
    const { data } = await supabase
      .from('user_profiles')
      .select('is_paid, ai_messages_used')
      .eq('id', userId)
      .single();

    if (data?.is_paid) return { tier: 'paid', messagesUsed: data.ai_messages_used, limit: 999 };
    return { tier: 'registered', messagesUsed: data?.ai_messages_used || 0, limit: 10 };
  }

  if (guestToken) {
    const { data } = await supabase
      .from('guest_sessions')
      .select('ai_messages_used')
      .eq('session_token', guestToken)
      .single();
    return { tier: 'guest', messagesUsed: data?.ai_messages_used || 0, limit: 5 };
  }

  return { tier: 'guest', messagesUsed: 0, limit: 5 };
}
```

---

# TASK 1 DONE SIGNAL → "Task 1 complete. Database ready. Task 2?"

---

# ════════════════════════════════════
# TASK 2 — AUTH SYSTEM (Email OTP)
# ════════════════════════════════════

## 2A. app/auth/page.tsx — Login/Signup Page

Design:
- Background: `#EEF2F8`
- Centered card: white, 400px max, rounded-2xl, shadow
- Tiranga stripe at top of card
- No password — sirf email + OTP (simple!)

```tsx
'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Step 1: Email bhejna
  async function sendOTP() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError('Email galat hai ya kuch problem aa gayi। Dobara try karo।');
    } else {
      setStep('otp');
    }
    setLoading(false);
  }

  // Step 2: OTP verify
  async function verifyOTP() {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });
    if (error) {
      setError('Code galat hai। Email mein aaya 6-digit code daalo।');
    } else {
      // Redirect back to where user was
      const returnTo = sessionStorage.getItem('returnTo') || '/';
      router.push(returnTo);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#EEF2F8] flex items-center justify-center p-4">
      {/* Tiranga stripe at very top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808]" />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] p-6 text-center">
            <div className="text-4xl mb-2">🏛️</div>
            <h1 className="text-white text-xl font-bold">सरकारी साथी</h1>
            <p className="text-white/75 text-sm mt-1">
              Login करें और पूरी जानकारी पाएं
            </p>
          </div>

          {/* Benefits bar */}
          <div className="bg-green-50 border-b border-green-100 px-6 py-3">
            <p className="text-green-700 text-sm text-center font-medium">
              ✅ Login के बाद: 10 AI सवाल FREE + पूरा Study Material
            </p>
          </div>

          <div className="p-6">
            {step === 'email' ? (
              <>
                <h2 className="text-[#0F2B5B] font-bold text-lg mb-1">
                  Email से Login करें
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  No password! Email पर 6-digit code आएगा।
                </p>

                <label className="block text-sm font-semibold text-[#0F2B5B] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="aapka@email.com"
                  className="w-full h-12 border-2 border-[#C5D0E0] rounded-xl px-4 text-base text-gray-900 bg-gray-50 focus:border-[#1847A6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1847A6]/10 mb-4"
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={sendOTP}
                  disabled={!email || loading}
                  className="w-full h-12 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ भेज रहे हैं...' : 'Code भेजो 📧'}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  कोई password नहीं। कोई personal data नहीं। सिर्फ email।
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[#0F2B5B] font-bold text-lg mb-1">
                  Code Enter करें
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {email} पर 6-digit code भेजा गया है
                </p>

                <div className="flex gap-2 mb-4">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-full h-14 border-2 border-[#C5D0E0] rounded-xl text-center text-xl font-bold text-[#0F2B5B] focus:border-[#FF6B00] focus:outline-none"
                      value={otp[i] || ''}
                      onChange={e => {
                        const newOtp = otp.split('');
                        newOtp[i] = e.target.value;
                        setOtp(newOtp.join(''));
                        // Auto-focus next
                        if (e.target.value && i < 5) {
                          const next = e.target.parentElement?.children[i+1] as HTMLInputElement;
                          next?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={verifyOTP}
                  disabled={otp.length < 6 || loading}
                  className="w-full h-12 bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {loading ? '⏳ Verify हो रहा है...' : 'Login करें ✅'}
                </button>

                <button
                  onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                >
                  ← वापस जाएं
                </button>
              </>
            )}
          </div>
        </div>

        {/* Guest continue option */}
        <p className="text-center text-sm text-gray-500 mt-4">
          अभी नहीं?{' '}
          <button onClick={() => router.back()} className="text-[#1847A6] font-medium">
            5 सवाल Guest के रूप में पूछें →
          </button>
        </p>
      </div>
    </div>
  );
}
```

## 2B. Middleware — Route Protection

```typescript
// middleware.ts (root mein)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  // Session refresh — dashboard pe redirect logic
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/payment/:path*']
};
```

## 2C. components/AuthPromptModal.tsx

5 messages ke baad yeh popup aayega:

```tsx
// Modal design:
// Blur overlay
// White card center
// Title: "5 सवाल हो गए! 🎉"
// Subtitle: "Login करें और 5 और FREE सवाल पाएं"
// Benefits list:
//   ✅ 5 और AI सवाल FREE
//   ✅ पूरा Study Material
//   ✅ Previous Year Papers
//   ✅ Syllabus PDF
//   ✅ Exam save करें
// Button 1 (saffron): "Login / Sign Up करें" → /auth
// Button 2 (grey): "₹30 दो और Unlimited पाएं" → /payment
// Small link: "बाद में" (closes modal, shows limited content)

interface AuthPromptModalProps {
  onClose: () => void;
  reason: 'message_limit' | 'study_material' | 'save_exam';
}
```

---

# TASK 2 DONE → "Task 2 complete. Auth ready. Task 3?"

---

# ════════════════════════════════════
# TASK 3 — PROFILE FORM (Landing Page)
# With name + location + enhanced UX
# ════════════════════════════════════

## 3A. app/page.tsx — Complete redesign

FORM SECTIONS (in order):

### Header:
```
[Tiranga 4px stripe]
[Header: 🏛️ सरकारी साथी | Login button (top right)]
```

Login button (top right of header):
```tsx
{user ? (
  <Link href="/dashboard">
    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
      {user.email?.[0].toUpperCase()}
    </div>
  </Link>
) : (
  <Link href="/auth" className="text-white/90 text-sm border border-white/40 px-3 py-1 rounded-full hover:bg-white/10">
    Login
  </Link>
)}
```

### Form Card — 2 sections:

**Section A — Optional Personal Info (collapsed by default):**
```
[+ अपना नाम और शहर जोड़ें (optional)] ← expandable
  ↓ (expands)
  नाम (Name) — text input, placeholder "उदाहरण: Ramesh Kumar"
  शहर / जिला — text input, placeholder "उदाहरण: सरदारशहर, चुरू"

  Helper: "💡 यह जानकारी सिर्फ आपको personalized 
           अनुभव देने के लिए है — किसी के साथ share 
           नहीं होती।"
```

**Section B — Required Info:**
```
राज्य → Rajasthan (locked)
लिंग → [पुरुष 👨] [महिला 👩] (pill buttons)
उम्र → number input
शिक्षा → dropdown
श्रेणी → dropdown
```

**Section C — Optional Qualifications:**
```
[checkbox] RS-CIT / Computer Certificate है
[checkbox] CET Graduate Level qualify है
[checkbox] CET Sr. Secondary Level qualify है
```

**Submit:**
```
[योग्य भर्तियाँ ढूंढें 🔍] ← saffron button
🆓 पहले 5 सवाल बिल्कुल मुफ्त
```

### On Submit:
```typescript
async function handleSubmit(formData) {
  // 1. Create guest session in Supabase
  const sessionToken = crypto.randomUUID();
  await supabase.from('guest_sessions').insert({
    session_token: sessionToken,
    name: formData.name || null,
    city: formData.city || null,
    age: formData.age,
    education: formData.education,
    category: formData.category,
    gender: formData.gender,
    has_cet_graduate: formData.hasCET_graduate,
    has_cet_senior_secondary: formData.hasCET_senior_secondary,
    has_rscit: formData.hasRSCIT
  });

  // 2. Save token in sessionStorage
  sessionStorage.setItem('guestToken', sessionToken);
  sessionStorage.setItem('userProfile', JSON.stringify(formData));

  // 3. Run eligibility check
  const eligible = checkEligibility(formData, examsData.exams);

  // 4. Navigate to results
  router.push('/results');
}
```

---

# TASK 3 DONE → "Task 3 complete. Form ready. Task 4?"

---

# ════════════════════════════════════
# TASK 4 — RESULTS PAGE (/results)
# Eligible exams + Courses + Resources
# ════════════════════════════════════

## 4A. PAGE LAYOUT (top to bottom)

```
┌─────────────────────────────────────────┐
│ HEADER (sticky)                          │
├─────────────────────────────────────────┤
│ GREETING BANNER                          │
│ "नमस्ते [name]! आप X भर्तियों के        │
│  लिए योग्य हैं।"                         │
├─────────────────────────────────────────┤
│ TOP OFFICIAL WEBSITES (horizontal scroll)│
│ [RPSC] [RSMSSB] [SSO] [Police] [BSTC]   │
├─────────────────────────────────────────┤
│ ELIGIBLE EXAMS LIST                      │
│ ┌─ ExamCard 1 ─────────────────────┐    │
│ │ [Select karo → Chat shuru] button │    │
│ └───────────────────────────────────┘    │
│ ┌─ ExamCard 2 ───────────────────── ┐    │
│ └───────────────────────────────────┘    │
├─────────────────────────────────────────┤
│ FREE COURSES SECTION                     │
│ (locked for guests — blur + login CTA)   │
├─────────────────────────────────────────┤
│ STUDY MATERIAL SECTION                   │
│ (locked for guests)                      │
└─────────────────────────────────────────┘
```

## 4B. TOP OFFICIAL WEBSITES STRIP

Horizontal scroll, always visible:

```tsx
const TOP_WEBSITES = [
  {
    name: "RPSC",
    fullName: "राजस्थान लोक सेवा आयोग",
    url: "https://rpsc.rajasthan.gov.in",
    emoji: "🏛️",
    color: "#0F2B5B"
  },
  {
    name: "RSMSSB",
    fullName: "राजस्थान कर्मचारी चयन बोर्ड",
    url: "https://rsmssb.rajasthan.gov.in",
    emoji: "📋",
    color: "#1847A6"
  },
  {
    name: "SSO Portal",
    fullName: "Single Sign-On Rajasthan",
    url: "https://sso.rajasthan.gov.in",
    emoji: "🔐",
    color: "#138808"
  },
  {
    name: "Rajasthan Police",
    fullName: "राजस्थान पुलिस",
    url: "https://police.rajasthan.gov.in",
    emoji: "👮",
    color: "#8B0000"
  },
  {
    name: "BSTC Portal",
    fullName: "BSTC / Pre D.El.Ed",
    url: "https://bstcrajasthan.in",
    emoji: "📚",
    color: "#6B21A8"
  },
  {
    name: "Recruitment Portal",
    fullName: "Rajasthan Recruitment",
    url: "https://recruitment.rajasthan.gov.in",
    emoji: "💼",
    color: "#FF6B00"
  },
  {
    name: "Jan Suchna",
    fullName: "जन सूचना पोर्टल",
    url: "https://jansoochna.rajasthan.gov.in",
    emoji: "ℹ️",
    color: "#0369A1"
  }
];

// Card design (each website):
// Small emoji circle top
// Name bold
// fullName small grey
// Click = opens in new tab
// Horizontal scroll strip
// bg: white, border: 1px navy/10, rounded-xl, shadow-sm
```

## 4C. EXAM CARD (on results page)

```tsx
// Each eligible exam:
interface ExamCardProps {
  exam: Exam;
  reasons: string[];
  warnings: string[];
  onSelect: (examId: string) => void;
  isLocked: boolean; // guest ke liye true after 1st card
}

// Card design:
// Top: Status badge (OPEN/UPCOMING) + board name
// Title: Exam name (bold, navy)
// Eligibility reasons: green checkmarks
// Warnings: orange warning icons
// Deadline chip (red if < 7 days)
// Fee row: ₹600 / ₹400
//
// ACTION BUTTON:
// "💬 इस भर्ती के बारे में Chat करें →"
// Color: saffron gradient
// Click → /exam/[id] page
//
// DISCLAIMER: small orange box at bottom

// If locked (2nd+ card for guests):
// Blur overlay
// "🔒 Login करें — बाकी भर्तियाँ देखें"
// Button → /auth
```

## 4D. FREE COURSES SECTION

```tsx
// Title: "📺 इन भर्तियों की FREE तैयारी"
// Subtitle: "YouTube पर सब मुफ्त है — paid coaching की जरूरत नहीं"

const COURSES_BY_EXAM = {
  'rsmssb-patwari-2026': [
    {
      type: 'youtube',
      name: 'KGS Rajasthan Exams — पटवारी Complete Course',
      description: 'Daily live classes, mock tests, Revenue Law special',
      url: 'https://www.youtube.com/@KGSRajasthanExams',
      badge: '🆓 FREE',
      badgeColor: 'green',
      subscribers: '5 lakh+',
      language: 'Hindi',
      bestFor: 'Patwari exam complete'
    },
    {
      type: 'youtube',
      name: 'Utkarsh Classes — Revenue Law & Rajasthan GK',
      description: 'Subhash Charan Sir — Rajasthan ka sabse popular GK teacher',
      url: 'https://www.youtube.com/@UtkarshClasses',
      badge: '🆓 FREE',
      badgeColor: 'green',
      subscribers: '50 lakh+',
      language: 'Hindi',
      bestFor: 'Rajasthan History, Geography, Revenue Law'
    },
    {
      type: 'website',
      name: 'Adda247 — Patwari Previous Year Papers',
      description: 'Free PDF download — सभी साल के paper',
      url: 'https://www.adda247.com/exams/rajasthan/rajasthan-patwari-previous-year-paper/',
      badge: '📄 FREE PDF',
      badgeColor: 'blue',
      language: 'Hindi + English',
      bestFor: 'PYQ practice'
    },
    {
      type: 'website',
      name: 'ToppersExam — Free Mock Test',
      description: 'Online mock test — exam jaise environment mein practice',
      url: 'https://toppersexam.com/state-level-exams/rajasthan-patwari-question-paper',
      badge: '🧪 Mock Test',
      badgeColor: 'purple',
      language: 'Hindi',
      bestFor: 'Time management practice'
    }
  ],
  'rpsc-ras-2026': [
    {
      type: 'youtube',
      name: 'Study IQ — Current Affairs & GS',
      description: 'Daily current affairs, Polity, Economy — 13M subscribers',
      url: 'https://www.youtube.com/@StudyIQ',
      badge: '🆓 FREE',
      badgeColor: 'green',
      subscribers: '1.3 crore+',
      language: 'Hindi',
      bestFor: 'Current Affairs, GS for RAS'
    },
    {
      type: 'youtube',
      name: 'Utkarsh Classes — Rajasthan GK',
      description: 'RAS ke liye best Rajasthan History & Geography',
      url: 'https://www.youtube.com/@UtkarshClasses',
      badge: '🆓 FREE',
      badgeColor: 'green',
      subscribers: '50 lakh+',
      language: 'Hindi',
      bestFor: 'Rajasthan GK — RAS special'
    },
    {
      type: 'website',
      name: 'RPSC Official — Previous Papers',
      description: 'RPSC ki official website par free papers available hain',
      url: 'https://rpsc.rajasthan.gov.in/previousquestionpapers.aspx',
      badge: '🏛️ Official',
      badgeColor: 'navy',
      language: 'Hindi',
      bestFor: 'Authentic PYQs'
    }
  ],
  'rsmssb-ldc-2026': [
    {
      type: 'youtube',
      name: 'KGS Rajasthan Exams — LDC Complete',
      description: 'LDC full syllabus, typing tips, daily classes',
      url: 'https://www.youtube.com/@KGSRajasthanExams',
      badge: '🆓 FREE',
      badgeColor: 'green',
      language: 'Hindi',
      bestFor: 'LDC full preparation'
    },
    {
      type: 'website',
      name: 'Adda247 — LDC Syllabus & Papers',
      description: 'Official syllabus PDF + previous year papers',
      url: 'https://www.adda247.com/exams/rajasthan/rajasthan-ldc-syllabus/',
      badge: '📄 Syllabus',
      badgeColor: 'blue',
      language: 'Hindi + English',
      bestFor: 'Syllabus understanding'
    },
    {
      type: 'website',
      name: 'ShikshaGuru — LDC Previous Papers',
      description: 'Year-wise LDC papers with answers',
      url: 'https://shikshaguru.org/rajasthan-ldc-previous-question-papers/',
      badge: '📝 PYQ',
      badgeColor: 'purple',
      language: 'Hindi',
      bestFor: 'PYQ with answers'
    }
  ],
  'rajasthan-police-constable-2026': [
    {
      type: 'youtube',
      name: 'KGS Rajasthan Exams — Police Exam',
      description: 'Written test + physical test tips',
      url: 'https://www.youtube.com/@KGSRajasthanExams',
      badge: '🆓 FREE',
      badgeColor: 'green',
      language: 'Hindi',
      bestFor: 'Police exam GK + Strategy'
    },
    {
      type: 'youtube',
      name: 'Exampur — Reasoning & Maths',
      description: '9M subscribers — Vivek Sir ke shortcuts',
      url: 'https://www.youtube.com/@Exampur',
      badge: '🆓 FREE',
      badgeColor: 'green',
      subscribers: '90 lakh+',
      language: 'Hindi',
      bestFor: 'Reasoning, Maths for Police'
    }
  ],
  'bstc-2026': [
    {
      type: 'youtube',
      name: 'Raithan Classes — BSTC Special',
      description: 'BSTC complete preparation, Teaching Aptitude',
      url: 'https://www.youtube.com/channel/UCIkHMs9yy7mmPsMSBCUoG8A',
      badge: '🆓 FREE',
      badgeColor: 'green',
      language: 'Hindi',
      bestFor: 'BSTC — Teaching aptitude + Rajasthan GK'
    }
  ]
};

// Course Card Design:
// Left: Type icon (📺 for YouTube, 🌐 for website, 📄 for PDF)
// Center: Name (bold) + Description (small grey) + Language chip
// Right: Badge (FREE/PDF/Mock Test) + Arrow link
// Background: varies by type:
//   YouTube: #FFF5F5 (light red)
//   Website: #F0F4FF (light blue)
//   PDF: #F0FFF4 (light green)
// On click: opens in new tab

// FOR GUESTS — blur overlay on courses:
// Frosted glass effect
// "🔒 Login करें और सभी FREE Courses देखें"
// Button → /auth
```

---

# TASK 4 DONE → "Task 4 complete. Results page ready. Task 5?"

---

# ════════════════════════════════════
# TASK 5 — EXAM DEEP DIVE (/exam/[id])
# Chat + Arrow + Full Info + Study Material
# ════════════════════════════════════

## 5A. PAGE LAYOUT

```
┌─────────────────────────────────────────┐
│ TOP: Official websites strip (sticky)    │
│ (same as results page — always visible)  │
├─────────────────────────────────────────┤
│ CHAT SECTION (60vh)                      │
│ ┌─────────────────────────────────────┐ │
│ │ Bot header: 🏛️ सरकारी साथी • Online │ │
│ ├─────────────────────────────────────┤ │
│ │ Messages area (scrollable)           │ │
│ ├─────────────────────────────────────┤ │
│ │ Quick reply chips                    │ │
│ ├─────────────────────────────────────┤ │
│ │ [Message counter: 3/5 बाकी]         │ │
│ │ Input bar                            │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ ⬇️ SCROLL DOWN FOR COMPLETE INFO ⬇️     │ ← Arrow CTA
│ नीचे देखें: Syllabus, PYQ, Documents... │
├─────────────────────────────────────────┤
│ EXAM COMPLETE INFO SECTION              │
│ (tabs: Overview | Syllabus | PYQ |      │
│        Documents | Important Links)      │
├─────────────────────────────────────────┤
│ STUDY MATERIAL SECTION                  │
│ (locked for guests)                     │
└─────────────────────────────────────────┘
```

## 5B. ARROW CTA COMPONENT

```tsx
// Sticky scroll indicator — appears after 3 chat messages
// Design:
// Bouncing down arrow animation
// Text: "⬇️ नीचे स्क्रॉल करें — Complete Syllabus, Previous Papers और सब कुछ"
// Background: navy gradient
// Position: between chat and info section
// On click: smooth scroll to #exam-info section

function ScrollArrowCTA() {
  return (
    <div
      className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] text-white text-center py-4 px-6 cursor-pointer"
      onClick={() => document.getElementById('exam-info')?.scrollIntoView({behavior: 'smooth'})}
    >
      <div className="animate-bounce text-2xl mb-1">⬇️</div>
      <p className="font-bold text-sm">नीचे देखें — Complete Syllabus, Papers और सब कुछ</p>
      <p className="text-white/70 text-xs mt-1">
        Eligibility • Documents • Syllabus • Previous Papers • Important Links
      </p>
    </div>
  );
}
```

## 5C. EXAM INFO TABS (below arrow)

```tsx
// Tab 1: Overview
// Exam name, board, status, vacancies
// Eligibility table (age, education, category-wise)
// Fee structure
// Selection process steps
// Important dates

// Tab 2: Syllabus
// Subject-wise syllabus
// Each subject with weightage percentage
// Link to official PDF
// Example: Patwari syllabus:
const PATWARI_SYLLABUS = {
  subjects: [
    {
      name: "राजस्थान का इतिहास, कला, संस्कृति",
      weightage: "25%",
      topics: ["राजपूत काल", "मुगल काल", "स्वतंत्रता आंदोलन", "कला-संस्कृति", "लोक देवता"]
    },
    {
      name: "राजस्थान का भूगोल",
      weightage: "20%",
      topics: ["जलवायु", "नदियाँ", "जिले", "खनिज", "पर्यटन"]
    },
    {
      name: "सामान्य हिंदी",
      weightage: "15%",
      topics: ["व्याकरण", "संधि-समास", "वाक्य शुद्धि", "मुहावरे"]
    },
    {
      name: "सामान्य अंग्रेजी",
      weightage: "10%",
      topics: ["Grammar basics", "Vocabulary", "Comprehension"]
    },
    {
      name: "गणित",
      weightage: "15%",
      topics: ["अंकगणित", "प्रतिशत", "अनुपात", "साधारण ब्याज"]
    },
    {
      name: "कम्प्यूटर ज्ञान",
      weightage: "10%",
      topics: ["MS Office", "Internet basics", "Hardware/Software"]
    },
    {
      name: "राजस्व कानून",
      weightage: "5%",
      topics: ["Rajasthan Tenancy Act", "Land Records", "Revenue Manual"]
    }
  ],
  official_pdf: "https://rsmssb.rajasthan.gov.in",
  note: "Exact weightage official notification mein dekho"
};

// Tab 3: Previous Year Papers
const PYQ_RESOURCES = {
  'rsmssb-patwari-2026': [
    {
      year: "2021",
      name: "Patwari Exam Paper 2021",
      url: "https://www.adda247.com/exams/rajasthan/rajasthan-patwari-previous-year-paper/",
      source: "Adda247 (Free)",
      type: "PDF"
    },
    {
      year: "Mock Test",
      name: "Online Mock Test (Free)",
      url: "https://toppersexam.com/state-level-exams/rajasthan-patwari-question-paper",
      source: "ToppersExam",
      type: "Online"
    },
    {
      year: "Official",
      name: "RSMSSB Official Papers",
      url: "https://rsmssb.rajasthan.gov.in",
      source: "RSMSSB Official",
      type: "Official"
    }
  ],
  'rpsc-ras-2026': [
    {
      year: "2016-2023",
      name: "RAS Previous Year Papers",
      url: "https://rpsc.rajasthan.gov.in/previousquestionpapers.aspx",
      source: "RPSC Official",
      type: "Official"
    }
  ]
};

// Tab 4: Documents
// Sorted list — General → Category-specific
// Each doc with:
//   Name (Hindi)
//   Kahan se milega
//   Kitne din lagenge

// Tab 5: Important Links
// Official notification PDF
// Apply link (SSO)
// Admit card link (when available)
// Result link (when available)
// Helpdesk contact

// LOCKED tabs for guests (blur):
// "🔒 Login करके पूरा Syllabus, PYQ और सब देखें"
```

## 5D. MESSAGE COUNTER UI

```tsx
// Chat ke neeche, input bar ke upar:
function MessageCounter({ used, limit, tier }) {
  const remaining = limit - used;

  if (tier === 'paid') return null; // Unlimited

  return (
    <div className={`px-4 py-2 flex items-center justify-between text-sm ${
      remaining <= 2 ? 'bg-red-50' : 'bg-blue-50'
    }`}>
      <span className={remaining <= 2 ? 'text-red-600' : 'text-[#1847A6]'}>
        {remaining <= 0 
          ? '❌ सवाल खत्म हो गए'
          : `💬 ${remaining} सवाल बाकी`
        }
        {tier === 'guest' && ' (Guest)'}
      </span>
      {remaining <= 2 && remaining > 0 && (
        <button className="text-[#FF6B00] font-medium text-xs">
          Login → 5 और FREE
        </button>
      )}
    </div>
  );
}
```

---

# TASK 5 DONE → "Task 5 complete. Exam page ready. Task 6?"

---

# ════════════════════════════════════
# TASK 6 — PAYMENT SYSTEM (₹30)
# Razorpay integration
# ════════════════════════════════════

## 6A. Razorpay Setup

```
1. razorpay.com → Sign up
2. Dashboard → API Keys → Generate
3. Key ID + Secret → .env.local mein daalo
4. Test mode pehle use karo
```

## 6B. app/api/payment/create-order/route.ts

```typescript
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const order = await razorpay.orders.create({
    amount: 3000, // ₹30 in paise
    currency: 'INR',
    notes: { userId, purpose: 'Sarkari Saathi Premium' }
  });

  // Save in DB
  await supabaseAdmin.from('payments').insert({
    user_id: userId,
    razorpay_order_id: order.id,
    amount: 3000,
    status: 'pending'
  });

  return NextResponse.json({ orderId: order.id, amount: 3000 });
}
```

## 6C. app/api/payment/verify/route.ts

```typescript
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function POST(req: NextRequest) {
  const { orderId, paymentId, signature, userId } = await req.json();

  // Verify signature
  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ success: false, error: 'Invalid payment' }, { status: 400 });
  }

  // Update payment
  await supabaseAdmin.from('payments').update({
    razorpay_payment_id: paymentId,
    status: 'success'
  }).eq('razorpay_order_id', orderId);

  // Upgrade user to paid
  await supabaseAdmin.from('user_profiles').update({
    is_paid: true,
    paid_at: new Date().toISOString()
  }).eq('id', userId);

  return NextResponse.json({ success: true });
}
```

## 6D. app/payment/page.tsx

```tsx
// Payment page design:
// Clean card center
// Price display: ₹30 (big, prominent)
// What you get:
//   ✅ Unlimited AI सवाल
//   ✅ Complete Study Material
//   ✅ Previous Year Papers
//   ✅ Syllabus PDF
//   ✅ Exam Info Save
//   ✅ Chat History
// Razorpay button
// Note: "एक बार का भुगतान — कोई subscription नहीं"
// Security: "🔒 Razorpay से secure payment"

// After success: confetti animation + redirect to /exam/[last-exam]

// NO self-cancel option — one-time payment only
// "Support ke liye: harimohan@sarkari-saathi.in"
```

---

# TASK 6 DONE → "Task 6 complete. Payment ready. Task 7?"

---

# ════════════════════════════════════
# TASK 7 — CHAT UPGRADE + AI FLOW
# Message limits + Auth prompts + Study panel
# ════════════════════════════════════

## 7A. Updated Chat Logic

```typescript
// app/api/chat/route.ts — Updated

async function handleChat(req: NextRequest) {
  const { messages, userProfile, examId, userId, guestToken } = await req.json();

  // 1. Get user tier
  const { tier, messagesUsed, limit } = await getUserTier(userId, guestToken);

  // 2. Check limit
  if (messagesUsed >= limit) {
    return NextResponse.json({
      error: 'LIMIT_REACHED',
      tier,
      action: tier === 'guest' ? 'LOGIN' : tier === 'registered' ? 'PAYMENT' : null
    }, { status: 429 });
  }

  // 3. Call AI
  const response = await callClaudeSmart(messages, userProfile, examId);

  // 4. Increment counter
  if (userId) {
    await supabaseAdmin.from('user_profiles')
      .update({ ai_messages_used: messagesUsed + 1 })
      .eq('id', userId);
  } else if (guestToken) {
    await supabaseAdmin.from('guest_sessions')
      .update({ ai_messages_used: messagesUsed + 1 })
      .eq('session_token', guestToken);
  }

  // 5. Save chat history (for logged in users)
  if (userId) {
    await supabaseAdmin.from('chat_messages').insert([
      { user_id: userId, exam_id: examId, role: 'user', content: messages.at(-1).content },
      { user_id: userId, exam_id: examId, role: 'assistant', content: response }
    ]);
  }

  // 6. Warning near limit
  const remaining = limit - messagesUsed - 1;
  const warning = remaining <= 2 ? `REMAINING_${remaining}` : null;

  return NextResponse.json({ response, remaining, warning });
}
```

## 7B. AI Auto-Prompt (at 4th message — guest)

```typescript
// Jab guest ka 4th message aaye — AI khud suggest kare

const AUTO_LOGIN_PROMPT = `
Yeh user ka 4th question hai (guest tier).
Jawab dene ke baad HAMESHA yeh add karo (natural tarike se):

---
💡 **आपके लिए एक सुझाव:**
आपके पास अभी 1 और FREE सवाल बचा है। Login करने पर 5 और FREE सवाल मिलेंगे — साथ ही पूरा Syllabus, Previous Year Papers और Study Material भी।

[Login करें → और जानकारी पाएं]

Login बिल्कुल आसान है — सिर्फ email और एक OTP।
---
`;
```

## 7C. Personal Info Collection (AI ke through)

```typescript
// Jab user ne form mein naam nahi diya tha
// Aur task complete ho gaya ho (e.g., SSO ID guide complete)
// AI poochhe:

const PERSONAL_INFO_PROMPT = `
Agar user ka main kaam ho gaya ho aur woh engaged lage,
toh naturally poochho (ek question at a time):

"BTW, aapka naam kya hai? — Agli baar naam se bulaaunga 😊"

Ya agar city nahi pata:
"Aap kahan se hain? Shayad local e-Mitra ka address bhi de sakta hoon."

Kabhi personal — bank details, address nahi maangna.
`;
```

---

# TASK 7 DONE → "Task 7 complete. Chat logic ready. Task 8?"

---

# ════════════════════════════════════
# TASK 8 — DASHBOARD + FINAL POLISH
# ════════════════════════════════════

## 8A. app/dashboard/page.tsx

```tsx
// User dashboard (logged in only):
//
// Header: "नमस्ते [name]! 👋"
// Stats row: [Messages Used: X/10] [Saved Exams: X] [Tier: Free/Paid]
//
// Section 1: Saved Exams
//   (from saved_exams table)
//   Quick access to exam pages
//
// Section 2: Chat History
//   Last 5 conversations
//   Exam name + date + first message preview
//
// Section 3: Upgrade CTA (if not paid)
//   "₹30 mein Unlimited access pao"
//
// Section 4: Profile Edit
//   Name, city update karna
```

## 8B. Save Exam Button (on exam cards)

```tsx
// Heart/bookmark button on each exam card
// Guest: click → login prompt
// Logged in: toggle save in DB
// Visual: ❤️ (saved) / 🤍 (unsaved)

async function toggleSaveExam(examId: string, userId: string) {
  const { data: existing } = await supabase
    .from('saved_exams')
    .select('id')
    .eq('user_id', userId)
    .eq('exam_id', examId)
    .single();

  if (existing) {
    await supabase.from('saved_exams').delete().eq('id', existing.id);
    return false; // unsaved
  } else {
    await supabase.from('saved_exams').insert({ user_id: userId, exam_id: examId });
    return true; // saved
  }
}
```

## 8C. Complete Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{tsx,ts}', './components/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F2B5B',
        royal: '#1847A6',
        saffron: '#FF6B00',
        'saffron-dark': '#E55A00',
        'tri-green': '#138808',
        'bg-page': '#EEF2F8',
        'bg-chat': '#E5EBF5',
        'bg-input': '#F5F7FA',
      },
      fontFamily: {
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-green': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
};
```

## 8D. Final Checklist Before Deploy

```
□ Supabase tables created
□ RLS policies active
□ Auth OTP working (test with real email)
□ Guest session creates on form submit
□ 5 message limit blocks at correct time
□ Login prompt modal shows at right time
□ After login → 5 more messages available
□ Razorpay test payment works
□ After payment → is_paid = true in DB
□ Exam cards blur/lock for guests
□ Course links open in new tab
□ Scroll arrow → smooth scroll to info
□ Tabs on exam page work
□ Dashboard loads saved exams
□ Save/unsave exam button works
□ Mobile viewport 375px → all OK
□ Hindi font rendering correct
□ Dropdown text visible (not white)
□ Disclaimer on every AI response
□ Monday update reminder in calendar
```

## 8E. Package Installation

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install razorpay
npm install @anthropic-ai/sdk
```

---

# ════════════════════════════════════
# COMPLETE FEATURE SUMMARY
# ════════════════════════════════════

```
TIERS:
Guest (No login):
  ✅ Profile form fill karna
  ✅ Eligible exams dekhna (1st card full, rest blurred)
  ✅ 5 AI questions
  ✅ First exam ka basic info
  ❌ Study material locked
  ❌ PYQ links locked
  ❌ Syllabus tab locked

Registered (Free login):
  ✅ Sab guest features
  ✅ 10 AI questions total
  ✅ Sab exam cards visible
  ✅ Course links visible
  ✅ Basic study material
  ✅ Exam save karna
  ✅ Chat history
  ❌ Complete PYQ locked
  ❌ Syllabus PDF locked

Paid (₹30 one-time):
  ✅ Sab registered features
  ✅ Unlimited AI questions
  ✅ Complete study material
  ✅ PYQ links full access
  ✅ Syllabus PDFs
  ✅ All exam info
```

---

# TASK 8 = SARKARI SAATHI V3.0 COMPLETE 🎉

```
Poora system ready:
Task 1: Database (Supabase) ✓
Task 2: Auth (Email OTP) ✓
Task 3: Profile Form (+ optional name/city) ✓
Task 4: Results Page (Exams + Courses + Official Sites) ✓
Task 5: Exam Deep Dive (Chat + Arrow + Info Tabs + Study Material) ✓
Task 6: Payment (Razorpay ₹30) ✓
Task 7: Chat Logic (Limits + Auto-prompts) ✓
Task 8: Dashboard + Final Polish ✓
```
