"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, FileText } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Legal & Medical Notice
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink">
          Medicine Information & Non-Dispensing Disclaimer
        </h1>
      </div>

      <div className="card-base p-6 bg-surface border-2 border-stone space-y-4">
        <div className="flex items-center gap-2 text-unavailable font-bold text-base">
          <AlertTriangle className="w-5 h-5" />
          <span>Important Notice for Patients and Families</span>
        </div>
        <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
          Medicine Stock Finder is strictly an availability discovery tool. <strong>It does not operate as an online pharmacy, does not process digital orders, and does not provide home delivery of pharmaceuticals.</strong>
        </p>
      </div>

      <div className="space-y-6 text-xs md:text-sm text-ink leading-relaxed">
        <div className="card-base p-5 bg-paper space-y-2">
          <h2 className="font-serif font-bold text-base text-ink">1. Prescription Obligation at Counter</h2>
          <p className="text-ink-muted">
            For all drugs classified under Schedule H, Schedule H1, or Schedule X of the Drugs and Cosmetics Rules, 1945, a valid physical prescription written by a Registered Medical Practitioner (RMP) is mandatory. A chemist confirming stock on this platform does not waive or substitute the requirement to present a valid prescription at the counter.
          </p>
        </div>

        <div className="card-base p-5 bg-paper space-y-2">
          <h2 className="font-serif font-bold text-base text-ink">2. No Substitution as Medical Advice</h2>
          <p className="text-ink-muted">
            Salt and composition details displayed on this platform are sourced from standard pharmacopoeial references solely for identifying equivalent therapeutic categories. <em>Always ask your chemist or doctor before changing any medicine or choosing an alternative brand.</em>
          </p>
        </div>

        <div className="card-base p-5 bg-paper space-y-2">
          <h2 className="font-serif font-bold text-base text-ink">3. Real-Time Stock Fluctuation</h2>
          <p className="text-ink-muted">
            Stock answers reflect the chemist&apos;s confirmation at the time of inquiry. Physical counter purchases take place on a first-come, first-served basis at the chemist&apos;s physical shop.
          </p>
        </div>
      </div>
    </div>
  );
}
