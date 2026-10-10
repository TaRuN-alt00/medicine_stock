"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Search, Radio, CheckCheck, MapPin, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  const { t } = useI18n();

  const steps = [
    {
      num: "Step 01",
      icon: Search,
      title: "Search your medicine",
      desc: "Type the brand name (like Dolo 650) or composition (Paracetamol). You can also use voice search in Hindi or English, or upload a photo of the medicine strip.",
      highlight: "Brand-to-salt matching allows you to check for any equivalent generic brand.",
    },
    {
      num: "Step 02",
      icon: Radio,
      title: "Live ping to open neighbourhood chemists",
      desc: "We look for verified, currently open chemists within 3 km of your coarse location. A live availability notification is pushed directly to their counter terminal.",
      highlight: "Your exact address is never shared—only coarse proximity (~200m).",
    },
    {
      num: "Step 03",
      icon: CheckCheck,
      title: "1-Tap reply: Yes or No",
      desc: "Chemists answer with a single tap on their screen. No typing, no bargaining, no waiting. If a chemist taps 'Yes', the medicine is confirmed available.",
      highlight: "Confirmed availability is protected for 30 minutes to give you time to visit.",
    },
    {
      num: "Step 04",
      icon: MapPin,
      title: "Choose, Call, and Collect",
      desc: "You receive a list and map view of confirmed chemists with exact distance, driving/walking directions, and a direct Call button to speak to the pharmacist.",
      highlight: "Purchase happens strictly across the counter with a valid doctor's prescription.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Transparent Process
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink">
          How Medicine Stock Finder Works
        </h1>
        <p className="text-sm md:text-base text-ink-muted max-w-xl mx-auto">
          Built to save patients and elderly families in tier-2 and tier-3 towns from visiting 5 different shops in the heat or rain.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="card-base p-6 bg-surface flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="w-12 h-12 rounded-btn bg-paper border border-stone flex items-center justify-center text-forest shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <span className="font-mono text-xs font-bold text-forest">{s.num}</span>
                <h2 className="font-serif text-xl font-bold text-ink">{s.title}</h2>
                <p className="text-sm text-ink-muted leading-relaxed">{s.desc}</p>
                <div className="p-3 bg-paper rounded-btn border border-stone text-xs text-ink font-medium">
                  💡 {s.highlight}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link href="/" className="btn-base btn-forest px-6 text-sm inline-flex items-center gap-2">
          <span>Search a Medicine Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
