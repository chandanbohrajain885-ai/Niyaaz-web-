# Niyaaz — Website + Growth Platform

A flat, dependency-free static site. No build step. Deploys to Vercel as-is.

## What's in the box
| File | What it is |
|---|---|
| `index.html` + `app.js` + `styles.css` | **Version B — Growth platform** (customer site): online ordering with cart, coupons, smart up-sells, Royal Club points, table reservations, catering estimator + lead capture, order tracking, live open/closed branch status, feedback, EN/ಕನ್ನಡ/मराठी/हिंदी, PWA, SEO schema for every branch |
| `classic.html` + `classic.js` | **Version A — Like-for-like rebuild** of the current site's scope (brochure: about, menu, branches). Use it in the pitch to show "what you have" vs "what you could have" |
| `admin.html` + `admin.js` + `admin.css` | **Management console**: live order kanban with late-order alerts, reservations, catering pipeline, menu engineering (Stars / Plowhorses / Puzzles / Dogs), price & sold-out control, coupon ROI, customer CRM with WhatsApp win-back, feedback inbox, CSV export, backup |
| `data.js` | **Single source of truth** — menu, prices, branches, offers, catering packages, config |
| `store.js` | Data layer: demo (browser storage) or cloud (Supabase) |
| `supabase-schema.sql` | Database + row-level security for cloud mode |
| `vercel.json` | Security headers (CSP, HSTS, X-Frame-Options…), clean URLs, caching |
| `sw.js`, `manifest.webmanifest`, `favicon.svg` | Installable app (PWA) |
| `robots.txt`, `sitemap.xml`, `privacy.html`, `404.html` | SEO + compliance basics |
| `PITCH.md` | Gap analysis and the sales pitch for Niyaaz management |

## Deploy (5 minutes)
1. Create a GitHub repo, upload **all files to the repo root** (no folders).
2. Vercel → Add New Project → import the repo → Framework preset: **Other** → Deploy. No build command, no output directory.
3. Open `/` (customer site), `/classic` (Version A), `/admin` (console, demo PIN `1989`).

## Demo for the pitch
1. Open `/admin` → PIN `1989` → **Settings → Load 60 days of demo data**.
2. Walk through Overview → Live Orders → Menu & Profit → Customers.
3. On a phone, open `/`, place an order, then show it landing in the console (same browser in demo mode).

## ⚠ Demo mode vs production — read this
Demo mode stores data in **the browser that created it**. An order placed on a customer's phone will **not** appear on the manager's laptop. That is fine for a pitch, useless for real business. Before real customers:

1. Create a Supabase project → SQL Editor → run `supabase-schema.sql`.
2. Authentication → Users → add each manager (email + password).
3. In `data.js` set `supabaseUrl` and `supabaseAnonKey`.
4. In `index.html` and `admin.html`, uncomment the `supabase-js` script tag.
5. Redeploy. Console login switches to email/password automatically.

## Before go-live (non-negotiable)
- `orderWhatsApp` in `data.js` → Niyaaz's official WhatsApp Business number (currently the publicly listed Kolhapur number as a placeholder).
- Branch phone numbers (only Kolhapur is filled).
- Every menu item marked `verify: true` → confirm price. Only the 6 core biryani prices came from a public listing.
- `cost` (food-cost %) per dish → real recipe costing, otherwise the menu-engineering view is a guess.
- Real dish photos: set `img: "mutton-biryani.webp"` on a menu item and upload the file to the repo root.
- Official Niyaaz logo, supplied by Niyaaz (current mark is a placeholder).
- Guest quotes in `app.js → renderQuotes()` are illustrative. Replace with real, permissioned reviews.
- Timeline years after 1989 are placeholders.
- `googleReviewUrl` → exact Google Business Profile review link.
- Have `privacy.html` reviewed.

## Security notes
- Strict Content-Security-Policy; no inline scripts; all user text is HTML-escaped; CSV export blocks formula injection.
- Cloud mode: public can only **insert** submissions; reading/updating needs a logged-in manager (RLS). Order tracking requires order ID + last 4 digits of mobile.
- Demo PIN is client-side and **not** real security. It exists only for the pitch.
- Payments are not taken online. Orders are confirmed on WhatsApp / pay-at-counter. Add Razorpay as a phase-2 item (needs a serverless function, i.e. a folder, i.e. breaks the flat-zip rule).
