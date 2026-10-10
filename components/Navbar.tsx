"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { AuthModal } from "./AuthModal";
import {
  Globe,
  User,
  Store,
  Shield,
  Menu,
  X,
  LogOut,
  LogIn,
  CheckCircle,
} from "lucide-react";

export function Navbar() {
  const { user, role, logout, loginAsCustomer, loginAsChemist, loginAsAdmin } = useAuth();
  const { language, toggleLanguage, t } = useI18n();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<"customer" | "chemist" | "admin">("customer");

  const openAuth = (targetRole: "customer" | "chemist" | "admin") => {
    setAuthDefaultRole(targetRole);
    setIsAuthOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-surface border-b border-stone sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-btn bg-forest flex items-center justify-center text-white font-serif font-bold text-lg shrink-0">
              M
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-ink block leading-tight tracking-tight group-hover:text-forest transition-colors">
                {t("common.appName")}
              </span>
              <span className="text-[11px] text-ink-muted hidden sm:block leading-none">
                {t("common.tagline")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
            <Link href="/" className="hover:text-ink transition-colors">
              {t("nav.home")}
            </Link>
            <Link href="/how-it-works" className="hover:text-ink transition-colors">
              {t("nav.howItWorks")}
            </Link>
            <Link href="/for-chemists" className="hover:text-ink transition-colors">
              {t("nav.forChemists")}
            </Link>
            <Link href="/about" className="hover:text-ink transition-colors">
              {t("nav.about")}
            </Link>
          </nav>

          {/* Right actions: Role Quick Switcher, i18n, Auth */}
          <div className="flex items-center gap-2">
            {/* Quick Role Switcher (Active Portal selector) */}
            <div className="hidden lg:flex items-center bg-paper p-1 rounded-btn border border-stone text-xs font-semibold">
              <Link
                href="/"
                onClick={() => loginAsCustomer()}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  role === "customer" || !role
                    ? "bg-surface text-forest shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                {t("common.customer")}
              </Link>
              <Link
                href="/chemist"
                onClick={() => loginAsChemist("chem_1")}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  role === "chemist"
                    ? "bg-surface text-forest shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                {t("common.chemist")}
              </Link>
              <Link
                href="/admin"
                onClick={() => loginAsAdmin()}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  role === "admin"
                    ? "bg-surface text-forest shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                {t("common.admin")}
              </Link>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="btn-base btn-outline text-xs px-3 h-9 flex items-center gap-1.5"
              aria-label={`Switch language to ${language === "en" ? "Hindi" : "English"}`}
            >
              <Globe className="w-3.5 h-3.5 text-forest" />
              <span>{t("common.switchLanguage")}</span>
            </button>

            {/* User Auth state */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-1 bg-sage/20 text-forest rounded">
                  {user.role.toUpperCase()}
                </span>
                <button
                  onClick={logout}
                  className="btn-base btn-outline text-xs px-3 h-9 flex items-center gap-1 text-ink-muted hover:text-unavailable"
                  title={t("common.logout")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("common.logout")}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuth("customer")}
                className="btn-base btn-forest text-xs px-3.5 h-9 flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t("common.login")}</span>
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink rounded-btn hover:bg-paper"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone bg-surface px-4 py-4 space-y-3">
            <div className="flex flex-col gap-2 pb-3 border-b border-stone">
              <span className="text-xs font-semibold text-ink-muted">{t("common.portal")}</span>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/"
                  onClick={() => {
                    loginAsCustomer();
                    setMobileMenuOpen(false);
                  }}
                  className={`btn-base text-xs py-1.5 ${
                    role === "customer" ? "btn-forest" : "btn-outline"
                  }`}
                >
                  {t("common.customer")}
                </Link>
                <Link
                  href="/chemist"
                  onClick={() => {
                    loginAsChemist("chem_1");
                    setMobileMenuOpen(false);
                  }}
                  className={`btn-base text-xs py-1.5 ${
                    role === "chemist" ? "btn-forest" : "btn-outline"
                  }`}
                >
                  {t("common.chemist")}
                </Link>
                <Link
                  href="/admin"
                  onClick={() => {
                    loginAsAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className={`btn-base text-xs py-1.5 ${
                    role === "admin" ? "btn-forest" : "btn-outline"
                  }`}
                >
                  {t("common.admin")}
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-ink hover:text-forest"
              >
                {t("nav.home")}
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-ink hover:text-forest"
              >
                {t("nav.howItWorks")}
              </Link>
              <Link
                href="/for-chemists"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-ink hover:text-forest"
              >
                {t("nav.forChemists")}
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-ink hover:text-forest"
              >
                {t("nav.about")}
              </Link>
              <Link
                href="/disclaimer"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-ink hover:text-forest"
              >
                {t("nav.disclaimer")}
              </Link>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultRole={authDefaultRole}
      />
    </>
  );
}
