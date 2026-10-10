"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { X, Phone, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: "customer" | "chemist" | "admin";
}

export function AuthModal({ isOpen, onClose, defaultRole = "customer" }: AuthModalProps) {
  const { sendOtp, verifyOtp, verifyAdmin, loginAsCustomer, loginAsChemist, loginAsAdmin } = useAuth();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<"phone" | "admin">(defaultRole === "admin" ? "admin" : "phone");
  const [roleSelection, setRoleSelection] = useState<"customer" | "chemist">(
    defaultRole === "chemist" ? "chemist" : "customer"
  );
  const [phone, setPhone] = useState("");
  const [otpStep, setOtpStep] = useState<"enterPhone" | "enterOtp">("enterPhone");
  const [otp, setOtp] = useState("");
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);

  // Admin states
  const [adminEmail, setAdminEmail] = useState("admin@medicinestock.in");
  const [adminPassword, setAdminPassword] = useState("Admin@Secure2026");
  const [admin2FA, setAdmin2FA] = useState("123456");

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError(null);
    const res = await sendOtp(phone);
    setDemoCodeHint(res.demoCode);
    setOtpStep("enterOtp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the verification code");
      return;
    }
    const success = await verifyOtp(phone, otp, roleSelection);
    if (success) {
      onClose();
    } else {
      setError("Invalid code. Use demo code: 123456");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyAdmin(adminEmail, adminPassword, admin2FA);
    if (success) {
      onClose();
    } else {
      setError("Invalid admin credentials or 2FA code");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-none animate-fadeIn">
      <div
        className="card-base w-full max-w-md p-6 bg-surface relative shadow-dropdown border border-stone"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink rounded-btn"
          aria-label={t("common.close")}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switchers */}
        <div className="flex border-b border-stone mb-6">
          <button
            onClick={() => {
              setActiveTab("phone");
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
              activeTab === "phone" ? "border-forest text-forest" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Phone className="w-4 h-4 inline mr-1.5" />
            {t("auth.mobileNumber")} (OTP)
          </button>
          <button
            onClick={() => {
              setActiveTab("admin");
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
              activeTab === "admin" ? "border-forest text-forest" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Lock className="w-4 h-4 inline mr-1.5" />
            {t("common.admin")} (2FA)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-unavailable/10 border border-unavailable/30 rounded-btn text-xs text-unavailable">
            {error}
          </div>
        )}

        {/* Phone OTP Flow */}
        {activeTab === "phone" && (
          <div>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setRoleSelection("customer")}
                className={`flex-1 py-2 text-xs font-semibold rounded-btn border ${
                  roleSelection === "customer"
                    ? "bg-forest text-white border-forest"
                    : "bg-surface text-ink border-stone hover:bg-paper"
                }`}
              >
                {t("common.customer")}
              </button>
              <button
                type="button"
                onClick={() => setRoleSelection("chemist")}
                className={`flex-1 py-2 text-xs font-semibold rounded-btn border ${
                  roleSelection === "chemist"
                    ? "bg-forest text-white border-forest"
                    : "bg-surface text-ink border-stone hover:bg-paper"
                }`}
              >
                {t("common.chemist")}
              </button>
            </div>

            {otpStep === "enterPhone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    {roleSelection === "chemist" ? t("auth.chemistLoginTitle") : t("auth.customerLoginTitle")}
                  </label>
                  <div className="flex gap-2">
                    <span className="input-base flex items-center justify-center font-mono text-sm px-3 bg-paper">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder={t("auth.mobilePlaceholder")}
                      className="input-base flex-1 font-mono text-sm"
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" className="btn-base btn-forest w-full">
                  {t("auth.sendOtp")}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-xs text-ink-muted">
                  {t("auth.otpSentTo", { phone: `+91 ${phone}` })}
                  <button
                    type="button"
                    onClick={() => setOtpStep("enterPhone")}
                    className="ml-2 text-forest underline"
                  >
                    Change
                  </button>
                </div>

                {demoCodeHint && (
                  <div className="p-2 bg-sage/20 border border-sage/40 rounded-btn text-xs text-ink flex items-center justify-between">
                    <span>
                      Demo OTP Code: <strong className="font-mono">{demoCodeHint}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtp(demoCodeHint)}
                      className="text-forest text-xs font-semibold underline"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    {t("auth.enterOtp")}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="input-base w-full font-mono text-center tracking-widest text-lg"
                    autoFocus
                  />
                </div>

                <button type="submit" className="btn-base btn-forest w-full">
                  {t("auth.verifyOtp")}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Admin 2FA Flow */}
        {activeTab === "admin" && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">{t("auth.email")}</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="input-base w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">{t("auth.password")}</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="input-base w-full text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                {t("auth.twoFactorCode")}
              </label>
              <input
                type="text"
                value={admin2FA}
                onChange={(e) => setAdmin2FA(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="input-base w-full font-mono text-center tracking-widest text-lg"
              />
              <span className="text-[11px] text-ink-muted mt-1 block">Pre-filled with demo code: 123456</span>
            </div>

            <button type="submit" className="btn-base btn-forest w-full">
              {t("auth.adminSubmit")}
            </button>
          </form>
        )}

        {/* Quick Demo Login Shortcuts */}
        <div className="mt-6 pt-5 border-t border-stone">
          <p className="text-xs font-semibold text-ink-muted text-center mb-3">
            {t("auth.demoQuickLogin")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                loginAsCustomer();
                onClose();
              }}
              className="btn-base btn-outline text-xs px-2 py-2"
            >
              {t("common.customer")}
            </button>
            <button
              type="button"
              onClick={() => {
                loginAsChemist("chem_1");
                onClose();
              }}
              className="btn-base btn-outline text-xs px-2 py-2"
            >
              {t("common.chemist")}
            </button>
            <button
              type="button"
              onClick={() => {
                loginAsAdmin();
                onClose();
              }}
              className="btn-base btn-outline text-xs px-2 py-2"
            >
              {t("common.admin")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
