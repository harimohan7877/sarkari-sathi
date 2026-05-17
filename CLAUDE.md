# SARKARI SAATHI — Claude Code Master File

---

## Project Context

**Kya bana rahe hain:** Sarkari Saathi — Rajasthan ke government job seekers ke liye AI-powered Hindi form filling guide.

**Builder:** Harimohan Sharma, BCA final year, Sardarshahar, Rajasthan. Non-technical builder — code samajhta hai but likhta AI se hai. Building se seekhta hai, courses se nahi. Explanation chhoti do, working code pehle do.

**Core problem solve kar rahe hain:** Rajasthan ke tier-3 city ke job seekers ko pata nahi hota ki kaunse government forms bhar sakte hain aur kaise. e-Mitra pe Rs. 50-200 dete hain sirf samajhne ke liye. Ye app unka free/cheap AI guide hai.

**Primary customers (B2B first):** e-Mitra operators — Rs. 299-499/month
**Secondary customers (B2C later):** Direct job seekers — Rs. 29-49/month

---

## Tech Stack

```
Framework:    Next.js 14 with App Router
AI:           OpenRouter API (Claude via OpenRouter)
Data:         /data/exams.json (local file, NO database in MVP)
Styling:      Tailwind CSS
Hosting:      Vercel
Language:     Hindi UI, Hinglish responses
Auth:         NONE in MVP
Payments:     NONE in MVP (Razorpay Phase 2 mein)
```

---

## Progress (2026-05-17)

### Task 1: Project Setup + Data Layer ✅ DONE
- [x] exams.json - Complete version with 5 exams, full details
  - RPSC RAS, RSMSSB Patwari, RSMSSB LDC, Rajasthan Police Constable, BSTC
  - Full age relaxation details, fee details, subjects, YouTube channels
- [x] eligibility.ts - Advanced version with:
  - Gender-specific age relaxation
  - CET check (Graduate + Senior Secondary)
  - Computer certificate (RS-CIT) check
  - Physical fitness check for Police
  - Warning system for missing documents

### Task 2: AI Layer + Claude API ✅ DONE
- [x] lib/ai.ts - Complete AI wrapper with:
  - Full system prompt (identity, language rules, eligibility checking)
  - Smart model selector (Sonnet for complex, Haiku for simple)
  - All Q&A patterns integrated
  - Psychological support rules
- [x] app/api/chat/route.ts - Updated with smart model selection

### Task 3: Profile Form (Landing) ✅ DONE
- [x] app/page.tsx - Complete profile form with:
  - State (auto Rajasthan), Age, Education, Category
  - Hindi-first UI with Noto Sans Devanagari
  - Trust badges, disclaimer

### Task 4: Chat Interface ✅ DONE
- [x] app/guide/[examId]/page.tsx - WhatsApp-style chat with:
  - Header with exam name
  - Message bubbles (user right, AI left)
  - Typing indicator
  - Input bar with send button
  - Disclaimer footer

### Task 5: Q&A Content ✅ DONE
- [x] All predicted questions added to system prompt
- [x] SSO ID questions and answers
- [x] Form filling questions
- [x] Eligibility confusion questions
- [x] Preparation questions with YouTube channels

### Task 6: CSS + Deploy 🚧 IN PROGRESS
- [x] app/globals.css - Complete CSS with all animations
- [ ] Need to test build and deploy

---

## Current File Structure

```
sarkari-saathi/
├── CLAUDE.md                    ← Master file (yehi)
├── .env.local                   ← API keys
├── app/
│   ├── layout.tsx               ← Root layout with fonts
│   ├── page.tsx                 ← Profile form (landing)
│   ├── globals.css              ← Complete CSS
│   ├── exams/
│   │   └── page.tsx             ← Eligible exams list
│   ├── guide/
│   │   └── [examId]/
│   │       └── page.tsx         ← AI Chat guide
│   └── api/
│       └── chat/
│           └── route.ts         ← API route
├── data/
│   └── exams.json               ← 5 exams, full details
├── lib/
│   ├── eligibility.ts          ← Advanced eligibility logic
│   └── ai.ts                   ← AI wrapper + system prompt
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## API Setup (OpenRouter - Claude)

.env.local:
```
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet-20241022
OPENROUTER_MODEL_HAIKU=anthropic/claude-3-haiku-20240307
NEXT_PUBLIC_APP_NAME=Sarkari Saathi
NEXT_PUBLIC_FREE_MESSAGES_LIMIT=5
```

---

## Color Palette — "BHARAT OFFICIAL"

```css
--navy:        #0F2B5B;   /* Deep govt navy — header, primary */
--royal:       #1847A6;   /* Royal blue — buttons, links */
--saffron:     #FF6B00;   /* Indian saffron — accents, CTAs */
--tri-green:   #138808;   /* Tiranga green — success */
--bg-page:     #EEF2F8;   /* Govt portal grey-blue */
--bg-chat:     #E5EBF5;   /* WhatsApp-style chat bg */
--bg-input:    #F5F7FA;   /* Never white — solves dropdown bug */
```

---

## Data Structure — exams.json

Current exams (5):
1. RPSC RAS - Graduation, 21-40 साल, expected notification
2. RSMSSB Patwari - Graduation, 18-40 साल, ₹600/400, Open (last date: 15 June 2026)
3. RSMSSB LDC - 12th, 18-40 साल, upcoming (Q3 2026)
4. Rajasthan Police Constable - 10th, 18-23 साल, upcoming (3500+ vacancies)
5. BSTC - 12th, 17-28 साल, upcoming

Full data includes:
- Age relaxations by category/gender
- Fee structure by category
- Selection process
- Subjects/syllabus
- Free YouTube channels
- Step-by-step form guides
- Common mistakes to avoid
- CET requirements

---

## AI System Prompt Summary

**Teri Identity:**
- Samajhdaar bada bhai ki tarah baat karta hai
- Simple Hindi mein, jargon nahi
- Kabhi judge nahi karta
- 22 saal ke gaon ke ladke ko samjha sakta hai

**Language Rules:**
- Hinglish/Hindi mein baat kar
- Emoji use karo: ✅ ⚠️ 📋 📅 💰
- Chhote sentences — ek baar mein ek baat

**Eligibility Checking:**
- Umar (exact saal, category-wise relaxation)
- Padhai (8th/10th/12th/Graduation/PG)
- Category (General/EWS/OBC/SBC/SC/ST)
- Rajasthan domicile
- CET (Graduate/Senior Secondary)
- RS-CIT (computer certificate)

**Har Response Mein:**
- Disclaimer: "⚠️ Yeh jaankari [date] ko verify ki gayi thi. Apply karne se pehle [URL] par official notification zaroor padho."

---

## Core Features

### Feature 1: User Profile Input ✅
Simple form — state (auto Rajasthan), umar, padhai, category

### Feature 2: Eligible Exams List ✅
Profile se match karo exams.json ke saath. Cards dikhao — naam, deadline, fee, status badge. "X din baaki" countdown.

### Feature 3: AI Chat Guide ✅
Conversational Hindi chat. WhatsApp-style UI. Button options jahan possible ho. Har response ke end mein disclaimer.

### Feature 4: Disclaimer (MANDATORY) ✅
Har AI response ke end mein:
```
⚠️ Ye jaankari {last_verified} ko verify ki gayi thi.
Apply karne se pehle {official_url} pe official notification zaroor padho.
```

---

## Testing Flow

1. Open http://localhost:3000
2. Fill form (age 22, education 12th, category obc_sbc)
3. Click "योग्य भर्तियाँ ढूंढें"
4. See eligible exams
5. Click "आवेदन कैसे करें" on any exam
6. Chat with AI
7. Send message - get Hindi response

---

## Anti-Loop Rules

1. Har session ka ek deployable output hona chahiye
2. Naya feature sirf tab — pehle paying customer ke baad
3. Har Monday — exams.json update (alarm lagao)
4. Scope creep question: "Kya ye pehle paying customer laane mein help karega?" Nahi toh ignore.

---

## Monday Update Protocol

HAR MONDAY SUBAH — 30 MINUTE:

Step 1: RSMSSB check karo (10 min)
  → rsmssb.rajasthan.gov.in
  → 'Latest News' ya 'Recruitment' section
  → Koi naya form? Last date change? New notification?

Step 2: RPSC check karo (10 min)
  → rpsc.rajasthan.gov.in
  → 'Notifications' section

Step 3: exams.json update karo (10 min)
  → Status change karo agar kuch badla
  → `last_verified` date update karo to today

Step 4: Deploy karo

---

## Session Start Checklist (Har Baar)

1. "Pichle session mein kya deploy hua?" — pehle dikhao
2. Aaj ka ek goal — sirf ek feature
3. Build → Test → Deploy
4. Screenshot lo

Agar step 1 ka jawab "kuch nahi" — pehle woh karo.

---

## Last Updated

2026-05-17 | ALL TASKS COMPLETE ✅ | Build Successful!

---

## Build Status (2026-05-17)

```
✓ Compiled successfully in 4.3s
✓ TypeScript passed
✓ All routes generated
  - / (Static)
  - /exams (Static)
  - /api/chat (Dynamic)
  - /guide/[examId] (Dynamic)
```

## Today's Changes Summary

### Fixes Applied:
1. ✅ Fixed TypeScript errors with JSON type casting
2. ✅ Fixed null date handling in exams page
3. ✅ Fixed CSS @import warning (moved to top)
4. ✅ Updated API route to use getExamById helper
5. ✅ Updated guide page to use proper imports

### What Was Updated:
- exams.json: Complete 5 exams with full data
- eligibility.ts: Advanced logic with age relaxation, CET checks
- lib/ai.ts: Full system prompt with smart model selection
- globals.css: All animations and styles

## Next Session - Ready to Deploy!

Steps:
1. git add .
2. git commit -m "Sarkari Saathi v1.0 - Complete MVP"
3. git push
4. Vercel auto-deploy
5. Test on mobile!