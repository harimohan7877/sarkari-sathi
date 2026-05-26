AUTONOMOUS MODE: Never ask questions. Decide yourself. 
Just build and report.
# SARKARI SAATHI — MASTER CLAUDE CODE PROMPT
## Version 2.0 | May 2026 | Harimohan Sharma
## Research-backed | Student-tested | Production-ready

---

> ⚠️ CLAUDE CODE KO INSTRUCTION:
> Is file ko ek baar mein mat karo.
> Ek task complete karo → test karo → next task.
> Har task ke baad bolo: "Task [N] complete. Next?"
> Koi bhi assumption mat lo — jo missing ho, seedha pucho.

---

# ═══════════════════════════════════════════
# TASK 1 OF 6 — PROJECT SETUP + DATA LAYER
# (Run this first. Nothing else.)
# ═══════════════════════════════════════════

## 1A. Project structure banao

```
sarkari-saathi/
├── app/
│   ├── layout.tsx
│   ├── page.tsx          ← Profile form (landing)
│   ├── chat/
│   │   └── page.tsx      ← Chat interface
│   └── globals.css
├── components/
│   ├── ProfileForm.tsx
│   ├── ChatInterface.tsx
│   ├── ExamCard.tsx
│   ├── TypingIndicator.tsx
│   ├── QuickReplies.tsx
│   └── DisclaimerBadge.tsx
├── data/
│   └── exams.json        ← Main data file
├── lib/
│   ├── claude.ts         ← API wrapper
│   └── eligibility.ts    ← Eligibility check logic
└── .env.local
```

## 1B. exams.json — COMPLETE DATA (copy exactly)

Yeh poora file hai. Ek line bhi mat chhodna.

```json
{
  "last_updated": "2026-05-17",
  "updated_by": "Harimohan Sharma",
  "disclaimer": "Yeh data manually verified hai. Apply karne se pehle official site zaroor check karein.",

  "category_relaxations": {
    "note": "Sirf Rajasthan domicile wale candidates ko reserved category benefits milte hain",
    "age_relaxation": {
      "SC_ST_OBC_EWS_male_rajasthan": "+5 saal (max age tak)",
      "SC_ST_OBC_EWS_female_rajasthan": "+10 saal (max age tak)",
      "general_female_rajasthan": "+5 saal",
      "widow_divorced_female": "Koi upper age limit nahi",
      "PwD_general": "+10 saal",
      "PwD_OBC": "+13 saal",
      "PwD_SC_ST": "+15 saal",
      "ex_serviceman": "Rajasthan rules ke hisaab se",
      "other_state_candidates": "General category mein treat honge — koi reservation nahi"
    },
    "fee_relaxation": {
      "general_OBC_creamy_EBC_creamy": 600,
      "OBC_non_creamy_EWS_SC_ST_PwD": 400,
      "correction_charge": 300
    }
  },

  "documents_required_always": [
    "SSO ID (mandatory for all Rajasthan govt forms)",
    "Jan Aadhaar Card / Aadhaar Card",
    "10th Certificate (age proof)",
    "Category Certificate — SC/ST/OBC/EWS (agar applicable)",
    "Domicile Certificate (Rajasthan)",
    "Passport size photo (white background, recent)",
    "Scanned signature (black pen on white paper)",
    "Bank account details (for fee payment)",
    "Mobile number (linked to Aadhaar recommended)"
  ],

  "computer_qualifications_accepted": [
    "RS-CIT (Rajasthan State Certificate in IT) — Vardhman Mahaveer Open University, Kota",
    "O Level (NIELIT/DOEACC)",
    "COPA (Computer Operator & Programming Assistant)",
    "Diploma in Computer Science / Engineering",
    "Diploma in Computer Application",
    "B.Sc Computer Science",
    "BCA / MCA",
    "Any graduate degree with Computer as a subject"
  ],

  "sso_id_steps": {
    "url": "https://sso.rajasthan.gov.in",
    "helpdesk_phone": "0141-5153222",
    "helpdesk_email": "helpdesk.sso@rajasthan.gov.in",
    "steps": [
      {
        "step": 1,
        "title": "Website kholna",
        "action": "Browser mein likhna: sso.rajasthan.gov.in",
        "common_mistake": "Galat website — sirf official URL use karo",
        "tip": "Bookmark kar lo — baar baar kaam aayega"
      },
      {
        "step": 2,
        "title": "Registration shuru karna",
        "action": "'Register' button pe click karo (Blue button, top right)",
        "options": [
          "Bhamashah/Jan Aadhaar se register (Rajasthan residents ke liye best)",
          "Aadhaar se register",
          "Facebook/Google se register (recommended nahi — govt work ke liye)"
        ],
        "recommended": "Jan Aadhaar ya Aadhaar se karo — category benefits automatically link hote hain"
      },
      {
        "step": 3,
        "title": "Jan Aadhaar ID daalna",
        "action": "Jan Aadhaar number daalo (10 digit)",
        "action_if_no_jan_aadhaar": "Aadhaar number daalo (12 digit)",
        "common_mistake": "Jan Aadhaar family number hai — apna individual number daalo",
        "tip": "Jan Aadhaar card ghar mein hoga — pehle dhundh lo"
      },
      {
        "step": 4,
        "title": "OTP verify karna",
        "action": "Mobile pe aaya OTP daalo (5 minute mein expire hota hai)",
        "common_mistake": "OTP expire ho gaya — 'Resend OTP' use karo",
        "tip": "Mobile haath mein rakho — OTP turant aata hai"
      },
      {
        "step": 5,
        "title": "Password banana",
        "action": "Strong password banao",
        "rules": [
          "Minimum 8 characters",
          "Ek capital letter (A-Z)",
          "Ek number (0-9)",
          "Ek special character (@, #, $, !)",
          "Example: Raj@2026 (ye mat use karo — apna banao)"
        ],
        "common_mistake": "Password bhool jaate hain — kisi safe jagah likh lo",
        "tip": "SSO ID aur password alag kagaz pe likh ke ghar mein rakhna"
      },
      {
        "step": 6,
        "title": "Profile complete karna",
        "action": "Naam, DOB, address sahi fill karo",
        "important": "Naam EXACTLY waise likhna jaise 10th certificate mein hai",
        "common_mistake": "Nickname ya short name likhna — baad mein document mismatch hoti hai",
        "tip": "Ek baar fill karo, dobara nahi bharna padega"
      },
      {
        "step": 7,
        "title": "SSO ID note karna",
        "action": "Dashboard pe aaya SSO ID (username) note karo",
        "format": "Usually mobile number ya custom username hota hai",
        "common_mistake": "SSO ID bhool jaana — password reset tough ho jaata hai",
        "tip": "SSO ID + password = government ka digital passport. Sambhal ke rakho."
      }
    ]
  },

  "exams": [
    {
      "id": "rpsc-ras-2026",
      "name": "RPSC RAS (Rajasthan Administrative Service) 2026",
      "short_name": "RAS",
      "board": "RPSC",
      "board_full": "Rajasthan Public Service Commission",
      "official_url": "https://rpsc.rajasthan.gov.in",
      "apply_url": "https://sso.rajasthan.gov.in",
      "status": "expected",
      "expected_notification": "2026 mid-year",
      "last_date": null,
      "form_start": null,
      "expected_vacancies": "500+",
      "prestige": "★★★★★ (Rajasthan ka sabse prestigious exam)",

      "eligibility": {
        "nationality": "Indian citizen",
        "domicile": "Rajasthan preferred (other states apply as General)",
        "education": "Graduation (any stream) from recognized university",
        "education_note": "Final year students bhi apply kar sakte hain Prelims ke liye — Mains se pehle degree chahiye",
        "min_age": 21,
        "max_age": 40,
        "age_cutoff_date": "As per official notification",
        "attempt_limit": "Koi limit nahi — age limit tak baar baar try kar sakte ho",
        "rajasthan_hindi": "Devanagari script mein Hindi ka basic knowledge mandatory"
      },

      "age_relaxation": {
        "General_male": "21-40 saal",
        "General_female_rajasthan": "21-45 saal (+5)",
        "SC_ST_OBC_EWS_male_rajasthan": "21-45 saal (+5)",
        "SC_ST_OBC_EWS_female_rajasthan": "21-50 saal (+10)",
        "widow_divorced_female": "21 saal se — koi upper limit nahi",
        "PwD_general": "21-50 saal (+10)",
        "PwD_OBC": "21-53 saal (+13)",
        "PwD_SC_ST": "21-55 saal (+15)",
        "non_gazetted_govt_employee": "21-45 saal"
      },

      "fee": {
        "general_OBC_creamy": 600,
        "SC_ST_OBC_non_creamy_EWS_PwD": 400
      },

      "selection_process": [
        "Prelims (Objective) → Mains (Written) → Interview",
        "Prelims qualify karna mandatory hai",
        "Interview mein personality test hota hai"
      ],

      "subjects": [
        "General Studies (History, Geography, Polity, Economy, Science)",
        "Rajasthan GK (sabse important — 40-50% marks)",
        "Current Affairs",
        "Mental Ability & Reasoning"
      ],

      "free_youtube": [
        {
          "channel": "KGS Rajasthan Exams",
          "url": "https://www.youtube.com/@KGSRajasthanExams",
          "best_for": "RAS GK + daily live classes",
          "language": "Hindi"
        },
        {
          "channel": "Utkarsh Classes Jodhpur",
          "url": "https://www.youtube.com/@UtkarshClasses",
          "best_for": "Rajasthan History, Geography — Subhash Charan Sir",
          "language": "Hindi"
        },
        {
          "channel": "Study IQ Education",
          "url": "https://www.youtube.com/@StudyIQ",
          "best_for": "Current Affairs, Polity, Economy",
          "language": "Hindi + English"
        },
        {
          "channel": "Raithan Classes",
          "url": "https://www.youtube.com/channel/UCIkHMs9yy7mmPsMSBCUoG8A",
          "best_for": "RPSC all grades — Special Rajasthan GK",
          "language": "Hindi"
        }
      ],

      "last_verified": "2026-05-17",
      "guide_available": true,
      "disclaimer": "500+ vacancies expected — official notification ka wait karo"
    },

    {
      "id": "rsmssb-patwari-2026",
      "name": "RSMSSB Patwari Recruitment 2026",
      "short_name": "Patwari",
      "board": "RSMSSB",
      "board_full": "Rajasthan Subordinate and Ministerial Services Selection Board",
      "official_url": "https://rsmssb.rajasthan.gov.in",
      "apply_url": "https://sso.rajasthan.gov.in",
      "status": "open",
      "last_date": "2026-06-15",
      "form_start": "2026-05-01",
      "total_posts": "3896",
      "prestige": "★★★★☆ (Village level post — good salary + stability)",

      "eligibility": {
        "nationality": "Indian citizen",
        "domicile": "Rajasthan",
        "education": "Graduation (any stream)",
        "computer": "RS-CIT ya equivalent mandatory",
        "CET": "CET Graduate Level qualify karna mandatory",
        "CET_note": "CET nahi hai toh form bharna bekar hai — pehle CET dena hoga",
        "min_age": 18,
        "max_age": 40,
        "age_cutoff_date": "2026-01-01",
        "hindi_devanagari": "Mandatory",
        "rajasthan_culture": "Basic knowledge required"
      },

      "age_relaxation": {
        "General_male": "18-40 saal",
        "General_female_rajasthan": "18-45 saal (+5)",
        "SC_ST_OBC_EWS_male_rajasthan": "18-45 saal (+5)",
        "SC_ST_OBC_EWS_female_rajasthan": "18-50 saal (+10)",
        "widow_divorced_female": "No upper limit",
        "PwD_general": "18-50 saal (+10)",
        "other_state_candidates": "General category only, koi relaxation nahi"
      },

      "fee": {
        "general_OBC_creamy_EBC_creamy": 600,
        "OBC_non_creamy_EWS_SC_ST_PwD": 400,
        "correction_charge": 300
      },

      "selection_process": [
        "Written Exam (Objective)",
        "Document Verification",
        "Final Merit List"
      ],

      "subjects": [
        "Rajasthan GK (History, Art, Culture, Geography)",
        "General Hindi",
        "General English",
        "Maths & Reasoning",
        "Computer Knowledge",
        "Revenue Laws & Land Records (Rajasthan)"
      ],

      "step_by_step_form_guide": [
        "Step 1: SSO ID pe login karo (sso.rajasthan.gov.in)",
        "Step 2: Dashboard mein 'RSMSSB' dhundho",
        "Step 3: 'Apply Online' pe click karo",
        "Step 4: OTR (One Time Registration) fill karo — pehli baar only",
        "Step 5: Personal details fill karo (EXACTLY 10th certificate ke anusaar)",
        "Step 6: Education details bharo",
        "Step 7: Category select karo + certificate upload karo",
        "Step 8: Photo upload (JPEG, max 50KB, white background)",
        "Step 9: Signature upload (JPEG, max 20KB)",
        "Step 10: Exam centre preference chuno (3 options doge)",
        "Step 11: Fee pay karo (Debit Card / Net Banking / UPI)",
        "Step 12: Final submit karo",
        "Step 13: Confirmation page PRINT/SCREENSHOT karo — ZAROOR"
      ],

      "common_mistakes": [
        "Naam 10th certificate se alag likhna → Form reject",
        "DOB galat daalna → Reject",
        "Category galat select karna → Fee waste",
        "Photo size limit cross karna → Upload error",
        "Last date ka wait karna → Server crash — pehle bharo",
        "CET number bina form bharna → Invalid application",
        "Exam centre preference soch ke nahi chunnna → Door centre milta hai"
      ],

      "free_youtube": [
        {
          "channel": "KGS Rajasthan Exams",
          "url": "https://www.youtube.com/@KGSRajasthanExams",
          "best_for": "Patwari exam complete preparation",
          "language": "Hindi"
        },
        {
          "channel": "Utkarsh Classes",
          "url": "https://www.youtube.com/@UtkarshClasses",
          "best_for": "Revenue laws, Rajasthan GK for Patwari",
          "language": "Hindi"
        }
      ],

      "last_verified": "2026-05-17",
      "guide_available": true,
      "disclaimer": "CET Graduate Level qualify karna MANDATORY hai. Bina CET ke apply invalid hai."
    },

    {
      "id": "rsmssb-ldc-2026",
      "name": "RSMSSB LDC / Junior Assistant 2026",
      "short_name": "LDC",
      "board": "RSMSSB",
      "official_url": "https://rsmssb.rajasthan.gov.in",
      "apply_url": "https://sso.rajasthan.gov.in",
      "status": "upcoming",
      "last_date": null,
      "expected_notification": "2026 Q3",
      "prestige": "★★★☆☆ (Clerk post — stable govt job, good for 12th pass)",

      "eligibility": {
        "education": "12th pass (Senior Secondary) from recognized board",
        "computer": "RS-CIT / O Level / COPA / equivalent mandatory",
        "CET": "CET Senior Secondary Level-2024 qualify karna MANDATORY",
        "CET_note": "12th ke baad CET Senior Secondary dena hoga — Graduate CET nahi chalega",
        "min_age": 18,
        "max_age": 40,
        "typing_speed": "25 wpm English / 20 wpm Hindi (some posts mein)",
        "hindi_devanagari": "Mandatory"
      },

      "age_relaxation": {
        "General_male": "18-40 saal",
        "General_female_rajasthan": "18-45 saal",
        "SC_ST_OBC_EWS_male_rajasthan": "18-45 saal (+5)",
        "SC_ST_OBC_EWS_female_rajasthan": "18-50 saal (+10)",
        "widow_divorced_female": "No upper limit"
      },

      "fee": {
        "general_OBC_creamy": 600,
        "SC_ST_OBC_non_creamy_EWS_PwD": 400
      },

      "subjects": [
        "General Hindi",
        "General English",
        "General Knowledge & Current Affairs",
        "Rajasthan GK",
        "Maths & Reasoning",
        "Computer Knowledge"
      ],

      "free_youtube": [
        {
          "channel": "KGS Rajasthan Exams",
          "url": "https://www.youtube.com/@KGSRajasthanExams",
          "best_for": "LDC complete guidance",
          "language": "Hindi"
        },
        {
          "channel": "Exampur",
          "url": "https://www.youtube.com/@Exampur",
          "best_for": "Reasoning, Maths shortcuts",
          "language": "Hindi"
        }
      ],

      "last_verified": "2026-05-17",
      "guide_available": false,
      "disclaimer": "Notification aane ka wait karo. CET Senior Secondary Level qualify karna mandatory hai."
    },

    {
      "id": "rajasthan-police-constable-2026",
      "name": "Rajasthan Police Constable Recruitment 2026",
      "short_name": "Police Constable",
      "board": "Rajasthan Police",
      "official_url": "https://police.rajasthan.gov.in",
      "apply_url": "https://sso.rajasthan.gov.in",
      "status": "upcoming",
      "expected_vacancies": "3500+",
      "prestige": "★★★★☆ (Uniformed service — respect + salary)",

      "eligibility": {
        "education": "10th pass (Matriculation) minimum",
        "min_age": 18,
        "max_age": 23,
        "max_age_note": "Upper age bahut kam hai — 23 saal. Reserved categories ko relaxation milta hai.",
        "physical": {
          "male_height": "168 cm (General/OBC), 160 cm (SC/ST)",
          "female_height": "152 cm (General/OBC), 145 cm (SC/ST)",
          "male_chest": "81-86 cm (5 cm expansion mandatory)",
          "physical_test": "Running, long jump, shot put required"
        }
      },

      "age_relaxation": {
        "General_male": "18-23 saal",
        "SC_ST_OBC_male_rajasthan": "18-28 saal (+5)",
        "General_female_rajasthan": "18-26 saal (+3)",
        "SC_ST_OBC_female_rajasthan": "18-31 saal (+8)",
        "note": "Exact relaxation official notification mein dekho — slightly vary karta hai"
      },

      "fee": {
        "general": 400,
        "SC_ST_OBC_EWS": 350,
        "note": "Police recruitment fee alag hoti hai — confirm karo notification se"
      },

      "selection_process": [
        "Written Exam (Objective)",
        "Physical Efficiency Test (PET)",
        "Physical Standard Test (PST)",
        "Medical Examination",
        "Document Verification"
      ],

      "physical_preparation_tips": [
        "Running ke liye abhi se practice shuru karo",
        "Height/weight/chest measurement pehle check karo",
        "Physical test fail = selection nahi — seriously lo"
      ],

      "free_youtube": [
        {
          "channel": "KGS Rajasthan Exams",
          "url": "https://www.youtube.com/@KGSRajasthanExams",
          "best_for": "Police exam GK + strategy",
          "language": "Hindi"
        },
        {
          "channel": "Exampur",
          "url": "https://www.youtube.com/@Exampur",
          "best_for": "Physical test tips + written exam",
          "language": "Hindi"
        }
      ],

      "last_verified": "2026-05-17",
      "guide_available": false,
      "disclaimer": "Age limit bahut strict hai (max 23 for General). Physical fitness equally important hai."
    },

    {
      "id": "bstc-2026",
      "name": "BSTC (Pre D.El.Ed) Entrance Exam 2026",
      "short_name": "BSTC",
      "board": "Rajasthan Education Department (DEE)",
      "official_url": "https://bstcrajasthan.in",
      "apply_url": "https://bstcrajasthan.in",
      "status": "upcoming",
      "note": "BSTC SSO se nahi hota — separate portal hai",
      "prestige": "★★★☆☆ (Teacher banne ka pehla kadam — 2 saal D.El.Ed course)",

      "eligibility": {
        "education": "12th pass minimum 50% marks (General), 45% (SC/ST/OBC/PwD)",
        "min_age": 17,
        "max_age": "28 saal (General), aage relaxation ke saath",
        "subjects": "12th mein koi bhi stream — Arts/Science/Commerce sab chalega"
      },

      "age_relaxation": {
        "General_male": "17-28 saal",
        "SC_ST_OBC_male_rajasthan": "+3 saal",
        "female_candidates": "+3 saal",
        "note": "Age calculation cutoff date pe hoti hai"
      },

      "fee": {
        "general": 450,
        "SC_ST_OBC": 350,
        "note": "Direct payment on BSTC portal — SSO se nahi"
      },

      "subjects": [
        "Mental Ability (Reasoning)",
        "General Awareness (Rajasthan GK)",
        "Teaching Aptitude",
        "Language Ability (Hindi ya English — student choose karta hai)"
      ],

      "career_path": [
        "BSTC → D.El.Ed (2 year course) → Primary Teacher (1st-5th class)",
        "Primary Teacher ka salary: ₹23,700+ per month",
        "REET Level 1 bhi qualify karna hoga teaching ke liye"
      ],

      "free_youtube": [
        {
          "channel": "KGS Rajasthan Exams",
          "url": "https://www.youtube.com/@KGSRajasthanExams",
          "best_for": "BSTC preparation",
          "language": "Hindi"
        },
        {
          "channel": "Raithan Classes",
          "url": "https://www.youtube.com/channel/UCIkHMs9yy7mmPsMSBCUoG8A",
          "best_for": "Teaching aptitude + Rajasthan GK for BSTC",
          "language": "Hindi"
        }
      ],

      "last_verified": "2026-05-17",
      "guide_available": false,
      "disclaimer": "BSTC alag portal se hota hai — SSO ID yahaan kaam nahi aata. Official site check karo."
    }
  ]
}
```

## 1C. lib/eligibility.ts banao

```typescript
// Complete eligibility check with age relaxation logic

interface UserProfile {
  state: string;
  age: number;
  education: 'eighth' | 'tenth' | 'twelfth' | 'graduation' | 'post_graduation';
  category: 'general' | 'ews' | 'obc' | 'sbc' | 'sc' | 'st';
  gender?: 'male' | 'female';
  isWidowDivorced?: boolean;
  isPwD?: boolean;
  hasCET_graduate?: boolean;
  hasCET_senior_secondary?: boolean;
  hasRSCIT?: boolean;
  hasPhysicalFitness?: boolean;
}

export function checkEligibility(user: UserProfile, exams: any[]) {
  return exams.map(exam => {
    const reasons_eligible: string[] = [];
    const reasons_ineligible: string[] = [];
    const warnings: string[] = [];

    // Calculate effective max age with relaxation
    let effectiveMaxAge = exam.eligibility.max_age;
    if (exam.age_relaxation) {
      const key = `${user.category}_${user.gender || 'male'}_rajasthan`;
      const relaxation = exam.age_relaxation[key];
      if (relaxation) {
        const years = parseInt(relaxation.split('+')[1]);
        if (!isNaN(years)) effectiveMaxAge += years;
      }
      if (user.isWidowDivorced) effectiveMaxAge = 999;
    }

    // Age check
    if (user.age < exam.eligibility.min_age) {
      reasons_ineligible.push(`Umar kam hai — minimum ${exam.eligibility.min_age} saal chahiye, tumhari ${user.age} hai`);
    } else if (user.age > effectiveMaxAge) {
      reasons_ineligible.push(`Umar zyada hai — tumhari category mein maximum ${effectiveMaxAge} saal hai`);
    } else {
      reasons_eligible.push(`✅ Umar sahi hai (${user.age} saal)`);
    }

    // Education check
    const eduLevel = { eighth: 1, tenth: 2, twelfth: 3, graduation: 4, post_graduation: 5 };
    const reqEdu = exam.eligibility.education;
    const userEduLevel = eduLevel[user.education];

    if (reqEdu.includes('Graduation') && userEduLevel < 4) {
      reasons_ineligible.push(`Padhai: Graduation chahiye — tumhari padhai ${eduLevel} tak hai`);
    } else if (reqEdu.includes('12th') && userEduLevel < 3) {
      reasons_ineligible.push(`Padhai: 12th pass chahiye`);
    } else if (reqEdu.includes('10th') && userEduLevel < 2) {
      reasons_ineligible.push(`Padhai: 10th pass chahiye`);
    } else {
      reasons_eligible.push(`✅ Padhai sahi hai`);
    }

    // CET check for RSMSSB exams
    if (exam.eligibility.CET) {
      if (exam.eligibility.CET.includes('Graduate') && !user.hasCET_graduate) {
        warnings.push(`⚠️ CET Graduate Level MANDATORY hai — bina CET ke apply invalid hoga`);
      } else if (exam.eligibility.CET.includes('Senior Secondary') && !user.hasCET_senior_secondary) {
        warnings.push(`⚠️ CET Senior Secondary Level MANDATORY hai`);
      }
    }

    // Computer check
    if (exam.eligibility.computer && !user.hasRSCIT) {
      warnings.push(`⚠️ RS-CIT ya equivalent computer certificate chahiye`);
    }

    // Physical check for Police
    if (exam.id === 'rajasthan-police-constable-2026' && !user.hasPhysicalFitness) {
      warnings.push(`⚠️ Physical fitness test hoga — height, chest, running check karo`);
    }

    // State check
    if (user.state !== 'rajasthan' && user.category !== 'general') {
      warnings.push(`⚠️ Doosre state ke candidates General category mein treat honge — reservation benefit nahi milega`);
    }

    return {
      ...exam,
      eligible: reasons_ineligible.length === 0,
      reasons_eligible,
      reasons_ineligible,
      warnings,
      effective_max_age: effectiveMaxAge
    };
  });
}
```

## 1D. .env.local banao

```
ANTHROPIC_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_NAME=Sarkari Saathi
NEXT_PUBLIC_FREE_MESSAGES_LIMIT=5
```

---

# TASK 1 COMPLETE SIGNAL:
# Bolo: "Task 1 done — data layer ready. Task 2 shuru karein?"

---

# ═══════════════════════════════════════════
# TASK 2 OF 6 — CLAUDE API + AI SYSTEM PROMPT
# (Task 1 ke baad karo)
# ═══════════════════════════════════════════

## 2A. lib/claude.ts — Claude API wrapper

```typescript
import Anthropic from '@anthropic-ai/sdk';
import examsData from '../data/exams.json';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const SARKARI_SAATHI_SYSTEM_PROMPT = `
Tu "सरकारी साथी" hai — Rajasthan ke government job seekers ka AI assistant.

════════════════════════════════════
TERI IDENTITY:
════════════════════════════════════
- Tu ek samajhdaar bada bhai ki tarah baat karta hai
- Simple Hindi mein — jargon nahi, complicated words nahi
- Kabhi judge nahi karta — "pagal ho kya" ya "itna bhi nahi pata" NAHI bolega
- Ek 22 saal ke gaon ke ladke ko samjha sakta hai jo pehli baar online form bhar raha hai
- Patient rehta hai — baar baar wahi sawaal pooche toh bhi seedha jawab deta hai

════════════════════════════════════
LANGUAGE RULES:
════════════════════════════════════
- Hinglish/Hindi mein baat kar — "Hello! Main tumhari madad karta hoon" style
- Technical words explain karo: 
  "SSO ID matlab ek digital ID card hai jo Rajasthan government ne banaya hai"
- Emoji use karo — samjhane mein help karte hain: ✅ ⚠️ 📋 📅 💰
- Chhote sentences — ek baar mein ek baat
- Numbers clearly: "₹600 fee lagegi" — not "some fee"

════════════════════════════════════
ELIGIBILITY CHECKING — RULES:
════════════════════════════════════

HAMESHA yeh cheezein check karo:
1. Umar (age) — exact saal mein, category ke hisaab se relaxation ke saath
2. Padhai (education) — 8th/10th/12th/Graduation/PG
3. Category — General/EWS/OBC/SBC/SC/ST
4. Rajasthan domicile hai ya nahi
5. CET qualify hai ya nahi (RSMSSB ke liye)
6. Computer certificate (RS-CIT) hai ya nahi

AGE RELAXATION SAMJHO:
- Rajasthan domicile + SC/ST/OBC/EWS male = +5 saal relaxation
- Rajasthan domicile + SC/ST/OBC/EWS female = +10 saal relaxation
- General female = +5 saal
- Widow/divorced female = koi upper age limit nahi
- Doosre state se = General category mein treat — koi relaxation nahi

GALAT ASSUMPTION MAT KARO:
- User ne "OBC" kaha toh poochho: "Rajasthan OBC hai ya doosre state ka?"
- "Graduation" kaha toh: "Kaunsa subject? Complete hai ya final year mein ho?"
- "12th pass" kaha toh: "Kaunsa board? Percentage kitni hai?"

════════════════════════════════════
MISSING INFORMATION HANDLING:
════════════════════════════════════

Agar user ne profile form se aaya hai toh uske paas:
- State, Age, Education, Category basic info hai

Agar missing info chahiye toh ek sawaal ek baar poochho:
- "Kya tumhare paas CET Graduate Level ka certificate hai?"
- "Tumhari gender kya hai? (Male/Female) — isse age relaxation alag hoti hai"
- "Kya tumhara domicile Rajasthan hai?"

════════════════════════════════════
DISCLAIMER — HAR RESPONSE MEIN:
════════════════════════════════════

Koi bhi specific exam information dene ke baad HAMESHA add karo:
"⚠️ Yeh jaankari [last_verified date] ko verify ki gayi thi. Apply karne se pehle [official_url] par official notification zaroor padho — dates, eligibility, fee kabhi bhi change ho sakti hai."

════════════════════════════════════
SPECIFIC QUESTION HANDLING:
════════════════════════════════════

"SSO ID kaise banayein?" →
  Step by step guide do (7 steps)
  Common mistakes bhi batao
  Helpdesk number do: 0141-5153222

"Kaun se documents chahiye?" →
  Exam-specific list do
  General documents pehle, exam-specific baad mein
  "Ye sab scan karke ready rakhna — form bharte waqt upload karna hoga"

"Fee kaise pay karein?" →
  Options: Debit Card / Net Banking / UPI
  "Last date se 2-3 din pehle pay karo — last day server slow hota hai"
  "Payment failed ho toh 24 ghante mein auto-refund aata hai"

"Form reject ho gaya?" →
  Poochho: "Kya reason bataya reject mein?"
  Common reasons aur fixes batao

"Result kab aayega?" →
  "Main exactly nahi bata sakta — official site check karo"
  Official URL do
  "RSMSSB ka result generally 3-6 mahine mein aata hai"

"Cutoff kya hogi?" →
  "Ye main nahi bata sakta — yeh exam ke baad decide hoti hai"
  Previous year cutoffs reference do

"Tyaari kaise karein?" →
  Free YouTube channels recommend karo (channel name + URL + kya sikho wahan)
  Syllabus briefly batao
  "Paise ke bina bhi bahut achhi padhai ho sakti hai — YouTube pe sab free hai"

════════════════════════════════════
PSYCHOLOGICAL SUPPORT (Important!):
════════════════════════════════════

Agar user frustrated lage:
- "Sarkari job mein time lagta hai — 1-2 saal ki mehnat normal hai"
- "Rajasthan mein 2026 mein bahut saari vacancies aa rahi hain — timing achhi hai"
- "Ek baar SSO ID bana lo — baaki sab easy ho jaata hai"

Agar user discouraged lage:
- "Yeh form confusing hai — sab ko pehli baar mein mushkil lagta hai"
- "Main hoon na — step by step karte hain"
- "Teri eligibility [X] exams mein hai — option hain"

════════════════════════════════════
WHAT TO NEVER DO:
════════════════════════════════════
❌ Specific cutoff marks predict mat karo
❌ Guarantee mat do ki selection ho jaayega
❌ Galat dates confirm mat karo
❌ "Main nahi jaanta" sirf tab kaho jab sach mein nahi jaante
❌ Long paragraphs — points mein likho
❌ English mein jawab mat do (user ne Hindi mein poochha hai)
❌ Condescending tone — user student hai, fool nahi

════════════════════════════════════
CURRENT EXAM DATA (Auto-injected):
════════════════════════════════════
${JSON.stringify(examsData, null, 2)}
`;

// Free tier limit check
export async function callClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  userProfile?: object
) {
  const systemWithProfile = userProfile
    ? SARKARI_SAATHI_SYSTEM_PROMPT + `\n\nUser ka profile:\n${JSON.stringify(userProfile, null, 2)}`
    : SARKARI_SAATHI_SYSTEM_PROMPT;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',    // Cost saving: Haiku for simple queries
    max_tokens: 1024,
    system: systemWithProfile,
    messages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// Smart model selector — Haiku for simple, Sonnet for complex
export async function callClaudeSmart(
  messages: { role: 'user' | 'assistant'; content: string }[],
  userProfile?: object
) {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  // Complex queries = Sonnet
  const needsSonnet = 
    lastMessage.includes('step by step') ||
    lastMessage.includes('kaise bharna') ||
    lastMessage.includes('guide') ||
    lastMessage.includes('explain') ||
    lastMessage.length > 200;

  const model = needsSonnet 
    ? 'claude-sonnet-4-6'      // Detailed guides
    : 'claude-haiku-4-5-20251001';  // Simple Q&A

  const systemWithProfile = userProfile
    ? SARKARI_SAATHI_SYSTEM_PROMPT + `\n\nUser ka profile:\n${JSON.stringify(userProfile, null, 2)}`
    : SARKARI_SAATHI_SYSTEM_PROMPT;

  const response = await client.messages.create({
    model,
    max_tokens: needsSonnet ? 2048 : 1024,
    system: systemWithProfile,
    messages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
```

## 2B. app/api/chat/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { callClaudeSmart } from '../../../lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // Rate limiting check (simple — 5 messages free)
    const messageCount = parseInt(req.headers.get('x-message-count') || '0');
    if (messageCount > 50) {
      return NextResponse.json({ 
        error: 'Aaj ki limit khatam ho gayi. Kal dobara aana.' 
      }, { status: 429 });
    }

    const response = await callClaudeSmart(messages, userProfile);

    return NextResponse.json({ 
      response,
      model_used: messages[messages.length - 1].content.length > 200 ? 'sonnet' : 'haiku'
    });

  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json({ 
      error: 'Kuch problem aa gayi. Thodi der baad try karo.' 
    }, { status: 500 });
  }
}
```

---

# TASK 2 COMPLETE SIGNAL:
# Bolo: "Task 2 done — AI layer ready. Task 3 shuru karein?"

---

# ═══════════════════════════════════════════
# TASK 3 OF 6 — PROFILE FORM PAGE (Landing)
# (Task 1+2 ke baad karo)
# ═══════════════════════════════════════════

## 3A. app/page.tsx — Complete Profile Form

Banao ek beautiful mobile-first profile form with:

### Design specs:
- Background: `#EEF2F8` (govt grey-blue)
- Tiranga stripe at top: 4px — saffron (#FF6B00) | white | green (#138808)
- Header: gradient `#0F2B5B → #1847A6`
- Card: white, border-radius 20px, subtle shadow

### Form fields (in this exact order):

**Field 1 — Rajya (State):**
- Dropdown, default = Rajasthan (locked/highlighted)
- Only Rajasthan for now (MVP)
- Show: "राजस्थान ✓" in blue when selected
- Style: `bg-[#EEF4FF] text-[#1847A6] border-[#1847A6]`

**Field 2 — Umar (Age):**
- Number input, min=14, max=60
- Placeholder: "उदाहरण: 22"
- Helper text below: "आपकी उम्र से हम आपकी योग्यता calculate करते हैं"

**Field 3 — Linga (Gender):**
- 2 big pill buttons: [पुरुष 👨] [महिला 👩]
- Selected = filled navy blue
- Helper: "Age relaxation ke liye zaruri hai"

**Field 4 — Padhai (Education):**
- Dropdown options (Hindi first):
  - "-- शिक्षा चुनें --" (disabled default)
  - "8वीं पास (8th Pass)"
  - "10वीं पास (10th Pass)"  
  - "12वीं पास (12th Pass)"
  - "स्नातक (Graduation)"
  - "परास्नातक (Post Graduation)"
- `bg-gray-50 text-gray-900` — visibility fix

**Field 5 — Shreni (Category):**
- Dropdown:
  - "-- श्रेणी चुनें --" (disabled)
  - "सामान्य / EWS (General/EWS)"
  - "OBC / SBC"
  - "अनुसूचित जाति (SC)"
  - "अनुसूचित जनजाति (ST)"
- Below dropdown: small info box
  - "💡 OBC/SC/ST candidates ko age relaxation milti hai — Rajasthan domicile hona zaruri hai"

**Field 6 — Extra Qualifications (checkboxes):**
- Title: "आपके पास क्या है? (जो हो वो tick करें)"
- [ ] RS-CIT या Computer Certificate
- [ ] CET Graduate Level (2024)
- [ ] CET Senior Secondary Level (2024)
- These help narrow eligibility accurately

**Submit Button:**
- Text: "योग्य भर्तियाँ ढूंढें 🔍"
- Color: saffron gradient `#FF6B00 → #E55A00`
- Height: 56px, full width, bold 17px
- Loading: spinner + "ढूंढ रहे हैं..."

**Free trial notice (below button):**
```
🆓 पहले 5 सवाल बिल्कुल मुफ्त | No signup needed
```

### On submit:
1. Run eligibility check from `lib/eligibility.ts`
2. Store profile in sessionStorage (no backend needed)
3. Navigate to `/chat` with profile as URL params OR sessionStorage
4. Pass eligible exams list to chat page

### Trust badges (below form, always visible):
```
🔒 आपकी जानकारी safe है  |  ✅ हर सोमवार verified  |  🆓 5 सवाल free
```

---

# TASK 3 COMPLETE SIGNAL:
# Bolo: "Task 3 done — form ready. Task 4 shuru karein?"

---

# ═══════════════════════════════════════════
# TASK 4 OF 6 — CHAT INTERFACE (Main Feature)
# (Task 1+2+3 ke baad karo)
# ═══════════════════════════════════════════

## 4A. components/ChatInterface.tsx

Build exact WhatsApp-style chat:

### Colors:
- Chat bg: `#E5EBF5` (WhatsApp grey-blue)
- Bot bubble: white, `border-radius: 4px 18px 18px 18px`
- User bubble: `#0F2B5B → #1847A6` gradient, white text, `border-radius: 18px 18px 4px 18px`
- Input bg: `#F5F7FA` (NOT white)
- Send button empty: `#E2E8F5` grey
- Send button with text: saffron `#FF6B00`

### Chat header bar:
```
[🏛️ avatar] सरकारी साथी        • Online
            आपका सरकारी मार्गदर्शक
```
- Sticky top
- Bot avatar: navy gradient circle, 🏛️ emoji
- Green dot: `#138808` — "Online" status

### Opening message (auto-send on page load):
```
नमस्ते! 🙏 मैं सरकारी साथी हूं।

मैंने आपकी जानकारी देखी:
📊 उम्र: [X] साल | पढ़ाई: [X] | श्रेणी: [X]

आप इन भर्तियों के लिए योग्य हैं:
[ExamCard components here]

आप मुझसे पूछ सकते हैं:
• SSO ID कैसे बनाएं?
• Form कैसे भरें?
• Documents क्या चाहिए?
• Fees कितनी है?
• तैयारी कैसे करें?

क्या जानना है? 👇
```

### ExamCard component (inside chat):
Each eligible exam shows as a card:
```
┌─────────────────────────────┐
│ [RSMSSB] Patwari 2026  OPEN │ ← colored badge
│━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ 📅 अंतिम तिथि: 15 जून 2026  │
│ 🔴 केवल 29 दिन बाकी!        │
│ 📚 योग्यता: स्नातक + CET    │
│ 💰 शुल्क: ₹600 / ₹400      │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [Form कैसे भरें?] [Official]│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ ⚠️ 17 May को verified | rsmssb.rajasthan.gov.in check करें
└─────────────────────────────┘
```

### Typing indicator:
3 bouncing dots — EXACT animation:
```css
@keyframes typing {
  0%, 80%, 100% { transform: translateY(0); background: #C5D0E0; }
  40% { transform: translateY(-8px); background: #1847A6; }
}
```
Show 800ms minimum even if response comes faster (feels natural)

### Quick reply chips (below messages, horizontal scroll):
Context-aware — change based on last bot message:

Default chips:
- "📝 SSO ID कैसे बनाएं?"
- "📋 Form भरने में मदद"
- "📅 Last Date क्या है?"
- "💰 Fees कितनी है?"
- "🎥 Free पढ़ाई कहाँ से करें?"
- "📄 Documents क्या चाहिए?"

After SSO ID guide shown:
- "Next step क्या है?"
- "Password भूल गया?"
- "Login हो गया, अब क्या?"

After exam guide shown:
- "Form भर दिया, अब क्या?"
- "Admit card कब आएगा?"
- "Syllabus बताओ"

### Input bar:
- Textarea (not input) — grows with text
- Placeholder: "यहाँ अपना सवाल लिखें..."
- On type: send button turns saffron
- Enter = send (Shift+Enter = new line)
- Send button: 44x44px circle, saffron when text present

### Free trial counter:
Top right corner of chat:
```
🆓 3/5 सवाल बाकी
```
When 0 left:
```
आज के 5 मुफ्त सवाल हो गए।
कल फिर आना, या operator से मिलना। 🙏
```
(No payment in MVP — just gentle nudge)

### Message timestamps:
- Show: "2:45 PM" format
- User messages: double tick ✓✓ (static — no real delivery tracking)

---

# TASK 4 COMPLETE SIGNAL:
# Bolo: "Task 4 done — chat UI ready. Task 5 shuru karein?"

---

# ═══════════════════════════════════════════
# TASK 5 OF 6 — PREDICTED QUESTIONS + DEEP CONTENT
# (Task 4 ke baad karo — AI ke liye extra training data)
# ═══════════════════════════════════════════

## 5A. Predicted Q&A — Add to System Prompt

Student sabse zyada yeh poochhte hain (research-verified):

### SSO ID Questions:
```
Q: "SSO ID aur password dono bhool gaya"
A: sso.rajasthan.gov.in → 'Forgot Password' → 
   Registered mobile pe OTP → New password set
   Agar mobile bhi change ho gaya: 
   SSO Helpdesk call karo: 0141-5153222

Q: "SSO ID pe naam change karna hai (galat dala tha)"
A: Bahut tough process hai — seedha RSMSSB office contact karo
   Apply karne se PEHLE naam sahi karo — baad mein nahi hota

Q: "SSO ID active hai ya nahi kaise pata chalega"
A: sso.rajasthan.gov.in → Login karo → Dashboard khulega = active hai
   Nahi khula = account inactive ya wrong credentials

Q: "Ek phone number pe kitni SSO ID bana sakte hain"
A: Ek — ek mobile number = ek SSO ID sirf
   Naya number chahiye toh naya SSO ID

Q: "Jan Aadhaar nahi hai toh SSO ID kaise banayein"
A: Directly Aadhaar se bana sakte ho
   sso.rajasthan.gov.in → Citizen → Aadhaar option choose karo
```

### Form Filling Questions:
```
Q: "Photo ka size kitna hona chahiye"
A: JPEG format, maximum 50KB, white background
   Size: 35mm x 45mm (passport size)
   Recent photo — 6 month se zyada purani nahi
   
   Compress karne ke liye: iloveimg.com ya squoosh.app (free)

Q: "Signature upload karna hai kaise"
A: Safed kagaz pe black pen se sign karo
   Photo khicho ya scan karo
   JPEG format, max 20KB
   Compress: squoosh.app

Q: "Category certificate nahi hai / naya banana hai"
A: SC/ST: SDM (Sub-Divisional Magistrate) office se
   OBC: SDM office se — non-creamy layer certificate lena
   EWS: Tehsildar se (income certificate + form)
   Time lagta hai: 15-30 din
   Abhi shuru karo — form closing se pehle ready rakhna

Q: "OBC certificate mein 'Non-Creamy Layer' likha hona chahiye kya"
A: HAAN — mandatory
   OBC certificate mein "Non Creamy Layer" clearly mention hona chahiye
   Sirf 'OBC' certificate nahi chalega — Non-Creamy Layer mandatory hai

Q: "Domicile certificate banana hai"
A: Tehsildar ya SDM office se
   Documents: Aadhaar, Voter ID, Property papers (koi ek)
   Time: 7-15 din
   Online bhi ho sakta hai: emitra.rajasthan.gov.in

Q: "Last date ke din form bharna safe hai kya"
A: NAHI — bilkul nahi
   Last date ko server crash hota hai — bahut cases mein form submit nahi hota
   Fee deduct ho sakti hai aur form submit nahi
   2-3 din pehle hi bharo
```

### Eligibility Confusion:
```
Q: "Main 12th pass hoon — patwari ke liye apply kar sakta hoon"
A: Nahi — Patwari ke liye Graduation mandatory hai
   12th ke baad bache ke liye: LDC / Police Constable / BSTC dekho
   Graduation complete karo toh Patwari form bhar sakte ho

Q: "Meri umar 42 saal hai — kuch mil sakta hai"
A: Category aur gender ke hisaab se bata sakte hain:
   OBC/SC/ST male = +5 saal (max 45) → kuch options hain
   OBC/SC/ST female = +10 saal (max 50) → zyada options
   Exact eligibility ke liye category batao

Q: "Main MP (Madhya Pradesh) se hoon — Rajasthan mein form bhar sakta hoon"
A: Haan — Indian citizen hona kafi hai
   Lekin: General category mein treat honge — koi reservation nahi
   Aur: Domicile benefits nahi milenge
   

Q: "Final year graduation chal raha hai — RAS ke liye apply kar sakta hoon"
A: HAAN — Prelims ke liye apply kar sakte ho
   Lekin: Mains se pehle degree complete honi chahiye
   Marks sheet + degree ready rakhna

Q: "Widow hoon — age limit hai?"
A: Nahi — widowed ya divorced mahilaon ke liye koi upper age limit nahi hai
   Sirf minimum age (18-21) lagu hoti hai exam ke hisaab se
```

### Preparation Questions:
```
Q: "Paisa nahi hai coaching ke liye — kaise padhunga"
A: Bilkul free mein padhai ho sakti hai:

   RAS ke liye:
   📺 KGS Rajasthan Exams: youtube.com/@KGSRajasthanExams
   📺 Utkarsh Classes: youtube.com/@UtkarshClasses (Subhash Charan Sir for Raj GK)
   📺 Study IQ: youtube.com/@StudyIQ (Current Affairs)
   
   Patwari ke liye:
   📺 KGS Rajasthan Exams (best for Patwari)
   📺 Utkarsh Classes (Revenue laws)
   
   BSTC ke liye:
   📺 Raithan Classes: youtube.com/channel/UCIkHMs9yy7mmPsMSBCUoG8A
   
   Previous year papers: 
   🔗 rsmssb.rajasthan.gov.in → 'Old Papers' section
   
   Free books:
   🔗 archive.org (search 'Rajasthan GK Hindi')

Q: "Kitne ghante padhna chahiye"
A: Competition ke hisaab se:
   RAS: 6-8 ghante minimum, 1-2 saal ki mehnat
   Patwari/LDC: 4-6 ghante, 6-12 mahine
   Police Constable: Physical + 3-4 ghante study, 4-6 mahine
   BSTC: 3-4 ghante, 3-4 mahine
   
   Quality > Quantity — focused 4 ghante > distracted 8 ghante

Q: "Syllabus kahan milega"
A: Exam-specific official notification mein hota hai
   Patwari: rsmssb.rajasthan.gov.in → 'Recruitment' → Patwari → Notification PDF
   RAS: rpsc.rajasthan.gov.in → 'Exam Notification'
   PDF download karo — syllabus clearly mention hota hai
```

## 5B. components/YouTubeCard.tsx

Jab AI YouTube channel recommend kare, yeh card show hoga:

```tsx
interface YouTubeCardProps {
  channelName: string;
  url: string;
  bestFor: string;
  language: string;
}

// Card design:
// Left: Red YouTube logo circle
// Center: Channel name (bold) + bestFor (small grey)
// Right: "देखें →" link (saffron color)
// Background: #FFF5F5 (light red tint)
// Border: 1px solid #FCA5A5 (light red)
```

## 5C. components/DisclaimerBadge.tsx

Hamesha visible, har message ke baad:

```tsx
// Orange warning box
// "⚠️ यह जानकारी {date} को verify की गई थी।
//  Apply करने से पहले {official_url} पर 
//  official notification जरूर पढ़ें।"
// Clickable URL → opens in new tab
```

---

# TASK 5 COMPLETE SIGNAL:
# Bolo: "Task 5 done — content layer ready. Task 6 shuru karein?"

---

# ═══════════════════════════════════════════
# TASK 6 OF 6 — POLISH + MOBILE + DEPLOY
# (Sab kuch ke baad — final step)
# ═══════════════════════════════════════════

## 6A. globals.css — Complete CSS

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;900&display=swap');

:root {
  --navy: #0F2B5B;
  --royal: #1847A6;
  --saffron: #FF6B00;
  --saffron-dark: #E55A00;
  --tri-green: #138808;
  --bg-page: #EEF2F8;
  --bg-chat: #E5EBF5;
  --bg-input: #F5F7FA;
  --text-primary: #0D1B2A;
  --text-secondary: #4A5568;
  --border: #C5D0E0;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Noto Sans Devanagari', 'Noto Sans', sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* CRITICAL: Dropdown visibility fix */
select {
  background-color: #F5F7FA !important;
  color: #0D1B2A !important;
}

select option {
  background-color: #FFFFFF !important;
  color: #0D1B2A !important;
}

/* Tiranga stripe */
.tiranga-stripe {
  height: 4px;
  background: linear-gradient(90deg, #FF6B00 33%, #FFFFFF 33% 66%, #138808 66%);
}

/* Typing animation */
@keyframes typing-dot {
  0%, 80%, 100% { transform: translateY(0); background: #C5D0E0; }
  40% { transform: translateY(-8px); background: #1847A6; }
}

/* Streaming cursor */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.streaming-cursor::after {
  content: '▋';
  color: var(--royal);
  animation: blink 1s infinite;
}

/* Card entrance animation */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUp 300ms ease-out forwards;
}

/* Mobile safe area */
.pb-safe {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

/* Hide scrollbar but allow scroll */
.scroll-hidden::-webkit-scrollbar { display: none; }
.scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
```

## 6B. Mobile Testing Checklist

```
Har yeh check karo KHUD phone pe:

□ Form page — 375px pe sab visible hai?
□ Dropdown mein text dikh raha hai? (white-on-white fix)
□ Submit button thumb se easily tapable? (min 48px)
□ Chat — messages overflow nahi ho rahe?
□ Typing indicator dikh raha hai?
□ Quick reply chips scroll ho rahe hain?
□ Input bar keyboard ke upar aata hai jab type karo? (iOS)
□ Send button saffron hota hai jab text type karo?
□ ExamCard disclaimer bar dikh raha hai?
□ YouTube card clickable hai (new tab mein khulta hai)?
□ 5 message ke baad free limit notice aata hai?
□ Hindi font sahi render ho rahi hai?
```

## 6C. Vercel Deployment

```bash
# Local test pehle:
npm run dev
# Check: localhost:3000

# Environment variable:
# Vercel Dashboard → Settings → Environment Variables
# ANTHROPIC_API_KEY = sk-ant-...

# Deploy:
git add .
git commit -m "Sarkari Saathi v1.0 - Initial launch"
git push
# Vercel auto-deploy hoga

# Final URL test:
# https://sarkari-saathi.vercel.app
# Mobile pe kholo — test karo
```

## 6D. Monday Update Protocol (Critical)

```
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
  → `last_date` update karo agar change hua

Step 4: Deploy karo
  git add data/exams.json
  git commit -m "Weekly data update - [date]"
  git push

Agar verify nahi kiya 7+ din se:
→ ExamCard pe automatic warning dikhe:
  "⚠️ यह डेटा 7+ दिन पुराना है। Extra सावधानी से use करें।"
```

---

# ═══════════════════════════════════════════
# TASK 6 COMPLETE = SARKARI SAATHI V1.0 READY
# ═══════════════════════════════════════════

## Final Delivery Checklist:

```
□ Task 1: exams.json + eligibility.ts ✓
□ Task 2: Claude API + System Prompt ✓
□ Task 3: Profile Form (landing page) ✓
□ Task 4: Chat Interface ✓
□ Task 5: Q&A + YouTube Cards ✓
□ Task 6: CSS + Mobile + Deploy ✓

MVP SCOPE MAINTAINED:
□ 5 exams only ✓
□ No auth/login ✓
□ No payment gateway ✓
□ No WhatsApp bot (Phase 2) ✓
□ No auto-scraping ✓
□ Free tier friendly ✓
□ Disclaimer on every response ✓
□ Monday update protocol documented ✓
```

---

## Claude Code ko reminder:

> Ek task complete karo.
> "Task [N] complete hua. Koi error? Ya Task [N+1] shuru karein?" — yeh poochho.
> Sab ek saath mat karo.
> Har task ke baad test karo.
> Yahi loop chalao jab tak sab 6 tasks done naa ho jaayein.
