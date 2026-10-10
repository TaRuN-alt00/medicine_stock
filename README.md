# Medicine Stock Finder

> *A confirmed answer from the nearest chemist, in minutes.*

Medicine Stock Finder is an availability inquiry layer connecting patients in tier-2 and tier-3 Indian towns to nearby licensed retail chemists with a single tap: **Yes (available)** or **No**.

**Crucial Policy:** The platform never sells, stocks, prescribes, or delivers medicine. Purchase happens strictly across the physical counter of the licensed chemist with a valid prescription where required by law.

---

## 🚀 Key Features

* **Three Independent Portals:**
  * **Customer Portal (`/` & `/search`):** Type, speak (Hindi/English Web Speech), or snap a prescription/strip photo (OCR). Coarse (~200m) location privacy, Leaflet OpenStreetMap live radar, Call & Directions buttons.
  * **Chemist Portal (`/chemist`):** Counter terminal with Open/Closed toggle, incoming request cards, single-tap **Yes/No** replies, 5-second Undo toast, and audible alert chimes.
  * **Admin Portal (`/admin`):** 2FA protected governance, Drug Licence (Form 20/21) verification queue, directory, custom password & credential settings, and append-only audit trail.
* **Design System (Section 4 Compliant):**
  * Flat color tokens: `--paper` (`#F6F3EC`), `--forest` (`#1F4D3A`), `--available` (`#2F7D4F`), `--unavailable` (`#A8392B`), `--pending` (`#B7791F`).
  * Zero gradients, zero neon, zero glassmorphism.
* **Dual Language (EN / HI):**
  * Instant toggling between English and Hindi with Devanagari typography across all user-facing strings.
* **Realtime Cross-Tab Broadcast Synchronization:**
  * Sub-millisecond inquiry and response syncing across tabs and windows using `BroadcastChannel` and storage listeners.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
* **Node.js:** v18.0.0 or later (v20+ recommended)
* **npm:** v9.0.0 or later

### 2. Installation
```bash
# Clone the repository and navigate into folder
cd "medicine stock"

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ☁️ Deployment Instructions

### Option A: Deploy to Vercel (Recommended for Next.js)
1. Push your repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. In Project Settings:
   * **Framework Preset:** Next.js
   * **Build Command:** `next build`
   * **Output Directory:** `.next`
4. Set Environment Variables (from `.env.example`):
   * `NEXT_PUBLIC_FEATURE_HOME_DELIVERY=false`
   * `NEXT_PUBLIC_FEATURE_PHOTO_SEARCH=true`
5. Click **Deploy**. Your application will be live globally on a custom domain or `.vercel.app`.

### Option B: Deploy to Firebase Hosting
```bash
# Install Firebase CLI globally (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init hosting

# Deploy production bundle
npm run build
firebase deploy --only hosting
```

---

## 🔐 Pre-Configured Test Credentials

| Portal | Login Identifier | Password / Code | Role |
|---|---|---|---|
| **Admin Portal** | `admin@medicinestock.in` | `Admin@Secure2026` (2FA: `123456`) | Super Admin |
| **Chemist Portal** | `9810123456` | OTP / PIN: `123456` | Verified Chemist |
| **Customer Portal** | Any 10-digit phone number | OTP: `123456` | Patient / Consumer |

*Note: You can update and set your own custom Admin email, password, and 2FA code anytime inside `/admin` under the **Password & Security** tab.*

---

## 📸 Verification & Screenshot Checklist

- [x] **Homepage (`/`):** Calm pharmacy pamphlet aesthetic, legal disclaimer banner, search bar with Mic & Camera icons, 3-portal launcher cards.
- [x] **i18n Switch:** Tap "हिन्दी" in top navbar — entire interface translates to Devanagari Hindi.
- [x] **Customer Search Radar (`/search?q=Dolo%20650`):** Real Leaflet OpenStreetMap with coarse user pin, 3 km inquiry radius dashed ring, and countdown timer.
- [x] **Chemist Terminal (`/chemist`):** Open/Closed switch, incoming inquiry card, huge Green (Yes) & Red (No) buttons, 5-second Undo toast, and audible alert chime.
- [x] **Live Response Sync:** Chemist taps "Yes" in one tab -> Customer tab instantly shows Green confirmed shop card, Call button, and Google Maps directions button.
- [x] **Admin Portal (`/admin`):** 2FA gate, Verification Queue with Approve/Reject actions, directory, and Password & Security settings.
- [x] **Chemist Self-Registration (`/for-chemists`):** Modal for new pharmacy onboarding submitting directly to the admin queue.
