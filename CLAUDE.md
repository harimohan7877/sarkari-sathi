# SARKARI SAATHI — Claude Code Master File

---

## Project Context

**Kya bana rahe hain:** Sarkari Saathi — Rajasthan ke government job seekers ke liye AI-powered Hindi form filling guide.

**Builder:** Harimohan Sharma, BCA final year, Sardarshahar, Rajasthan. Non-technical builder.

**Core problem:** Rajasthan ke tier-3 city ke job seekers ko pata nahi hota ki kaunse government forms bhar sakte hain. e-Mitra pe Rs. 50-200 dete hain. Ye app unka free AI guide hai.

**Live URL:** https://sarkari-saathi-two.vercel.app

---

## Tech Stack

```
Framework:    Next.js 14 with App Router
AI:           OpenRouter API (OpenAI GPT-4o)
Data:         /data/exams.json (local file)
Styling:      Tailwind CSS
Hosting:      Vercel
Language:     Hindi UI, Hinglish responses
Auth:         NONE in MVP
Payments:     NONE in MVP
```

---

## Current File Structure

```
sarkari-saathi/
├── CLAUDE.md                    ← Master file (yehi)
├── .env.local                   ← Local API keys
├── .vercel/                    ← Vercel config
├── app/
│   ├── layout.tsx               ← Root layout with Noto Sans Devanagari font
│   ├── page.tsx                 ← Profile form (landing) - WITH GENDER + CHECKBOXES
│   ├── globals.css              ← Complete CSS with animations
│   ├── exams/
│   │   └── page.tsx             ← Eligible exams list
│   ├── guide/
│   │   └── [examId]/
│   │       └── page.tsx         ← AI Chat guide - WITH QUICK REPLIES + COUNTER
│   └── api/
│       └── chat/
│           └── route.ts         ← API route
├── data/
│   └── exams.json               ← 5 exams, full details
├── lib/
│   ├── eligibility.ts          ← Advanced eligibility logic (gender support)
│   └── ai.ts                   ← AI wrapper + optimized system prompt
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## IMPORTANT: Environment Variables Setup

**Vercel me environment variable add karna zaruri hai:**

1. Vercel Dashboard → Project Settings → Environment Variables
2. Add these variables:
   - `OPENROUTER_API_KEY` = `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`

**Local .env.local:**
```
OPENROUTER_API_KEY=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
NEXT_PUBLIC_APP_NAME=Sarkari Saathi
NEXT_PUBLIC_FREE_MESSAGES_LIMIT=5
```

---

## Profile Form (app/page.tsx)

**Current fields:**
- State: राजस्थान (auto-selected, locked)
- Age: Number input (14-60)
- Gender: Pill buttons (पुरुष 👨 / महिला 👩) - REQUIRED
- Education: Dropdown (8th/10th/12th/Graduation/PG)
- Category: Dropdown (General/EWS/OBC/SC/ST)
- Extra Qualifications (checkboxes):
  - RS-CIT ya Computer Certificate
  - CET Graduate Level (2024+)
  - CET Senior Secondary Level (2024+)
- Submit Button: Saffron gradient
- Free trial notice: "🆓 पहले 5 सवाल बिल्कुल मुफ्त"

**User profile stored in localStorage** - JSON format with all fields.

---

## Chat Interface (app/guide/[examId]/page.tsx)

**Features:**
- Header: Avatar 🏛️ + "Online" green dot + Free counter (X/5)
- Opening message: Shows user profile details (age, education, category, gender)
- Message bubbles: User (navy gradient), AI (white)
- Typing indicator: 3 bouncing dots
- Quick reply chips (horizontal scroll):
  - 📝 SSO ID कैसे बनाएं?
  - 📋 Form कैसे भरें?
  - 📅 Last Date क्या है?
  - 💰 Fees कितनी है?
  - 📄 Documents क्या चाहिए?
  - 🎥 Free पढ़ाई कहाँ से करें?
- Input: Text field + Send button
- Free message limit: 5 messages
- After 5: "आज के 5 मुफ्त सवाल हो गए। कल फिर आना। 🙏"
- Disclaimer footer

---

## AI System Prompt (lib/ai.ts)

**Optimized for token efficiency (~800 words):**

```
तुम "सरकारी साथी" हो - Rajasthan के सरकारी नौकरी उम्मीदवारों का AI गाइड।

📌 तुम्हारी पहचान:
- सीधी, सरल हिंदी/हिंग्लिश में बात करो
- 22 साल के गाँव के लड़के को समझा सको
- कभी टोका मत, सिर्फ मदद करो
- 2-4 वाक्य में जवाब दो (मोबाइल पर हैं लोग)

🎯 स्कोप: सिर्फ Rajasthan सरकारी भर्ती
❌ बाहर: "भाई, मैं सिर्फ सरकारी फॉर्म में मदद करता हूँ"

✅ जाँच करो (हर बार):
- उम्र (category + gender से relaxation)
- शिक्षा (8th/10th/12th/Graduation)
- Category (General/EWS/OBC/SC/ST)
- Rajasthan domicile
- CET (RSMSSB के लिए mandatory)
- RS-CIT (कंप्यूटर सर्टिफिकेट)

📝 Age Relaxation (Rajasthan domicile):
- SC/ST/OBC/EWS Male: +5 साल
- SC/ST/OBC/EWS Female: +10 साल
- General Female: +5 साल
- Widow/Divorced Female: कोई limit नहीं

⚠️ HAR जवाब में DISCLAIMER:
"⚠️ यह जानकारी {last_verified} को verify थी। Apply से पहले {official_url} जरूर देखें।"

💬 जवाब शैली:
- Points में लिखो, लंबे paragraphs नहीं
- Emoji: ✅ ⚠️ 📋 📅 💰

🔍 सवाल handling:
- SSO ID → 7 steps + helpdesk 0141-5153222
- Documents → Exam-specific list
- Fee → Debit/Net Banking/UPI, 2-3 दिन पहले

❌ जो मत करो:
- Cutoff predict मत करो
- Guarantee मत दो
- English में जवाब मत दो
```

**Smart Model Selection:**
- Complex queries (step, kaise, guide, >150 chars) → GPT-4o
- Simple queries → GPT-4o-mini

---

## Eligibility Logic (lib/eligibility.ts)

**UserProfile interface:**
```typescript
interface UserProfile {
  state: string;
  age: string;
  education: string;
  category: string;
  gender: 'male' | 'female';  // IMPORTANT for age relaxation
  hasRSCIT?: boolean;
  hasCET_graduate?: boolean;
  hasCET_senior?: boolean;
}
```

**Functions:**
- `checkEligibility(user, exams)` - Full eligibility with warnings
- `getEligibleExams(profile)` - Filter eligible exams
- `getExamById(id)` - Get single exam
- `getDaysRemaining(lastDate)` - Days until deadline
- `getFeeByCategory(exam, category)` - Get fee by category

---

## API Route (app/api/chat/route.ts)

**POST /api/chat**
- Request: `{ messages, examId, userProfile }`
- Response: `{ response, model_used }`
- Error handling with detailed messages

---

## Data Structure — exams.json

**5 Exams:**
1. RPSC RAS - Graduation, 21-40 साल, expected
2. RSMSSB Patwari - Graduation, 18-40 साल, ₹600, Open (15 June 2026)
3. RSMSSB LDC - 12th, 18-40 साल, upcoming
4. Rajasthan Police Constable - 10th, 18-23 साल, upcoming
5. BSTC - 12th, 17-28 साल, upcoming

**Each exam has:**
- Full eligibility criteria
- Age relaxation rules
- Fee structure
- Selection process
- Subjects
- YouTube channels
- Step-by-step form guide

---

## Color Palette

```css
--navy:        #0F2B5B;   /* Header, primary */
--royal:       #1847A6;   /* Buttons, links */
--saffron:     #FF6B00;   /* CTAs, accents */
--tri-green:   #138808;   /* Success, online status */
--bg-page:     #EEF2F8;   /* Page background */
--bg-chat:     #E5EBF5;   /* Chat background */
--bg-input:    #F5F7FA;   /* Input background */
```

---

## Build & Deploy Commands

**Local build:**
```bash
cd sarkari-saathi
npm run build
```

**Deploy to Vercel:**
```bash
vercel --prod --yes
```

**Vercel alias:** https://sarkari-saathi-two.vercel.app

---

## Testing Flow

1. Open https://sarkari-saathi-two.vercel.app
2. Fill form: Age=22, Gender=Male, Education=Graduation, Category=OBC
3. Click "योग्य भर्तियाँ ढूंढें"
4. See eligible exams
5. Click "आवेदन कैसे करें" on Patwari
6. Send message: "SSO ID kaise banayein?"
7. Get Hindi response with steps + disclaimer

---

## Known Issues Fixed

1. ❌ Anthropic models not supported on OpenRouter → Changed to OpenAI GPT-4o
2. ❌ API Key not in Vercel env → Added via `vercel env add`
3. ❌ Gender field missing → Added pill buttons in form
4. ❌ Extra qualifications missing → Added checkboxes
5. ❌ Free message counter missing → Added in chat header

---

## Anti-Loop Rules

1. Har session ka ek deployable output hona chahiye
2. Naya feature sirf tab — pehle paying customer ke baad
3. Har Monday — exams.json update (alarm lagao)
4. Scope creep question: "Kya ye pehle paying customer laane mein help karega?"

---

## Monday Update Protocol

HAR MONDAY SUBAH — 30 MINUTE:

Step 1: RSMSSB check karo (10 min)
Step 2: RPSC check karo (10 min)
Step 3: exams.json update karo (10 min)
Step 4: Deploy karo

---

## Last Updated

**2026-05-17 | Session Complete | AI Working in Hindi**

**Test result:**
```
User: "SSO ID kaise banayein?"

AI Response:
SSO ID बनाने के लिए ये steps फॉलो करें:
1. SSO की वेबसाइट पर जाएँ: sso.rajasthan.gov.in
2. "Register" पर क्लिक करें।
3. आधार कार्ड, फेसबुक, गूगल या भामाशाह में से किसी एक विकल्प को चुनें।
4. जरूरी जानकारी भरें और OTP से वेरीफाई करें।
5. यूजरनेम और पासवर्ड सेट करें।
6. रजिस्ट्रेशन पूरा होने पर आपको SSO ID मिल जाएगी।
7. कभी परेशानी हो, तो हेल्पडेस्क नंबर 0141-5153222 पर संपर्क करें।

⚠️ यह जानकारी 2026-05-17 को verify थी। Apply से पहले official साइट जरूर देखें।
```

---

## Next Session - Ready to Use!

App fully functional hai. Sirf use karo aur test karo.