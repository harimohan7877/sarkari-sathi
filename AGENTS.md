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

## Architecture — what the current code actually is

The project has **three overlapping design phases** in docs but only the latest code is real:

| Source | Status | Design system |
|--------|--------|---------------|
| `CLAUDE.md` | **OUTDATED** — V1/V2 guide | HSL navy/saffron, exam eligibility wizard |
| `ANTIGRAVITY.md` | Roadmap only | Marketplace pivot plan |
| Current code | **TRUTH** | Shopify-minimalist: cream `#fbfbf5`, black, Inter/Noto fonts, pill buttons |

The current live code is a **premium e-commerce marketplace** for Rajasthan exam study materials (PDF notes, MCQs, mock tests). It is NOT the old eligibility-check portal described in CLAUDE.md.

## Data duality

Two data systems coexist, neither fully dominant:

- **Static JSON:** `data/products_mock.json` (marketplace products), `data/marketplace_data.json` (exam groups), `data/exams.json` (old exams)
- **Supabase schema** (`supabase-schema.sql`) defines V3 tables (user_profiles, guest_sessions, admin_settings, etc.) but the frontend uses localStorage mock auth — Supabase client exists in `lib/supabase.ts` but is not the active auth path

## Key file map

- `app/page.tsx` — marketplace homepage with hero slider, sidebar categories, product grid, checkout modal
- `components/Navbar.tsx` — sticky nav with search form (`?q=` param)
- `components/HeroSlider.tsx` — gradient hero with glowing blobs, fade-in animations
- `components/ProductCard.tsx` — product card with `card-micro` hover lift
- `components/SidebarCategories.tsx` — collapsible exam group sidebar
- `components/Footer.tsx` — dark footer with links + WhatsApp
- `app/auth/page.tsx` — mock login (localStorage-based, no real auth)
- `app/exam/[id]/page.tsx` — AI chat + study material workspace
- `lib/supabase.ts` — Supabase client + mock auth override + message limits
- `lib/ai.ts` — AI provider routing (OpenRouter, Gemini, etc.)
- `proxy.ts` (root) — custom proxy server

## Design system (globals.css)

CSS custom properties for all tokens. Reusable classes:

- `button-primary-pill` — black pill button
- `button-outline-on-dark` — white outline on dark bg
- `button-outline-on-light` — black outline on light bg
- `shadow-halo` / `shadow-premium` — elevation tokens
- `card-micro` — lift-on-hover transition
- `font-devanagari` — Noto Sans Devanagari
- `animate-hero-fade-in` (plus `-delayed`, `-delayed-2`) — hero entrance
- `whatsapp-float` — fixed WhatsApp FAB

Fonts are loaded via CSS `@import` (not Next.js font loader). `layout.tsx` uses no font loader.

## Agent coordination

- `deepseek_handoff.md` — task board between Antigravity and DeepSeek agents
- `AGENTS.md` (this file) — for OpenCode sessions only
- Old `CLAUDE.md` exists but is stale; do not trust its tech stack or file structure claims
