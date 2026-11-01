# Niyaaz — Gap Analysis & Growth Pitch

## 1. What niyaaz.in is today (audit, Nov 2026)
- The site is a JavaScript-only single-page app. Crawlers and link previews that don't run JavaScript see **only a title and a meta description** — no menu, no branches, no phone numbers, no address. For local search ("biryani near me Belagavi") that is a serious handicap.
- No first-party online ordering. Every delivery order goes through aggregators that take a large commission and **own the customer data**.
- No table booking, no catering/bulk enquiry flow, no loyalty, no feedback loop, no order tracking.
- Brand confusion: unrelated restaurants with similar names (e.g. in Hubli) confuse customers, and public reviews show people blaming Niyaaz for them. The site doesn't tell people which outlets are official.
- Public reviews repeat the same operational complaints: slow service, parking, portion consistency. Management has no structured way to catch these before they reach Google.

## 2. What we built
| Gap | Feature | Business effect |
|---|---|---|
| Aggregator dependence | Direct ordering + WhatsApp confirmation | Every direct order keeps the commission and the customer's number |
| Low basket size | "Goes perfectly with" up-sells, Family Handi, free-delivery threshold | Higher average order value |
| No repeat engine | Royal Club (points + tiers) and customer CRM with WhatsApp win-back | Turns one-time guests into regulars |
| High-value events lost to phone calls | Catering estimator + lead pipeline | Wedding/iftar/corporate orders tracked to closure |
| Empty tables at slow hours | Reservations + orders-by-hour chart + coupons targeted at slow hours | Better kitchen and staff planning |
| Margin blind spots | Menu engineering (Stars/Plowhorses/Puzzles/Dogs) + live price control | Re-price the right dishes, drop the dead ones |
| Bad reviews surprise management | Private feedback inbox with "needs action" alerts | Unhappy guests get a call before they post |
| Brand confusion | "Official outlets" verification on the site + schema.org per branch | Protects the name, improves local search |
| Language | EN / Kannada / Marathi / Hindi | Reaches Belagavi + Kolhapur families in their language |

Note: everyone is asked for a Google review, not only happy guests. Showing the Google link only to 4–5★ guests ("review gating") breaks Google's policy and can get reviews removed.

## 3. Honest limits (say these before they ask)
- Demo runs in browser storage; production needs the Supabase step (≈1 day).
- No online payment yet (phase 2: Razorpay/UPI).
- No POS or aggregator integration (phase 3).
- Menu prices beyond the core biryanis, food costs and photos must come from Niyaaz.

## 4. Suggested commercial offer (adjust to your market)
| Package | Scope | Indicative price |
|---|---|---|
| Launch | Site + console + Supabase setup + 7 branches + photos integrated + 30 days support | ₹1.5–2.5 L one-time |
| Grow (monthly) | Hosting, updates, festival campaigns, monthly WhatsApp win-back, report | ₹15–30k / month |
| Phase 2 | Online payments, POS / KOT printer, aggregator menu sync | quoted separately |

Anchor the conversation on outcomes, not features: *"If 15% of your current aggregator orders move direct, the commission saved pays for this within months."* Get their real numbers (monthly aggregator orders, average order value, commission rate) in the first meeting and fill that sentence in with their figures.

## 5. Meeting script (10 minutes)
1. Open `/classic` — "this is roughly what you have."
2. Open `/` on your phone — order a Mutton Dum Biryani, apply FIRSTBIRYANI, place it.
3. Open `/admin` on the laptop — show it arriving (same device in demo), accept it, WhatsApp the customer.
4. Menu & Profit — "these 8 dishes are underpriced; these 10 are dead weight." (Use their real costs for real conclusions.)
5. Customers — "these regulars haven't come back in 45 days. One tap brings them back."
6. Close on the Launch package and a 30-day pilot at one branch.
