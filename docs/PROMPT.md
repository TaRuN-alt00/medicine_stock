# Medicine Stock Finder: Master Build Prompt for Antigravity

## How to use this in Antigravity (read first)

1. Open a new empty workspace folder. Paste everything under **"PROMPT START"** into the Agent Manager as one task.
2. Set the agent to **Planning mode** first. Review the Implementation Plan artifact it produces. Only approve it when it matches the phases below.
3. Build **phase by phase** (Section 12). After each phase, test in the browser before saying "continue to next phase". Do not ask for everything in one go.
4. Keep this file in the repo as `/docs/PROMPT.md` so the agent can re-read it when it drifts.

---

## PROMPT START

You are a senior full-stack engineer and product designer. Build **Medicine Stock Finder**, a production-quality web application with **three separate portals**: Customer, Chemist and Admin. Follow every section below. If something is ambiguous, choose the simplest option that respects the constraints, and list your assumptions in `/docs/ASSUMPTIONS.md`.

### 1. Product in one paragraph

In tier-2 and tier-3 Indian towns, finding one medicine can take five shop visits, because chemists have no shared way to show stock. Medicine Stock Finder lets a patient search for a medicine, sends a live request to nearby open chemists, and each chemist answers with **one tap: Yes (available) or No**. The patient then sees confirmed shops with distance, map and a call button. **The app never sells, stocks, prescribes or delivers medicine.** The purchase happens at the licensed chemist's counter, with a prescription where the law requires one. This is an availability and access layer only.

Tagline: *A confirmed answer from the nearest chemist, in minutes.*

### 2. Hard constraints (do not violate)

- The app must never present itself as a pharmacy, never take payment for medicine, never recommend a dosage, and never suggest substitutes as medical advice. Show salt/generic information only as neutral reference text with the line: "Ask your chemist or doctor before changing any medicine."
- For prescription-only (Schedule H / H1 / X) medicines, the UI must say a valid prescription is required at the counter. Never let a request imply the chemist will hand over such medicine without one.
- Collect the **minimum** personal data. Medicine searches are health-related, so treat them as sensitive: no selling or sharing, no third-party analytics on search text, and a retention limit (Section 9).
- Delivery is **out of scope for v1**. Add a feature flag `FEATURE_HOME_DELIVERY=false` and keep the data model ready (Section 8), but build no delivery UI unless the flag is on.
- No dummy marketing claims, fake testimonials, fake user counts or fake ratings anywhere. Use clearly labelled demo data only inside the seeded development environment.

### 3. Tech stack

- **Next.js (App Router) + TypeScript (strict)**, deployed on Vercel or Firebase Hosting.
- **Tailwind CSS** with design tokens defined as CSS variables (Section 4). No component library that forces its own look. You may use Radix UI primitives for accessible dialogs, menus and tabs, styled by our tokens.
- **Firebase**: Authentication (phone OTP for customers and chemists; email + password with mandatory 2FA for admins), Firestore, Cloud Functions (TypeScript), Cloud Messaging (web push), Storage (chemist licence documents).
- **Geo queries**: `geofire-common` geohashes in Firestore.
- **Maps**: Leaflet with OpenStreetMap tiles. No paid map key needed.
- **Forms/validation**: React Hook Form + Zod, shared schemas between client and Cloud Functions.
- **i18n**: `next-intl` with **English and Hindi** from day one. Every user-facing string goes through translation files. Hindi must use proper Devanagari typography.
- **Testing**: Vitest for logic, Playwright for the main flows, Firebase Emulator Suite for rules and functions.
- Free-tier friendly: avoid services that cost money at low volume.

### 4. Design system

**Feel:** calm, trustworthy, local. Like a well-run neighbourhood pharmacy and a good printed health pamphlet, not a startup landing page. Quiet, spacious, readable, honest.

**Colour (natural, earthy, no AI-template palettes).** Define these as CSS variables and use only these:

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F6F3EC` | page background (warm off-white) |
| `--surface` | `#FFFFFF` | cards, inputs |
| `--stone` | `#E4DFD3` | borders, dividers, subtle fills |
| `--ink` | `#1C2420` | primary text |
| `--ink-muted` | `#5B6660` | secondary text |
| `--forest` | `#1F4D3A` | primary brand, main buttons, headers |
| `--forest-dark` | `#163A2B` | hover/pressed |
| `--sage` | `#8FA38A` | secondary accents, icons, subtle badges |
| `--clay` | `#B5573A` | single warm accent, used sparingly |
| `--available` | `#2F7D4F` | "Yes / Available" state |
| `--unavailable` | `#A8392B` | "No / Unavailable" state |
| `--pending` | `#B7791F` | waiting / expired states |

**Absolutely avoid:** purple, indigo or blue-to-violet gradients; neon; glassmorphism; glow effects; mesh/aurora backgrounds; gradient text; emoji as icons; stock "AI-looking" hero blobs; tinted drop shadows. Use **flat colour**, 1px `--stone` borders and, at most, one very soft neutral shadow for floating layers (menus, dialogs).

**Typography:** headings in **Source Serif 4** (weights 600/700), body and UI in **Figtree**, numbers and codes in **Red Hat Mono**. Hindi falls back to **Noto Sans Devanagari** / **Noto Serif Devanagari**. Base size 17px, line-height 1.6, generous spacing. Minimum tap target 44px.

**Shape and motion:** 10px radius on cards, 8px on inputs and buttons. Motion is functional only (150 to 200ms ease-out for state changes, live-update highlight on new chemist replies). Respect `prefers-reduced-motion`.

**Icons:** Lucide, 1.5px stroke, in `--forest` or `--ink-muted`.

**Imagery:** simple flat, isometric-style illustrations of chemist shops and families using only the colour tokens above. Place SVG/PNG illustrations in `/public/illustrations`; I will supply the final art, so build with clearly sized placeholders (neutral `--stone` boxes with alt text).

**Accessibility:** WCAG 2.2 AA, full keyboard use, visible focus rings (2px `--forest` outline with offset), colour is never the only signal (Yes/No always has text and icon), proper ARIA, screen-reader labels in both languages.

**Responsive:** mobile-first. The customer and chemist portals will mostly be used on cheap Android phones over weak networks, so keep JS light, lazy-load maps, and make the chemist reply screen work on a 360px-wide viewport.

### 5. Portal A: Customer (public site + patient portal)

**Public pages:** Home, How it works (4 steps: Search, Notify, Confirm, Choose), For chemists (join page), About, Privacy Policy, Terms, Medicine information disclaimer, Contact/Help, language switcher (EN/HI).

**Customer flow:**
1. **Search**: one large search box. Input by typed name (brand or salt), **voice input** (Web Speech API, Hindi and English, with graceful fallback), or **prescription/strip photo** (upload, OCR via a Cloud Function, show extracted names for the user to confirm and edit before searching; never auto-send OCR text).
2. **Brand-to-salt**: autocomplete from the medicine database with fuzzy matching (handle "paracetmol"). Show brand, salt/composition and form (tablet, syrup, etc.). Allow "any brand with this salt".
3. **Location**: ask permission, or let the user drop a pin or enter locality. Default radius 3 km; widen to 5 km and then 8 km automatically if no chemist replies in 3 minutes, and offer **night/emergency widening** (after 9 pm).
4. **Live results screen**: a request card with a countdown. Chemist replies stream in via Firestore realtime listeners. Each confirmed shop shows: name, open/closed status, distance, time of reply ("confirmed 2 min ago"), **Call** button, **Directions** link (opens the maps app), and a map with pins. Sort by confirmed first, then distance. "No" replies are collapsed under "Not available at".
5. **Stale protection**: a "Yes" is valid for 30 minutes. After that, show "Confirm again" which re-pings that chemist.
6. **Close the loop**: after a request, ask "Did you get the medicine?" (Yes / No / Not yet). This feeds chemist reliability scores.
7. **Prescription notice**: if the medicine is flagged `prescription_required`, show a clear notice before the request is sent.

**Customer account:** phone OTP login, optional name, saved localities, request history (patient can delete history anytime), language preference, "Delete my account and data" button that actually deletes.

### 6. Portal B: Chemist

**Onboarding (self-serve, then verified by admin):** phone OTP, shop name, owner name, address and map pin, opening hours (with "open 24 hours" option), drug licence number, GST (optional), upload licence photo/PDF. Status: `pending` → `verified` / `rejected` (with reason). A chemist cannot receive requests until `verified`.

**Core screen: Incoming Requests (the heart of the product):**
- Large cards: medicine name (brand + salt), form, distance of patient (approximate, never exact address), time left to reply, prescription notice if applicable.
- Two huge buttons: **Yes, available** (green) and **No** (red). One tap, no confirmation dialog for Yes. A 5-second **Undo** toast for accidental taps.
- Optional after a Yes: quick chips "Exact brand" / "Other brand, same salt" / "Limited quantity". Optional only, never required.
- Web push + in-app sound for new requests. Show a clear "Notifications are OFF" banner with a fix guide if permission is blocked.
- Works acceptably when the tab is in the background, and shows missed requests when reopened.

**Other chemist pages:** Shop profile and hours (editable), Open/Closed toggle ("Closed for now" stops notifications), Request history, My performance (reply rate, average reply time, "patient confirmed they got it" rate; plain numbers, no gamified badges), Notification settings (quiet hours, radius), Help (short Hindi/English guide with screenshots), Billing (**stub page only**: "Free during pilot").

**Anti-annoyance rules:** never notify a closed shop or a shop outside quiet hours; cap pings per chemist per hour (configurable); if a chemist ignores 5 requests in a row, show a gentle prompt to go "Closed" instead of silently failing.

### 7. Portal C: Admin

Separate route group `/admin`, separate login (email + password + 2FA), role-based access. Roles: `super_admin`, `verifier`, `support`.

**Pages:**
- **Overview dashboard**: requests today, median time to first confirmed answer, % of requests with at least one Yes, active chemists, new signups, chemist reply rate. Simple tables and clean line/bar charts in the token colours. No decorative widgets.
- **Chemist verification queue**: view licence document, address, map pin; approve / reject with reason; audit trail.
- **Chemists directory**: search, filter by town/status, suspend/reactivate, view reliability metrics.
- **Customers**: minimal view (no medicine search history visible by default). Support can access a request only through a logged, time-limited "support access" action.
- **Requests monitor**: live feed, filters, status, abuse flags.
- **Medicine database manager**: add/edit medicines (brand, salt, strength, form, `prescription_required`, schedule), bulk CSV import with validation and preview, merge duplicates, synonym/misspelling list.
- **Reports and flags**: customer reports ("chemist said yes but had no stock"), repeat offenders, auto-flag chemists whose Yes-but-no-stock rate is high.
- **Content**: edit static page text and the EN/HI strings that are marked editable.
- **Settings**: radius defaults, request expiry, ping caps, feature flags (`FEATURE_HOME_DELIVERY`, `FEATURE_PHOTO_SEARCH`), data retention periods.
- **Audit log**: every admin action, who, when, what changed. Append-only.
- **Export**: anonymised CSV of aggregate metrics for pilot reporting.

### 8. Data model (Firestore)

Create typed models and Zod schemas for: `users` (role, language, createdAt), `chemists` (profile, location + geohash, hours, openNow, status, licence info, metrics), `medicines` (brand, salt, strength, form, schedule, prescriptionRequired, synonyms[], searchTokens[]), `requests` (customerId, medicineQuery, medicineIds[], location (coarse) + geohash, radiusKm, status: `open|answered|expired|cancelled`, createdAt, expiresAt, outcome), `requests/{id}/responses` (chemistId, answer: `yes|no`, note chips, respondedAt, validUntil), `reports`, `auditLogs`, `settings`, and a **future-ready** `deliveryOrders` collection (do not build UI).

Store only coarse patient location (rounded to about 200 m) on the request, and delete it when the request closes.

### 9. Security, privacy and compliance

- Write **Firestore Security Rules** with role-based access via custom claims, and test every rule in the emulator. A customer can only read their own requests; a chemist only sees requests that were routed to them; only admins read audit logs.
- Cloud Functions do the fan-out: on request creation, find verified, open chemists within radius via geohash, create notification jobs, send FCM, respect caps and quiet hours.
- Rate-limit request creation per user and per device. Add basic abuse checks (bot protection such as Firebase App Check).
- Validate all input on the server. Escape output. Set strict security headers (CSP, HSTS, no sniffing).
- **Retention:** raw medicine search text deleted or anonymised after 90 days (configurable); licence documents kept only while the chemist account exists; account deletion removes personal data.
- **Consent:** explicit, plain-language consent screen at first login (what we collect, why, who sees it). Privacy Policy written in simple English and Hindi, covering medicine searches as sensitive data.
- Design in line with the principles of **BIS IS 17428 (data privacy assurance)** and **ISO/IEC 27001-style security practice**. In the docs and UI say "designed to align with", never "certified" or "compliant", unless I confirm certification later.
- Add a `/docs/COMPLIANCE-NOTES.md` listing open questions for a pharmacist and a lawyer to review before public launch (online availability listing of prescription medicines, chemist licence verification process, data-protection obligations).

### 10. Key behaviours and edge cases to handle

- No chemist in radius: auto-widen, then show an honest "No chemists nearby are on the platform yet" message with a call-to-action to invite a local chemist. Never show fake shops.
- Two requests for the same medicine from the same user within 10 minutes: merge or warn.
- Chemist replies after request expiry: accept but mark "late".
- Chemist changes answer: allow Yes → No (updates patient live), keep history.
- Offline/slow network: optimistic UI for the chemist's tap, retry queue, clear "sending / sent / failed" state.
- Time zone fixed to Asia/Kolkata; dates in DD MMM YYYY.
- All empty, loading and error states designed (skeletons, not spinners everywhere). Plain-language errors, in both languages.

### 11. Code quality

- Folder structure: `/app/(public)`, `/app/(customer)`, `/app/(chemist)`, `/app/admin`, `/components`, `/lib`, `/functions`, `/messages/en.json`, `/messages/hi.json`, `/docs`, `/tests`.
- Strict TypeScript, ESLint, Prettier, absolute imports, small reusable components, no duplicated logic across portals (shared `/lib/schemas`).
- Environment variables in `.env.example` with comments; never commit secrets.
- A seed script that loads **clearly labelled demo** chemists around one campus/locality plus a starter medicine list (about 300 common OTC and prescription medicines with salts) for local testing.
- `README.md` with setup, emulator commands, deploy steps and a screenshot checklist.

### 12. Build phases (stop after each phase and show me a browser walkthrough)

1. **Foundation**: project setup, design tokens, layout shell, i18n (EN/HI), auth for all three roles, role-based routing, emulator + security rules skeleton.
2. **Customer search**: medicine database, fuzzy search with brand-to-salt, location picker, request creation.
3. **Chemist portal**: onboarding, verification status, incoming request screen with Yes/No + undo, open/closed toggle.
4. **Live loop**: Cloud Function fan-out, web push, realtime results page with map, expiry and widening logic, stale handling.
5. **Admin portal**: verification queue, directory, medicine manager with CSV import, requests monitor, audit log, dashboard.
6. **Trust and polish**: reliability metrics, reports, feedback loop ("Did you get it?"), voice and photo search, retention jobs, account deletion, accessibility pass, performance pass on throttled 3G.
7. **Hardening**: Playwright end-to-end tests for the three core flows (customer request → chemist Yes → customer sees result; chemist onboarding → admin approval; account deletion), rules tests, README, compliance notes.

**Acceptance criteria for the whole project:** a new customer can complete a request in under 30 seconds on a 360px phone; a chemist can answer in one tap; an admin can approve a chemist in under a minute; nothing in the UI uses the banned colour styles; Lighthouse mobile score at least 90 for performance and 100 for accessibility on the main pages.

### 13. Things you must NOT do

- Do not add payments, carts, delivery tracking, prescriptions upload storage beyond what Section 5 describes, chat, or ads.
- Do not invent statistics, partner logos, awards or testimonials.
- Do not use gradients, glass effects, neon accents or purple/blue palettes.
- Do not claim certification or legal compliance.
- Do not store exact patient location or full medicine search history longer than the retention limit.
- Do not skip tests for security rules.

Before writing any code, produce the Implementation Plan and wait for my approval.

## PROMPT END
