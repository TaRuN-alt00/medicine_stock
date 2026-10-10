"use client";

import React from "react";
import { ShieldCheck, EyeOff, Trash2, Clock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Data Protection
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink">
          Privacy Policy
        </h1>
        <p className="text-xs text-ink-muted">
          Last revised: October 2026. Designed to align with BIS IS 17428 (Data Privacy Assurance) principles.
        </p>
      </div>

      <div className="space-y-6 text-xs md:text-sm text-ink leading-relaxed">
        <div className="card-base p-6 bg-surface space-y-3">
          <div className="flex items-center gap-2 font-serif font-bold text-base text-ink">
            <EyeOff className="w-5 h-5 text-forest" />
            <span>1. Minimum Personal Data Collected</span>
          </div>
          <p className="text-ink-muted">
            We treat medicine inquiries as sensitive health-related information. We do not sell, rent, or trade your personal data. No third-party ad trackers or advertising behavioral pixels are used on medicine search text.
          </p>
        </div>

        <div className="card-base p-6 bg-surface space-y-3">
          <div className="flex items-center gap-2 font-serif font-bold text-base text-ink">
            <ShieldCheck className="w-5 h-5 text-forest" />
            <span>2. Coarse Geolocation Only</span>
          </div>
          <p className="text-ink-muted">
            We never store or transmit your precise GPS coordinates. Coordinates are coarsened (rounded to ~200 meters) before routing inquiries to nearby chemists. This coarse coordinate is permanently purged once the search request closes or expires.
          </p>
        </div>

        <div className="card-base p-6 bg-surface space-y-3">
          <div className="flex items-center gap-2 font-serif font-bold text-base text-ink">
            <Clock className="w-5 h-5 text-forest" />
            <span>3. 90-Day Retention Limit</span>
          </div>
          <p className="text-ink-muted">
            Raw medicine search text is automatically anonymized or purged within 90 days. Aggregated performance metrics (such as average response time) are retained solely in de-identified format for service reliability analysis.
          </p>
        </div>

        <div className="card-base p-6 bg-surface space-y-3">
          <div className="flex items-center gap-2 font-serif font-bold text-base text-ink">
            <Trash2 className="w-5 h-5 text-unavailable" />
            <span>4. Complete Account & History Deletion</span>
          </div>
          <p className="text-ink-muted">
            You can delete your account and past inquiries at any time with a single tap in your profile settings. Upon deletion, all associated session records are permanently wiped.
          </p>
        </div>
      </div>
    </div>
  );
}
