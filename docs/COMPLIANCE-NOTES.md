# Medicine Stock Finder: Compliance & Legal Notes

> [!IMPORTANT]
> **Pre-Launch Checklist:** The following notes, boundaries, and questions are prepared for comprehensive legal and regulatory review by a qualified healthcare lawyer and licensed retail pharmacist prior to public pilot deployment.

---

## 1. Regulatory Status & Non-Pharmacy Positioning
- **Core Stance:** Medicine Stock Finder acts strictly as an availability inquiry and communication layer. It is **not** an e-pharmacy, does not maintain inventory, does not process commercial payments, and does not conduct door-to-door medicine delivery (`FEATURE_HOME_DELIVERY=false`).
- **Drugs and Cosmetics Rules, 1945 Compliance:**
  - Counter dispensing of Schedule H, Schedule H1, and Schedule X pharmaceuticals requires a valid physical prescription issued by a Registered Medical Practitioner (RMP).
  - The UI explicitly mandates this counter obligation across all portals before inquiry submission and on results cards.
- **Questions for Legal Counsel:**
  1. Does providing live availability confirmation for Schedule H / H1 drugs constitute "solicitation" or "advertisement" under Section 3 of the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954? *(Current opinion: Inquiry is consumer-initiated for availability only, not promotional advertisement).*
  2. Are any state-specific drug control administration permissions required for an electronic communication channel that facilitates consumer-to-chemist availability matching?

---

## 2. Chemist Licence Verification Process
- **Verification Standard:** Chemist onboarding requires submission of a valid State Retail Drug Licence Number (Form 20 for Allopathic drugs / Form 21 for Schedule C/C1 drugs) and shop address.
- **Administrative Responsibility:**
  - Independent administrators must cross-reference submitted licences with respective State Drug Control Department registries before transitioning accounts from `pending` to `verified`.
- **Questions for Pharmacist Review:**
  1. What is the standard protocol for handling seasonal licence renewals (e.g. valid validity grace periods in Uttar Pradesh, Rajasthan, and Madhya Pradesh)?
  2. How should the platform manage chemist shops with multiple registered qualified persons (pharmacists on duty)?

---

## 3. Data Protection & Sensitive Health Data (BIS IS 17428 Alignment)
- **Principle of Minimality:**
  - Patient GPS coordinates are coarsened to ~200m before transmission.
  - Coarse coordinates are purged from database records upon inquiry conclusion or expiry.
  - Raw medicine search queries are retained for a maximum of 90 days for operational reliability, after which they are de-identified or permanently deleted.
  - Zero third-party advertising trackers or behavioral pixels are integrated on health search queries.
- **Questions for Legal Counsel:**
  1. Does the Digital Personal Data Protection Act (DPDPA), 2023 classify medicine search queries as health data requiring specific consent management architecture?
  2. Is the 90-day retention schedule legally compliant for audit defense in the event of dispute investigations?
