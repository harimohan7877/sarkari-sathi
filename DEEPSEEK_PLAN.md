# DEEPSEEK MASTER PLAN — Sarkari Saathi V4

> Yeh file DeepSeek V4 (OpenCode) ke liye complete step-by-step execution plan hai.
> Har session ka ek deployable output. Step skip nahi karna.

---

## 📦 Data Source (mittu folder — READ ONLY)

**Kabhi modify nahi karna.** Sirf data nikalna hai:

| File | Kaam |
|------|------|
| `mittu\classified_categories.json` | 6892 categories → 518 groups → 18 Rajasthan groups. Yahan se 5 final groups select karo |
| `mittu\categories_to_update.json` | Har category ka SL, ID, name_en. IDs se exam pages link honge |
| `mittu\category_logos\` | 518 group-wise logos (JPG). Logo URLs yahan se uthao |

**Rajasthan groups available (18):** RSMSSB, RSSB, Police & Security, High Court & Court, Teaching & School, General Government, REET, RVUNL, Medical & Nursing, NHM, Cooperative Bank, TET, RRVUNL, RUHS, JVVNL, IIT, CET, Municipal Corporation

---

## 🧩 Current Code Status (jo already built hai)

| Component | Status | File |
|-----------|--------|------|
| Hero Slider | ✅ Done | `components/HeroSlider.tsx` |
| Product Cards | ✅ Done | `components/ProductCard.tsx` |
| Sidebar Categories (5 groups dropdown) | ✅ Done | `components/SidebarCategories.tsx` |
| Cart Drawer | ✅ Done | `components/CartDrawer.tsx` |
| Navbar + Footer | ✅ Done | `components/Navbar.tsx`, `Footer.tsx` |
| Payment: Create Order API | ✅ Done | `app/api/payment/create-marketplace-order/route.ts` |
| Payment: Verify API | ✅ Done | `app/api/payment/verify-marketplace/route.ts` |
| Admin Panel (dashboard, users, AI, orders) | ✅ Done | `app/secret-admin-portal/page.tsx` |
| Supabase Schema (marketplace tables) | ✅ Done | `supabase-schema.sql` |
| WhatsApp Float | ✅ Done | `app/page.tsx` |
| Mock Auth (localStorage) | ✅ Done | `lib/supabase.ts` |
| AI Chat (exam workspace) | ✅ Done | `app/exam/[id]/page.tsx` |
| Products mock data (10 items) | ✅ Done | `data/products_mock.json` |
| Marketplace data (5 groups, ~230 exams) | ✅ Done | `data/marketplace_data.json` |

---

## 🎯 SELECTED 5 GROUPS (mittu data se)

mittu ke `classified_categories.json` se ye 5 groups select kiye gaye hain — sabse zyada exams wale aur Rajasthan ke top boards:

| # | Group Name (mittu key) | Exams Count | Exams Examples |
|---|------------------------|-------------|----------------|
| 1 | **Rajasthan RSMSSB Exams** | 53 | VDO, Patwari, LDC, JE, Stenographer, Grade 4, Conductor, Fireman, ANM, GNM, Lab Assistant, Computer Instructor, etc. |
| 2 | **Rajasthan Police & Security Exams** | 10 | Police Constable, Police SI, SI Telecom, Jail Prahari, Home Guard, Forest Guard, Excise Constable, Mahila ASI |
| 3 | **Rajasthan High Court & Court Exams** | 7 | System Assistant, Stenographer, Civil Judge, District Judge, Group D, Driver, Library Restorer |
| 4 | **Rajasthan Teaching & School Exams** | 70 | School Lecturer (all subjects), Assistant Professor (all subjects), 2nd Grade Teacher, 1st Grade Teacher, Anganwadi, SET, Polytechnic Lecturer, Sanskrit Teacher |
| 5 | **Rajasthan General Government Exams** | 103 | RPSC RAS, RO/EO, Librarian, JLO, ASO, ARO, AAO, AE, RIICO, RS-CIT, PTET, Rajasthan Patwari, Nursing Officer, BSTC, Computer Instructor |

**Data mapping:** Har exam ke liye invatax pattern follow karna hai:
- `name_en` → English display name
- `name_hi` → Hindi name (generate/translate)
- `meta_title` → SEO title (English + Hindi mix)
- `meta_description` → 2-3 line description in Hindi
- `group` → Parent group
- `logo_url` → Group ka logo (mittu/category_logos/ se)

---

## 📋 STEP-BY-STEP EXECUTION

### STEP 1: UI/UX REWORK — Invatax Pattern Main Page

**Goal:** Homepage ko invatax jaisa banao — groups as hero categories, click → exam dropdown, same pattern sidebar + main content

**Files to modify:**
- `app/page.tsx` — replace current HeroSlider + product grid with invatax-style category showcase
- `components/SidebarCategories.tsx` — already works, but update data source to new 5-group structure
- `data/marketplace_data.json` — replace/restructure with Hindi names + meta fields
- `app/globals.css` — add any new animation classes if needed

**Deliverable:**
- Top: Hero section (simple, clean)
- Main: 5 group cards in a grid — each card has: logo, group name (EN + HI), exam count, short description
- Click on group card → expands dropdown showing all exam names in that group
- Right sidebar: same 5 groups, collapsible
- Bottom: "Popular Exams" section repeating the same pattern
- Every exam name is a link → `/exam/[id]` page

**Check:** `npm run lint` + `npx tsc --noEmit` — 0 errors

---

### STEP 2: DATA ENRICHMENT & SEO

**Goal:** Har group aur exam ke liye Hindi name, meta title, meta description add karo

**Files:**
- `data/marketplace_data.json` — restructure with new fields
- `app/exam/[id]/page.tsx` — generateDynamic metadata from data

**New data structure:**
```json
{
  "groups": [
    {
      "id": "rajasthan-rsmssb-exams",
      "name_en": "Rajasthan RSMSSB Exams",
      "name_hi": "राजस्थान RSMSSB परीक्षाएं",
      "meta_title": "RSMSSB Exams 2026 | Rajasthan RSMSSB Bharti 2026",
      "meta_description": "RSMSSB VDO, Patwari, LDC, JE, Grade 4, ANM, GNM, Lab Assistant aur 50+ exams ki taiyari karein. Premium study material in Hindi.",
      "logo_url": "/logos/rajasthan-rsmssb-exams.jpg",
      "exam_count": 53,
      "exams": [
        {
          "sl": 1516,
          "id": 5478,
          "name_en": "RSMSSB VDO",
          "name_hi": "आरएसएमएसएसबी वीडीओ",
          "meta_title": "RSMSSB VDO Bharti 2026 | Rajasthan VDO Study Material",
          "meta_description": "RSMSSB VDO (Village Development Officer) exam ki taiyari karein. Notes, MCQs aur Mock Tests in Hindi."
        }
      ]
    }
  ]
}
```

---

### STEP 3: AUTH SYSTEM (Google Login)

**Goal:** Mock auth ko replace karo real Google login se

**Options (free):**
- **NextAuth.js / Auth.js** — free, Google provider, built-in
- **Supabase Auth** — already in project, Google OAuth supported
- **Clerk** — free tier, easy setup

**Recommendation:** **Supabase Auth** (already integrated, `lib/supabase.ts` exists, schema has `user_profiles`, no extra dependency)

**Files to create/modify:**
- `app/api/auth/callback/route.ts` — Supabase OAuth callback
- `components/AuthButton.tsx` — Sign in/out button in Navbar
- `app/auth/page.tsx` — update from mock to real login
- `lib/supabase.ts` — add auth helper functions
- `components/AuthPromptModal.tsx` — update to use real auth

**Supabase setup needed:**
- Project mein Google OAuth enable karo
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

---

### STEP 4: BACKEND APIs

**Goal:** CRUD APIs for groups, exams, and products

**Files to create:**
- `app/api/groups/route.ts` — GET all groups with exams
- `app/api/groups/[id]/route.ts` — GET single group with exams
- `app/api/exams/[id]/route.ts` — GET single exam details
- `app/api/products/route.ts` — already exists, update to filter by group/exam
- `app/api/admin/groups/route.ts` — POST/PUT/DELETE for admin
- `app/api/admin/exams/route.ts` — POST/PUT/DELETE for admin

**Data flow:**
1. Static JSON se serve karo (fast, no DB calls)
2. Admin panel DB mein save kare
3. API static JSON + DB merge kare

---

### STEP 5: ADMIN PANEL — Category Management

**Goal:** Admin panel mein "Categories" section add karo — jese invatax mein hota hai

**Files to modify:**
- `app/secret-admin-portal/page.tsx` — add "categories" tab
- `app/api/admin/update-data/route.ts` — API to update static data

**Admin features:**
- Groups list view (table)
- Add/Edit/Delete group
- Add/Edit/Delete exam within group
- Update Hindi name, meta title, meta description
- Upload/assign logo to group
- Toggle active/inactive

---

### STEP 6: SMART API — Notes & Mock Tests

**Goal:** Products (notes, MCQ, mock tests) ko smart API se serve karo

**Current:** 10 hardcoded products in `products_mock.json`
**Target:** API-based product management

**Files:**
- `app/api/products/route.ts` — already exists, enhance with filters
- `app/api/admin/products/route.ts` — CRUD for products

**Product fields:**
- id, title, exam_name, group_id, type (Notes/MCQ/Mock Test), price, sale_price, pages, language, file_url (Google Drive), is_active

---

### STEP 7: PAYMENT + GOOGLE DRIVE DELIVERY

**Goal:** Payment ke baad manual email delivery with Google Drive links

**Current:** Already built (mock + Razorpay)
**Enhance:**
- Admin panel mein "Mark Sent" button already hai
- Google Drive link field in product/order
- Email template for manual sending

---

### STEP 8: AUTOMATION (FUTURE — n8n)

**Phase 2:** n8n ya custom webhook se:
- Payment success → trigger email with Drive link
- Order confirmation email auto-send
- Admin notification on new order

---

## 🚫 NOT TOUCH

- `mittu/` folder ka koi bhi file — READ ONLY
- `CLAUDE.md` — outdated, do not read or trust
- `invatex/` folder ke images — property of envatx.com

---

## 📝 DeepSeek Agent Workflow

Har session mein:

1. **DEEPSEEK_PLAN.md padho** — current step kya hai
2. **deepseek_handoff.md padho** — last agent ne kya kiya
3. **Target files padho** — jo modify karna hai
4. **Changes karo** — ek file, ek kaam
5. **deepseek_handoff.md update karo** — kya kiya + changelog
6. **Lint + Typecheck** — `npm run lint` + `npx tsc --noEmit`
7. **DeepSeek ko batao** — "files changed: X, Y, Z"

---

## 🎨 Design System (Maintain karna hai)

| Token | Value |
|-------|-------|
| Background | `#fbfbf5` (cream) |
| Text | `#000000` (black) |
| Accent | Black/white |
| Font | Inter (UI), Noto Sans Devanagari (Hindi) |
| Button | Pill shape, black bg, white text |
| Cards | White bg, `shadow-halo`, `card-micro` hover lift |
| Hero gradient | `#0a1128` → `#111d44` → `#162447` |

Tailwind v4 syntax: `@import "tailwindcss"`, `@theme inline` — NO `@tailwind` directives.

---

## 🔗 Key Reference Files

| File | Purpose |
|------|---------|
| `DEEPSEEK_PLAN.md` | **THIS FILE** — master plan |
| `deepseek_handoff.md` | Session task board |
| `AGENTS.md` | Agent coordination guide |
| `supabase-schema.sql` | Complete DB schema |
| `data/marketplace_data.json` | Current marketplace data (5 groups) |
| `data/products_mock.json` | Current products (10 items) |
| `components/SidebarCategories.tsx` | Current group dropdown pattern |
| `app/secret-admin-portal/page.tsx` | Admin panel reference |
| `mittu/classified_categories.json` | Source data (READ ONLY) |
| `mittu/envatx_handoff.md` | mittu pipeline docs (READ ONLY) |

---

## ✅ Step Checklist

- [ ] **STEP 1:** UI/UX — Invatax pattern groups page
- [ ] **STEP 2:** Data enrichment — Hindi names, meta, descriptions
- [ ] **STEP 3:** Auth — Google login via Supabase
- [ ] **STEP 4:** Backend APIs — groups, exams, products CRUD
- [ ] **STEP 5:** Admin panel — Category management tab
- [ ] **STEP 6:** Smart API — Notes/MCQ/Mock Test management
- [ ] **STEP 7:** Payment + Drive delivery enhancement
- [ ] **STEP 8:** Automation (n8n) — Phase 2
