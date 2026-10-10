"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/db";
import { Medicine } from "@/lib/types";
import { VoiceSearchModal } from "@/components/VoiceSearchModal";
import { PhotoSearchModal } from "@/components/PhotoSearchModal";
import {
  Search,
  Mic,
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Store,
  PhoneCall,
  Navigation,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { t } = useI18n();
  const { loginAsCustomer, loginAsChemist, loginAsAdmin } = useAuth();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [showPrescriptionNotice, setShowPrescriptionNotice] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  const handleSearchInput = (val: string) => {
    setQuery(val);
    if (val.trim().length >= 2) {
      const results = db.searchMedicines(val);
      setSuggestions(results.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectMed = (med: Medicine) => {
    setSelectedMed(med);
    setQuery(med.brandName);
    setSuggestions([]);
    if (med.prescriptionRequired) {
      setShowPrescriptionNotice(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 bg-paper border-b border-stone">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-stone text-xs font-semibold text-forest">
            <span className="w-2 h-2 rounded-full bg-available animate-pulse"></span>
            <span>Live Chemist Stock Network</span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink tracking-tight leading-tight">
            {t("home.heroTitle")}
          </h1>

          <p className="text-base md:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            {t("home.heroDesc")}
          </p>

          {/* Main Medicine Search Box */}
          <div className="pt-4 max-w-2xl mx-auto relative text-left">
            <div className="card-base bg-surface p-2 shadow-soft border-stone flex items-center gap-2">
              <div className="p-2 text-forest">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="w-full text-base bg-transparent border-none outline-none text-ink placeholder:text-ink-muted/70 py-2"
                aria-label="Search medicine name or salt composition"
              />
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="p-2 text-ink-muted hover:text-forest transition-colors rounded-btn"
                title={t("home.voiceSearch")}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsPhotoOpen(true)}
                className="p-2 text-ink-muted hover:text-forest transition-colors rounded-btn"
                title={t("home.photoSearch")}
              >
                <Camera className="w-5 h-5" />
              </button>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="btn-base btn-forest px-5 text-sm shrink-0 whitespace-nowrap"
              >
                {t("home.searchBtn")}
              </Link>
            </div>

            {/* Live Autocomplete suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 card-base bg-surface shadow-dropdown z-30 divide-y divide-stone max-h-80 overflow-y-auto">
                {suggestions.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleSelectMed(med)}
                    className="w-full text-left p-3.5 hover:bg-paper transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-ink text-sm flex items-center gap-2">
                        <span>{med.brandName}</span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 bg-paper rounded text-ink-muted border border-stone">
                          {med.form}
                        </span>
                        {med.prescriptionRequired && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-unavailable/10 text-unavailable rounded">
                            Rx Required
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        Composition: <span className="font-medium text-ink">{med.saltComposition}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-muted shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Prescription Warning Notice Modal */}
            {showPrescriptionNotice && selectedMed && (
              <div className="mt-4 p-4 bg-paper border border-stone rounded-card text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-ink">
                  <ShieldAlert className="w-4 h-4 text-unavailable shrink-0" />
                  <span>Prescription Notice: {selectedMed.brandName}</span>
                </div>
                <p className="text-ink-muted">
                  This medicine is classified under Schedule {selectedMed.schedule}. By law, licensed chemists will require a physical prescription at the shop counter before handing over this medication.
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setShowPrescriptionNotice(false)}
                    className="btn-base btn-outline text-xs px-3 py-1.5"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            )}

            {/* Popular quick-tap pills */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-muted">
              <span>Popular searches:</span>
              {["Dolo 650", "Azithral 500", "Augmentin 625", "Montair-LC", "Pan 40"].map((name) => (
                <button
                  key={name}
                  onClick={() => handleSearchInput(name)}
                  className="px-2.5 py-1 bg-surface border border-stone rounded-btn hover:border-forest text-ink transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Portal Quick Launcher (Demonstration and Navigation) */}
      <section className="py-8 px-4 bg-surface border-b border-stone">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest">
              Experience the 3 Portals
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink mt-1">
              Select a portal to explore
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Portal Card */}
            <div className="card-base p-5 hover:border-forest transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-btn bg-paper flex items-center justify-center text-forest border border-stone">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Customer Portal</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Search medicines, get fuzzy salt suggestions, broadcast request to nearby chemists, and watch live confirmations on the map.
                </p>
              </div>
              <div className="pt-4 mt-auto">
                <Link
                  href="/search?q=Dolo"
                  onClick={() => loginAsCustomer()}
                  className="btn-base btn-forest w-full text-xs"
                >
                  Explore Customer Search
                </Link>
              </div>
            </div>

            {/* Chemist Portal Card */}
            <div className="card-base p-5 hover:border-forest transition-colors flex flex-col justify-between border-2 border-stone">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-btn bg-paper flex items-center justify-center text-forest border border-stone">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Chemist Portal</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  The heart of the app. Single-tap <strong>Yes / No</strong> reply buttons, 5-second undo toast, open/closed toggle, and audio alerts.
                </p>
              </div>
              <div className="pt-4 mt-auto">
                <Link
                  href="/chemist"
                  onClick={() => loginAsChemist("chem_1")}
                  className="btn-base btn-outline w-full text-xs font-semibold"
                >
                  Open Chemist Terminal
                </Link>
              </div>
            </div>

            {/* Admin Portal Card */}
            <div className="card-base p-5 hover:border-forest transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-btn bg-paper flex items-center justify-center text-forest border border-stone">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Admin Control</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Verify chemist drug licences, manage medicine database with CSV import, inspect live requests feed, and view audit logs.
                </p>
              </div>
              <div className="pt-4 mt-auto">
                <Link
                  href="/admin"
                  onClick={() => loginAsAdmin()}
                  className="btn-base btn-outline w-full text-xs font-semibold"
                >
                  Access Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps How it works */}
      <section className="py-12 md:py-16 px-4 bg-paper">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink">
              {t("home.howTitle")}
            </h2>
            <p className="text-xs md:text-sm text-ink-muted max-w-md mx-auto">
              Built for speed and simplicity. No complex app downloads, no digital payments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-base p-5 bg-surface space-y-2">
              <span className="font-mono text-xs font-bold text-forest">01</span>
              <h3 className="font-serif font-semibold text-base text-ink">{t("home.step1Title")}</h3>
              <p className="text-xs text-ink-muted leading-relaxed">{t("home.step1Desc")}</p>
            </div>
            <div className="card-base p-5 bg-surface space-y-2">
              <span className="font-mono text-xs font-bold text-forest">02</span>
              <h3 className="font-serif font-semibold text-base text-ink">{t("home.step2Title")}</h3>
              <p className="text-xs text-ink-muted leading-relaxed">{t("home.step2Desc")}</p>
            </div>
            <div className="card-base p-5 bg-surface space-y-2">
              <span className="font-mono text-xs font-bold text-forest">03</span>
              <h3 className="font-serif font-semibold text-base text-ink">{t("home.step3Title")}</h3>
              <p className="text-xs text-ink-muted leading-relaxed">{t("home.step3Desc")}</p>
            </div>
            <div className="card-base p-5 bg-surface space-y-2">
              <span className="font-mono text-xs font-bold text-forest">04</span>
              <h3 className="font-serif font-semibold text-base text-ink">{t("home.step4Title")}</h3>
              <p className="text-xs text-ink-muted leading-relaxed">{t("home.step4Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Voice & Camera Modals */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscript={(text) => handleSearchInput(text)}
      />

      <PhotoSearchModal
        isOpen={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        onSelectMedicine={(medicineName) => handleSearchInput(medicineName)}
      />
    </div>
  );
}
