# Medicine Stock Finder: Assumptions & Architectural Decisions

This document captures assumptions and architectural choices made to satisfy the project specification while respecting all constraints in `/docs/PROMPT.md`.

---

## 1. Authentication & Security
- **Phone OTP Verification:** In local development and testing, Firebase Auth Phone Emulator / pre-configured test numbers (e.g., `+91 98765 43210` with code `123456`) are used to ensure rapid, zero-cost deterministic testing without SMS carrier dependencies.
- **Admin Authentication & 2FA:** Admins use email + password with mandatory two-factor authentication (TOTP or email verification code). A dedicated seed script initializes the initial super admin credentials for development.
- **Customer Privacy & Coarse Location:** Patient coordinates are rounded to ~3 decimal places (~110m-200m coarse precision) before saving to the database. Coordinates are permanently cleared upon request closure or expiry.

---

## 2. Geo Queries & Proximity Fan-Out
- **Geohashing:** Implemented with `geofire-common`. Chemist locations and coarse customer coordinates are indexed by geohash at precision 6-7 (~150m-1.2km bounding boxes).
- **Radius & Auto-Widening:** Initial search radius is 3 km. If no chemist replies within 3 minutes, or if triggered after 9:00 PM IST (Night/Emergency mode), radius widens automatically to 5 km, then 8 km.
- **Chemist Routing Criteria:** Requests are fanned out strictly to chemists whose status is `verified`, `openNow === true`, within quiet-hours limits, and under the hourly ping cap.

---

## 3. Input Methods (Text, Voice, Photo OCR)
- **Fuzzy Autocomplete:** Search utilizes a client/server trie and Levenshtein/Fuse-style fuzzy matching against the bundled ~300 starter medicine index (brands, salts, formulations, and common misspellings like "paracetmol").
- **Voice Search:** Powered by browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) configured for `en-IN` and `hi-IN`. A fallback text input is always visible.
- **Prescription / Strip Photo OCR:** Images uploaded via the photo search feature are processed server-side. The OCR engine extracts candidate text, cross-references against the medicine dictionary, and returns editable medicine chips to the patient. **No search is sent automatically; the patient must review and confirm.**

---

## 4. Real-time Response & Expiry Model
- **Chemist Tap:** Chemist response is a single tap ("Yes, Available" / "No"). An optimistic UI update provides a 5-second Undo toast.
- **Stale Protection:** A confirmed "Yes" remains active for 30 minutes. After 30 minutes, the customer UI shows a "Confirm again" action to re-ping.
- **Close the Loop:** Completed requests prompt the patient with a simple single-tap feedback question: *"Did you get the medicine? (Yes / No / Not yet)"*, updating chemist reliability scores.

---

## 5. Design System & Compliance
- **Color Tokens Only:** Strictly bounded to `--paper`, `--surface`, `--stone`, `--ink`, `--ink-muted`, `--forest`, `--forest-dark`, `--sage`, `--clay`, `--available`, `--unavailable`, `--pending`. Zero gradients, zero neon, flat borders.
- **Typography:** Source Serif 4 (headings), Figtree (UI body), Red Hat Mono (numbers/codes), and Noto Sans / Serif Devanagari (Hindi).
- **Compliance Tone:** In line with BIS IS 17428 and ISO/IEC 27001 principles. All disclaimers state *"designed to align with"* and provide clear non-pharmacy / non-prescription-dispensing declarations.
