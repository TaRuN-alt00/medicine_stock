"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { Store, CheckCircle, ShieldCheck, Zap, BellRing, ArrowRight, UserPlus } from "lucide-react";
import { ChemistRegisterModal } from "@/components/ChemistRegisterModal";

export default function ForChemistsPage() {
  const { loginAsChemist } = useAuth();
  const { t } = useI18n();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          For Licensed Pharmacists & Druggists
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink">
          Connect with nearby patients looking for medicines you have in stock.
        </h1>
        <p className="text-sm md:text-base text-ink-muted max-w-2xl mx-auto leading-relaxed">
          Stop losing footfall. When a patient searches for a medicine nearby, receive a ping on your counter phone or tablet, tap <strong>Yes</strong> in 1 second, and welcome the customer to your shop.
        </p>
      </div>

      {/* 3 Pillars for Chemists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base p-6 bg-surface space-y-3">
          <div className="w-10 h-10 rounded-btn bg-paper border border-stone flex items-center justify-center text-forest">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink">One-Tap Answering</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            No typing, no catalog uploads, no inventory software integration. Just two huge buttons: <strong>Yes</strong> or <strong>No</strong>. Takes less than 2 seconds.
          </p>
        </div>

        <div className="card-base p-6 bg-surface space-y-3">
          <div className="w-10 h-10 rounded-btn bg-paper border border-stone flex items-center justify-center text-forest">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink">Strict Counter Dispensing</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Customers purchase directly at your counter. You inspect the physical prescription and collect your standard payment directly. No middlemen or commissions.
          </p>
        </div>

        <div className="card-base p-6 bg-surface space-y-3">
          <div className="w-10 h-10 rounded-btn bg-paper border border-stone flex items-center justify-center text-forest">
            <BellRing className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink">Anti-Annoyance Controls</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Close for lunch or night? Flip the switch to "Closed for now" with one tap and all notifications pause instantly. Quiet hours respected automatically.
          </p>
        </div>
      </div>

      {/* Onboarding requirements card */}
      <div className="card-base p-8 bg-surface border-2 border-stone space-y-6">
        <h2 className="font-serif text-2xl font-bold text-ink">
          Verification Requirements
        </h2>
        <p className="text-xs md:text-sm text-ink-muted">
          To maintain patient trust, every chemist is manually verified by our administration team before receiving live requests:
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-ink">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-forest shrink-0" />
            <span>Valid State Retail Drug Licence (Form 20 / 21)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-forest shrink-0" />
            <span>Registered physical retail pharmacy location</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-forest shrink-0" />
            <span>Active phone number for patient verification calls</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-forest shrink-0" />
            <span>Free pilot membership — zero subscription fees</span>
          </li>
        </ul>

        <div className="pt-4 border-t border-stone flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="btn-base btn-forest px-6 text-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Your Pharmacy Now</span>
          </button>
          <Link
            href="/chemist"
            onClick={() => loginAsChemist("chem_1")}
            className="btn-base btn-outline px-6 text-sm"
          >
            Launch Chemist Terminal (Live Demo)
          </Link>
        </div>
      </div>

      <ChemistRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  );
}
