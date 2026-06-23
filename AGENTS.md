<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sarkari Saathi — Agent Guide

## Versions (deviate from defaults)

- **Next.js 16.2.6** + **React 19.2.4** — far newer than most training data
- **Tailwind CSS v4** — uses `@import "tailwindcss"` (not `@tailwind` directives) and `@theme inline` for tokens
- **ESLint flat config** (`eslint.config.mjs`) with Next.js core-web-vitals + TypeScript rules
- React 19 ESLint rules are strict: `set-state-in-effect`, `immutability`, `purity` are all enforced

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` (runs `next build`) |
| Lint | `npm run lint` (runs `eslint`) |
| Typecheck | `npx tsc --noEmit` (tsconfig is strict) |

No test framework installed. No test/coverage scripts.

## Architecture — current state

The project has **three overlapping design phases** in docs but only the latest code is real:

| Source | Status | Design system |
|--------|--------|---------------|
| `CLAUDE.md` | **OUTDATED** — V1/V2 guide | HSL navy/saffron, exam eligibility wizard |
| `ANTIGRAVITY.md` | Roadmap only | Marketplace pivot plan |
| Current code | **TRUTH** | Shopify-minimalist: cream `#fbfbf5`, black, Inter/Noto fonts, pill buttons |

Current code is a **premium e-commerce marketplace** for Rajasthan exam study materials (PDF notes, MCQs, mock tests) with Google Drive delivery.

## Data duality

Two data systems coexist:
- **Static JSON:** `data/products_mock.json` (10 products with drive_url), `data/groups.json` (5 groups with logos), `data/exams.json` (exams with fee/eligibility)
- **Supabase schema** (`supabase-schema.sql`) defines V3 tables but frontend uses localStorage mock auth

## Key file map

- `app/page.tsx` — homepage: hero, circular grid, sidebar+products, info cards, footer, cart drawer, checkout
- `app/exam/[id]/page.tsx` — exam detail + related products with Buy Now buttons
- `app/category/[id]/page.tsx` — exam cards with group logo book-cover design
- `app/exams/page.tsx` — category browser grid
- `app/download/page.tsx` — post-purchase download page with Google Drive links
- `app/auth/page.tsx` — mock login (localStorage, no real auth)
- `app/secret-admin-portal/page.tsx` — admin panel with 9 tabs
- `app/secret-admin-portal/components/CategoriesTab.tsx` — group CRUD + logo upload
- `app/secret-admin-portal/components/ProductsTab.tsx` — product CRUD + cover + drive_url
- `app/secret-admin-portal/components/ExamsTab.tsx` — exam CRUD + logo upload
- `components/ProductCard.tsx` — Product interface with drive_url
- `components/SidebarCategories.tsx` — sidebar with group logos
- `components/CartDrawer.tsx` — checkout form (name, email)
- `lib/eligibility.ts` — Exam interface with logo_url
- `lib/groups.ts` — Group interface with priority, is_active

## Status

### ✅ DONE
| Feature | Details |
|---------|---------|
| Homepage layout | Hero → Circular Grid → Sidebar+Products → InfoCards → Footer |
| Category browser | `/exams` page with group grid |
| Category detail | `/category/[id]` book-style exam cards with group logo |
| Admin panel | 9 tabs, dark theme, right-side drawers |
| Group CRUD | CategoriesTab with logo upload (file + URL) |
| Product CRUD | ProductsTab with cover upload, drive_url field |
| Exam CRUD | ExamsTab with logo upload (file + URL) |
| Per-exam logo | `logo_url` field, falls back to group logo |
| Sidebar logos | Group logo thumbnails in sidebar |
| Footer | 5-column enriched footer |
| Google Drive delivery | `drive_url` field on products |
| `/download` page | Post-payment download links |
| Exam detail page | Exam info + related products with Buy Now |
| Checkout flow | Cart → payment → redirect to /download |
| Products API | Returns `drive_url` to frontend |
| Local JSON fallback | All admin CRUD falls back to JSON files |
| **Razorpay real integration** | Mock code removed, real test keys (`rzp_test_T54MKK5H47huwt`), HMAC verification, cart closure fix |
| **Google OAuth login** | Supabase Auth + Google Sign-In button, callback handler, Navbar user menu |

### ❌ BAKI (Pehli sale ke liye)
| Priority | Feature | Notes |
|----------|---------|-------|
| 🔴 High | **Real products (actual PDF/MCQ files)** | Sirf 10 mock items, koi actual file nahi |
| 🔴 High | **Razorpay live keys on Vercel** | `.env.local` se Vercel dashboard mein env vars daalne hain |
| 🟡 Medium | **Order history** | User purane orders nahi dekh sakta |
| 🟡 Medium | **WhatsApp order notification** | Order aane par admin ko WA message |
| 🟡 Medium | **Post-payment email delivery** | Google Drive link email se bhejna |
| 🟢 Low | Blog/About/Contact pages | InfoCards link nowhere |
| 🟢 Low | Search results page | Navbar mein search form hai but no results page |

## Design system (globals.css)

CSS custom properties for all tokens. Reusable classes:
- `button-primary-pill` — black pill button
- `button-outline-on-dark` — white outline on dark bg
- `button-outline-on-light` — black outline on light bg
- `shadow-halo` / `shadow-premium` — elevation tokens
- `card-micro` — lift-on-hover transition
- `font-devanagari` — Noto Sans Devanagari
- `animate-hero-fade-in` (plus `-delayed`, `-delayed-2`)
- `whatsapp-float` — fixed WhatsApp FAB

Fonts loaded via CSS `@import` (not Next.js font loader). `layout.tsx` uses no font loader.

## Recent commits
- `eae98aa` feat: Google OAuth login via Supabase - callback page, auth page, Navbar user menu
- `d3e8043` fix: Razorpay real integration - removed mock fallback, fixed env keys, cart closure bug
- `e85c5e0` feat: exam page with products, drive_url delivery, /download page, AGENTS.md update
- `6364eb3` fix: replace book box with proper book cover design on exam cards
- `be6aa5d` feat: per-exam logo_url with admin upload, category book cards show group logo badge
