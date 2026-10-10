"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Legal Agreement
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink">
          Terms of Use
        </h1>
      </div>

      <div className="card-base p-6 bg-surface space-y-4 text-xs md:text-sm text-ink leading-relaxed">
        <p>
          By using Medicine Stock Finder, you agree to the following terms governing the availability inquiry service:
        </p>

        <h3 className="font-serif font-bold text-base text-ink pt-2">1. Nature of Platform</h3>
        <p className="text-ink-muted">
          Medicine Stock Finder operates solely as an inquiry and availability communication platform connecting prospective consumers with independent, licensed retail chemists. The platform does not sell, broker, or deliver drugs.
        </p>

        <h3 className="font-serif font-bold text-base text-ink pt-2">2. Independent Pharmacist Counter Transaction</h3>
        <p className="text-ink-muted">
          All dispensing, verification of prescriptions, pricing, and handover of medicines take place entirely under the direct supervision of licensed pharmacists at their respective physical premises.
        </p>

        <h3 className="font-serif font-bold text-base text-ink pt-2">3. Prohibited Misuse</h3>
        <p className="text-ink-muted">
          Users agree not to flood chemists with fraudulent or automated inquiries. Rate limits and bot-detection measures are enforced to preserve the platform for genuine emergency and clinical inquiries.
        </p>
      </div>
    </div>
  );
}
