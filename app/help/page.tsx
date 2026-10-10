"use client";

import React from "react";
import { HelpCircle, PhoneCall, Mail, MessageSquare } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Support & Assistance
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink">
          Help & Contact
        </h1>
        <p className="text-sm text-ink-muted">
          Need assistance using the platform or have feedback from your town? Reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-base p-6 bg-surface space-y-2">
          <PhoneCall className="w-5 h-5 text-forest" />
          <h2 className="font-serif font-bold text-base text-ink">Helpline (Pilot Towns)</h2>
          <p className="text-xs text-ink-muted">
            Toll-free assistance for patients and families during standard pilot hours (9:00 AM - 8:00 PM IST).
          </p>
          <div className="pt-2 font-mono text-sm font-bold text-forest">
            1800-123-MEDS (6337)
          </div>
        </div>

        <div className="card-base p-6 bg-surface space-y-2">
          <Mail className="w-5 h-5 text-forest" />
          <h2 className="font-serif font-bold text-base text-ink">Chemist Verification Support</h2>
          <p className="text-xs text-ink-muted">
            For pharmacy owners with questions about drug licence approval status or quiet-hours settings.
          </p>
          <div className="pt-2 font-mono text-sm font-bold text-forest">
            chemists@medicinestock.in
          </div>
        </div>
      </div>
    </div>
  );
}
