# 🌌 ANTIGRAVITY — Sarkari Saathi Master Development Guide
## Location: sarkari-saathi/ANTIGRAVITY.md

Welcome to the new blueprint of **Sarkari Saathi**! We are building a premium, 10x fast e-commerce marketplace for exam notes, MCQs, and mock tests (modeled after Envatx but with top-tier modern UI/UX).

---

## 🧭 Step-by-Step Roadmap

### 🎨 Step 1: UI/UX & Premium Homepage (Front-End Foundation)
*   **Theme:** Modern, sleek light/dark mode using HSL colors. Clean backgrounds, elegant cards, Outfit font for English/numbers, Noto Sans Devanagari for Hindi.
*   **Sidebar (Envatx Style):** A collapsible sidebar containing **5 Rajasthan Exam Groups**. Clicking a group will drop down the respective exams (using actual names and logo icons from `mittu`).
*   **Homepage Grid:** Premium Product Cards (Notes, Mock Tests) with price tags, discounts, and clear buy actions.
*   **Footer Categories:** Same groups structured cleanly at the bottom.
*   **AI Assistant:** The original eligibility wizard will live inside a floating bot widget in the bottom-right corner.

### 🛢️ Step 2: Database Schema & Mock Seeding (Supabase)
*   **Tables to Create:**
    1.  `marketplace_groups`: Holds the 5 Rajasthan groups (names, logo slugs, meta info).
    2.  `marketplace_products`: Notes, MCQs, and Mock Tests linked to exams/groups. Includes `price`, `sale_price`, `cover_image`, `description`.
    3.  `marketplace_orders`: User ID, email, total price, Razorpay payment ID, and manual delivery status (`pending`/`delivered`).
*   **Mock Seeding:** Populate each group with 2-3 exams and matching products.

### 🔑 Step 3: Authentication & Login
*   Utilize/refactor Supabase Auth for smooth Google/Email login.
*   Guest support: Allow users to add products to cart and proceed to checkout, capturing email during payment if not logged in.

### 💳 Step 4: Checkout & Manual Email Delivery (Jugad)
*   **Shopping Cart:** Client-side cart using React State and LocalStorage.
*   **Razorpay Integration:** Active checkout page to collect payment.
*   **Secure Delivery Workflow ("Jugad"):** 
    1.  Once payment completes, save the order with status `pending`.
    2.  Capture customer email, product name, and order ID.
    3.  Admin receives order info and sends the Google Drive link to the customer's email **manually**.
    4.  Ensures 100% security against bypass download hacks.

### 👑 Step 5: Admin Panel (Envatx-style Management)
*   Add a dashboard interface for the admin to:
    *   Track pending orders, copy customer emails, and mark them as `delivered` once email is sent.
    *   Add/update products, adjust pricing, and modify descriptions.

---

## 🤝 Local AI (DeepSeek) Workflow
*   Keep [deepseek_handoff.md](file:///c:/Users/Admin/Downloads/mitu's tool/sarkari-saathi/deepseek_handoff.md) updated with:
    *   Current files under modification.
    *   Tasks delegated to DeepSeek (linting, bug checks).
*   DeepSeek reviews code locally and posts changes/bug status in the handoff file.

---

## 📋 Step 1 Task List

- [ ] Set up global CSS colors and fonts in `globals.css`.
- [ ] Create `components/SidebarCategories.tsx` (Sidebar dropdown categories).
- [ ] Create `components/ProductCard.tsx` (Marketplace card UI).
- [ ] Refactor `app/page.tsx` as the main marketplace layout.
- [ ] Clean up redundant navbar headers and configure theme toggle.
