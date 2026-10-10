"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Shield, HeartHandshake, PhoneCall } from "lucide-react";

export function Footer() {
  const { t, language, toggleLanguage } = useI18n();

  return (
    <footer className="bg-paper border-t border-stone mt-16 pt-12 pb-8 text-sm text-ink-muted">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Product Intro */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-forest text-white font-serif font-bold text-xs flex items-center justify-center">
                M
              </div>
              <span className="font-serif font-bold text-ink text-base">
                {t("common.appName")}
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-md">
              {t("common.subTagline")}
            </p>
            <div className="p-3 bg-surface border border-stone rounded-card text-xs space-y-1.5 max-w-md">
              <div className="flex items-center gap-1.5 font-semibold text-ink">
                <Shield className="w-3.5 h-3.5 text-forest" />
                <span>Non-Pharmacy Availability Layer</span>
              </div>
              <p className="text-[11px] text-ink-muted leading-normal">
                This service never stocks, dispenses, prescribes, or delivers medicine. No medical advice is offered. Availability responses are provided directly by independent, licensed pharmacists.
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-ink text-sm mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-forest transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-forest transition-colors">
                  {t("nav.howItWorks")}
                </Link>
              </li>
              <li>
                <Link href="/for-chemists" className="hover:text-forest transition-colors">
                  {t("nav.forChemists")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-forest transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-forest transition-colors">
                  {t("nav.disclaimer")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Compliance */}
          <div>
            <h4 className="font-serif font-semibold text-ink text-sm mb-3">
              Privacy & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-forest transition-colors">
                  {t("nav.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-forest transition-colors">
                  {t("nav.terms")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-forest transition-colors">
                  {t("nav.help")}
                </Link>
              </li>
              <li className="pt-2">
                <button
                  onClick={toggleLanguage}
                  className="text-forest underline text-xs font-semibold"
                >
                  {language === "en" ? "हिन्दी में पढ़ें" : "Read in English"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-stone flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          <p>
            Designed to align with BIS IS 17428 & ISO/IEC 27001 data protection principles.
          </p>
          <p>
            © {new Date().getFullYear()} {t("common.appName")}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
