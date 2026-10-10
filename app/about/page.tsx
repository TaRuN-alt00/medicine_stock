"use client";

import React from "react";
import { ShieldCheck, HeartHandshake, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          About Medicine Stock Finder
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink">
          Solving the 5-shop visit problem in India's tier-2 and tier-3 towns.
        </h1>
      </div>

      <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
        <p>
          In towns like Meerut, Gorakhpur, Alwar, and Bilaspur, finding a specific prescribed medicine often means visiting shop after shop under the sun. Many chemist shops are small, have varying distributors, and do not maintain shared online stock feeds.
        </p>
        <p>
          Medicine Stock Finder bridges this gap with an <strong>availability and inquiry layer</strong>. We don't warehouse medicines, we don't sell medicines, and we don't deliver medicines. Instead, we connect patients to open neighbourhood chemists in real-time, letting the pharmacist tap a single button to confirm stock.
        </p>
      </div>

      <div className="card-base p-6 bg-surface space-y-4 border border-stone">
        <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-forest" />
          <span>Our Core Ethical & Operational Boundaries</span>
        </h2>
        <ul className="space-y-2 text-xs text-ink leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="font-bold text-forest">•</span>
            <span><strong>Never an online pharmacy:</strong> No medicines are bought, sold, or shipped through this app.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-forest">•</span>
            <span><strong>No dosage or clinical advice:</strong> Brand-to-salt information is strictly informational reference. Patients must consult their doctor or chemist before changing medicines.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-forest">•</span>
            <span><strong>Strict privacy assurance:</strong> Patient location is coarsened to ~200m and automatically purged when the inquiry closes. Raw medicine searches are purged after 90 days.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
