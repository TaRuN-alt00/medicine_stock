"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { db } from "@/lib/db";
import { Chemist, MedicineRequest } from "@/lib/types";
import { playChemistAlertSound } from "@/lib/sound";
import {
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  Bell,
  Power,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  MapPin,
  FileText,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

export default function ChemistPortalPage() {
  const {
    user,
    role,
    activeChemist,
    toggleChemistOpen,
    loginChemistWithCredentials,
    logout,
  } = useAuth();
  const { t } = useI18n();

  // Auth gate tabs: "login" | "register"
  const [gateTab, setGateTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  // Register form state
  const [regShopName, setRegShopName] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regLicence, setRegLicence] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regTown, setRegTown] = useState("Meerut");
  const [regIs24Hours, setRegIs24Hours] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Terminal active states
  const [incomingRequests, setIncomingRequests] = useState<MedicineRequest[]>([]);
  const [undoToast, setUndoToast] = useState<{ id: string; seconds: number; requestId: string } | null>(null);
  const [penaltyToast, setPenaltyToast] = useState<{ query: string; penalty: string } | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const res = await Notification.requestPermission();
      setNotificationPermission(res);
    }
  };

  // Keep incoming requests in sync with DB for active chemist
  useEffect(() => {
    if (!activeChemist) return;

    const updateRequests = () => {
      const reqs = db.getIncomingRequestsForChemist(activeChemist.id);
      if (reqs.length > incomingRequests.length) {
        playChemistAlertSound();
      }
      setIncomingRequests(reqs);
    };

    updateRequests();
    const unsubscribe = db.subscribe(updateRequests);
    return () => unsubscribe();
  }, [activeChemist]);

  // Live 1-second interval for 10-minute inquiry countdowns & auto-penalization
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTimeMs(now);

      if (activeChemist && incomingRequests.length > 0) {
        incomingRequests.forEach((req) => {
          const expiresAtMs = new Date(req.expiresAt).getTime();
          if (now >= expiresAtMs) {
            // 10 minutes passed without reply! Apply penalty and remove
            db.handleChemistTimeout(activeChemist.id, req.id);
            setPenaltyToast({
              query: req.medicineQuery,
              penalty: `10-minute inquiry window closed without response! Reliability score penalized (-5%).`,
            });
            setTimeout(() => setPenaltyToast(null), 7000);
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeChemist, incomingRequests]);

  // Undo countdown timer
  useEffect(() => {
    if (!undoToast) return;
    if (undoToast.seconds <= 0) {
      setUndoToast(null);
      return;
    }
    const timer = setInterval(() => {
      setUndoToast((prev) => (prev ? { ...prev, seconds: prev.seconds - 1 } : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [undoToast]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setPendingNotice(null);

    if (!loginPhone || !loginPin) {
      setLoginError("Please enter both phone number and 6-digit PIN.");
      return;
    }

    const res = loginChemistWithCredentials(loginPhone, loginPin);
    if (!res.success) {
      if (res.status === "pending") {
        setPendingNotice(res.message || "Your pharmacy registration is pending administrative review in /admin.");
      } else {
        setLoginError(res.message || "Failed to log in.");
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regShopName || !regOwnerName || !regPhone || !regLicence || !regAddress) {
      alert("Please fill all required fields");
      return;
    }

    const newChemistId = "chem_" + Date.now();
    const newChemist: Chemist = {
      id: newChemistId,
      userId: "user_" + newChemistId,
      shopName: regShopName.trim(),
      ownerName: regOwnerName.trim(),
      phone: regPhone.trim(),
      pin: regPin.trim() || "123456",
      isSynthetic: false,
      drugLicenceNumber: regLicence.trim(),
      address: regAddress.trim(),
      town: regTown.trim(),
      status: "pending",
      openNow: true,
      hours: {
        open: "09:00",
        close: "22:00",
        is24Hours: regIs24Hours,
      },
      latitude: 28.985 + (Math.random() * 0.01 - 0.005),
      longitude: 77.708 + (Math.random() * 0.01 - 0.005),
      geohash: "ttp4ec",
      metrics: { replyRate: 100, avgReplyTimeSeconds: 25, confirmedObtainedRate: 100, consecutiveMisses: 0 },
      createdAt: new Date().toISOString(),
    };

    // Save chemist to DB with pending status
    db.addChemist(newChemist, "portal-registration");

    setRegSuccessMessage(
      `Shop "${newChemist.shopName}" enrolled! Your request has been sent to the Admin Verification Queue. Once the admin approves your Drug Licence (${newChemist.drugLicenceNumber}) at /admin, you can log in with phone: ${newChemist.phone} and your PIN.`
    );
    // Pre-fill login
    setLoginPhone(newChemist.phone);
    setLoginPin(newChemist.pin || "123456");
  };

  const handleReply = (requestId: string, answer: "yes" | "no") => {
    if (!activeChemist) return;

    db.respondToRequest({
      requestId,
      chemistId: activeChemist.id,
      answer,
    });

    setLastAnswer(answer);
    setUndoToast({
      id: "undo_" + Date.now(),
      seconds: 5,
      requestId,
    });

    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleUndo = () => {
    if (!undoToast || !activeChemist) return;
    db.undoResponse(undoToast.requestId, activeChemist.id);
    setUndoToast(null);
    setLastAnswer(null);
  };

  const sendTestInquiry = () => {
    if (!activeChemist) return;
    db.createRequest({
      customerId: "cust_test_" + Date.now(),
      medicineQuery: "Augmentin 625 Duo",
      matchedMedicine: {
        id: "med_test",
        brandName: "Augmentin 625 Duo",
        saltComposition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
        strength: "625mg",
        form: "tablet",
        schedule: "H",
        prescriptionRequired: true,
        synonyms: ["augmentin", "amoxicillin"],
        searchTokens: ["augmentin", "625"],
      },
      coarseLat: activeChemist.latitude,
      coarseLng: activeChemist.longitude,
      geohash: activeChemist.geohash,
      localityName: `${activeChemist.town} Market`,
      radiusKm: 3,
    });
  };

  // GATE SCREEN: If not logged in as a verified chemist
  if (!activeChemist || role !== "chemist") {
    return (
      <div className="max-w-xl mx-auto my-10 px-4 space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-btn bg-forest text-white flex items-center justify-center mx-auto shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink">
            Chemist Counter Terminal
          </h1>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Log in to receive audible stock inquiry alerts from neighbourhood patients, or register your licensed pharmacy.
          </p>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="card-base p-1 bg-paper border border-stone grid grid-cols-2 text-xs font-semibold">
          <button
            onClick={() => {
              setGateTab("login");
              setLoginError(null);
              setPendingNotice(null);
            }}
            className={`py-2 rounded-btn transition-colors flex items-center justify-center gap-1.5 ${
              gateTab === "login"
                ? "bg-surface text-forest shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Chemist Login (लॉगिन)</span>
          </button>
          <button
            onClick={() => {
              setGateTab("register");
              setRegSuccessMessage(null);
            }}
            className={`py-2 rounded-btn transition-colors flex items-center justify-center gap-1.5 ${
              gateTab === "register"
                ? "bg-surface text-forest shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Pharmacy (पंजीकरण)</span>
          </button>
        </div>

        {/* TAB 1: CHEMIST LOGIN */}
        {gateTab === "login" && (
          <div className="card-base p-6 bg-surface border border-stone space-y-5">
            {pendingNotice && (
              <div className="p-4 bg-pending/10 border border-pending/30 rounded-card text-xs text-ink space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-pending">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Administrative Verification Pending</span>
                </div>
                <p className="leading-relaxed text-ink-muted">{pendingNotice}</p>
                <p className="text-[11px] text-ink-muted font-medium">
                  Tip: If you are testing, you can open the <span className="font-mono text-ink font-bold">/admin</span> portal in a separate tab to approve this pharmacy!
                </p>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-unavailable/10 border border-unavailable/30 rounded-card text-xs text-unavailable flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">
                  Registered Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="input-base w-full font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">
                  6-Digit Password / PIN *
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit security PIN"
                  className="input-base w-full font-mono text-sm tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="btn-base btn-forest w-full text-sm font-semibold py-3 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Terminal</span>
              </button>
            </form>

            <div className="pt-2 border-t border-stone text-center">
              <span className="text-xs text-ink-muted">
                New retail chemist?{" "}
                <button
                  onClick={() => setGateTab("register")}
                  className="text-forest font-semibold underline"
                >
                  Register your pharmacy here
                </button>
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW PHARMACY */}
        {gateTab === "register" && (
          <div className="card-base p-6 bg-surface border border-stone space-y-5">
            {regSuccessMessage ? (
              <div className="space-y-4 text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-available mx-auto" />
                <h3 className="font-serif font-bold text-xl text-ink">Registration Submitted!</h3>
                <p className="text-xs text-ink-muted leading-relaxed max-w-md mx-auto">
                  {regSuccessMessage}
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      setGateTab("login");
                      setRegSuccessMessage(null);
                    }}
                    className="btn-base btn-forest text-xs px-6 py-2"
                  >
                    Go to Login & Check Status →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-ink">Retail Pharmacy Enrollment</h3>
                  <p className="text-xs text-ink-muted">
                    Submit your pharmacy details for administrative verification (State Form 20/21).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1">
                      Pharmacy / Shop Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regShopName}
                      onChange={(e) => setRegShopName(e.target.value)}
                      placeholder="e.g. Anand Medicos"
                      className="input-base w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1">
                      Pharmacist / Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regOwnerName}
                      onChange={(e) => setRegOwnerName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="input-base w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1">
                      Mobile Number (For Inquiries) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit number"
                      className="input-base w-full font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1">
                      Drug Licence Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={regLicence}
                      onChange={(e) => setRegLicence(e.target.value)}
                      placeholder="e.g. DL-UP-2026-99210"
                      className="input-base w-full font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    Create 6-Digit Password / PIN *
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Create 6-digit login PIN (e.g. 123456)"
                    className="input-base w-full font-mono text-xs"
                  />
                  <span className="text-[11px] text-ink-muted">
                    This will be required to log in to your counter terminal once approved.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    Shop Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Shop number, market, road..."
                    className="input-base w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1">Town / City *</label>
                    <input
                      type="text"
                      required
                      value={regTown}
                      onChange={(e) => setRegTown(e.target.value)}
                      className="input-base w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1">Operating Hours</label>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="reg24Hours"
                        checked={regIs24Hours}
                        onChange={(e) => setRegIs24Hours(e.target.checked)}
                        className="w-4 h-4 accent-forest"
                      />
                      <label htmlFor="reg24Hours" className="text-xs text-ink">
                        Open 24 Hours
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-paper border border-stone rounded-btn text-xs text-ink-muted flex items-center gap-2">
                  <FileText className="w-4 h-4 text-forest shrink-0" />
                  <span>
                    Registration requests are reviewed by the Lead Verifier under Drugs & Cosmetics Act rules.
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn-base btn-forest w-full text-sm font-semibold py-3"
                >
                  Submit Registration for Admin Approval
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  // PENDING VERIFICATION SCREEN: If user is logged in but shop is pending
  if (activeChemist.status === "pending") {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 card-base bg-surface text-center space-y-4 border-2 border-stone">
        <Clock className="w-12 h-12 text-pending mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-ink">Verification in Progress</h1>
        <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
          Your shop <strong>{activeChemist.shopName}</strong> (Licence: {activeChemist.drugLicenceNumber}) has been submitted for administrative review.
        </p>
        <div className="p-3 bg-paper rounded-btn text-xs text-ink-muted">
          Our team verifies retail drug licence credentials within 24 hours. You cannot receive live inquiries until verified.
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <button onClick={logout} className="btn-base btn-outline text-xs">
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE VERIFIED TERMINAL SCREEN
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Chemist Header Bar */}
      <div className="card-base p-5 bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-stone">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl font-bold text-ink">{activeChemist.shopName}</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-available/10 text-available flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Chemist</span>
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            {activeChemist.address}, {activeChemist.town} • Licence:{" "}
            <span className="font-mono">{activeChemist.drugLicenceNumber}</span> • Owner: {activeChemist.ownerName}
          </p>
        </div>

        {/* Status Toggle & Logout */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={toggleChemistOpen}
            className={`btn-base px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all ${
              activeChemist.openNow
                ? "bg-available text-white"
                : "bg-unavailable text-white"
            }`}
            title="Toggle whether shop is currently receiving requests"
          >
            <Power className="w-4 h-4" />
            <span>{activeChemist.openNow ? t("common.openNow") : t("common.closed")}</span>
          </button>

          <button
            onClick={logout}
            className="btn-base btn-outline text-xs px-3 py-2 flex items-center gap-1 text-ink-muted hover:text-unavailable"
            title="Log Out of this shop terminal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Notifications banner if permission not granted */}
      {notificationPermission !== "granted" && (
        <div className="p-3.5 bg-paper border border-stone rounded-card text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-ink">
            <Bell className="w-4 h-4 text-forest shrink-0" />
            <span>Enable Web Audio & Notifications to receive sound alerts even when this tab is in background.</span>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="btn-base btn-forest text-xs px-3 h-8 shrink-0"
          >
            Enable Audio
          </button>
        </div>
      )}

      {/* Penalty Toast Notification if 10-minute timer expires */}
      {penaltyToast && (
        <div className="p-4 bg-unavailable text-white rounded-card shadow-dropdown flex items-center justify-between gap-4 animate-slideUp">
          <div className="text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span>
              <strong>10-Min Timer Expired:</strong> &quot;{penaltyToast.query}&quot; — {penaltyToast.penalty}
            </span>
          </div>
          <button
            onClick={() => setPenaltyToast(null)}
            className="text-xs text-white/80 hover:text-white underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Undo Toast Notification */}
      {undoToast && (
        <div className="p-4 bg-ink text-white rounded-card shadow-dropdown flex items-center justify-between gap-4 animate-slideUp">
          <div className="text-xs">
            <span>
              Reply submitted ({lastAnswer === "yes" ? "Available" : "Not Available"}). Tap Undo if accidental.
            </span>
          </div>
          <button
            onClick={handleUndo}
            className="btn-base bg-white text-ink text-xs px-3 py-1.5 h-8 flex items-center gap-1 font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo ({undoToast.seconds}s)</span>
          </button>
        </div>
      )}

      {/* Core Screen: Incoming Inquiries */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-ink">
              {t("chemist.incomingTitle")}
            </h2>
            <span className="w-5 h-5 rounded-full bg-forest text-white text-[11px] font-mono font-bold flex items-center justify-center">
              {incomingRequests.length}
            </span>
          </div>

          <button
            onClick={sendTestInquiry}
            className="btn-base btn-outline text-xs px-3 py-1.5 flex items-center gap-1 font-semibold text-forest"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate 10-Min Patient Inquiry</span>
          </button>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="card-base p-10 bg-surface text-center space-y-3 border border-stone">
            <Clock className="w-8 h-8 text-ink-muted mx-auto" />
            <h3 className="font-serif font-bold text-base text-ink">No pending inquiries</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              You are all caught up. When a patient searches for medicine in your area, an alert will ring here with a 10-minute response timer.
            </p>
            <button
              onClick={sendTestInquiry}
              className="btn-base btn-forest text-xs px-4 py-2 mt-2"
            >
              Test Alert Chime
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((req) => {
              const remainingSec = Math.max(0, Math.floor((new Date(req.expiresAt).getTime() - currentTimeMs) / 1000));
              const mins = Math.floor(remainingSec / 60);
              const secs = remainingSec % 60;
              const timerStr = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
              const isUrgent = remainingSec < 120;
              const isWarning = remainingSec < 300;

              return (
                <div
                  key={req.id}
                  className="card-base p-6 bg-surface border-2 border-stone space-y-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-forest flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-available animate-ping"></span>
                        {t("chemist.liveAlert")}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-ink">
                        {req.medicineQuery}
                      </h3>
                      {req.matchedMedicine && (
                        <p className="text-xs text-ink-muted">
                          Salt: <span className="font-medium text-ink">{req.matchedMedicine.saltComposition}</span> • Form:{" "}
                          <span className="font-mono">{req.matchedMedicine.form}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono px-2 py-1 bg-paper border border-stone rounded text-ink font-semibold">
                        ~0.8 km away
                      </span>
                    </div>
                  </div>

                  {/* 10-Minute Response Window Timer */}
                  <div
                    className={`p-2.5 rounded-btn border text-xs font-mono font-bold flex items-center justify-between ${
                      isUrgent
                        ? "bg-unavailable/10 border-unavailable text-unavailable animate-pulse"
                        : isWarning
                        ? "bg-pending/10 border-pending text-pending"
                        : "bg-paper border-stone text-forest"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-sans font-semibold text-ink">
                      <Clock className="w-4 h-4 text-forest" />
                      <span>10-Minute Response Window:</span>
                    </span>
                    <span>⏳ {timerStr} remaining</span>
                  </div>

                  {req.matchedMedicine?.prescriptionRequired && (
                    <div className="p-2.5 bg-paper rounded-btn border border-stone text-xs text-ink font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-forest shrink-0" />
                      <span>{t("chemist.prescriptionRequiredBadge")}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-ink-muted italic">
                    * Respond Yes or No. If no reply is submitted within 10 minutes, this inquiry will be removed and your shop reliability score will be penalized.
                  </p>

                  {/* The Two Huge Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => handleReply(req.id, "yes")}
                      className="btn-base btn-yes text-base md:text-lg font-bold py-4 min-h-[56px] shadow-sm flex items-center justify-center gap-2"
                      aria-label="Confirm medicine is available"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span>{t("chemist.btnYes")}</span>
                    </button>

                    <button
                      onClick={() => handleReply(req.id, "no")}
                      className="btn-base btn-no text-base md:text-lg font-bold py-4 min-h-[56px] shadow-sm flex items-center justify-center gap-2"
                      aria-label="Mark medicine out of stock"
                    >
                      <XCircle className="w-6 h-6" />
                      <span>{t("chemist.btnNo")}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Chemist Reliability Metrics */}
      <section className="card-base p-5 bg-surface border border-stone">
        <h3 className="font-serif font-bold text-sm text-ink mb-3">
          {t("chemist.stats")}
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-paper rounded-btn border border-stone">
            <span className="text-[11px] text-ink-muted block">{t("chemist.replyRate")}</span>
            <span className="font-mono text-lg font-bold text-forest">
              {activeChemist.metrics.replyRate}%
            </span>
          </div>
          <div className="p-3 bg-paper rounded-btn border border-stone">
            <span className="text-[11px] text-ink-muted block">{t("chemist.avgTime")}</span>
            <span className="font-mono text-lg font-bold text-ink">
              {activeChemist.metrics.avgReplyTimeSeconds}s
            </span>
          </div>
          <div className="p-3 bg-paper rounded-btn border border-stone">
            <span className="text-[11px] text-ink-muted block">Patient Obtained</span>
            <span className="font-mono text-lg font-bold text-forest">
              {activeChemist.metrics.confirmedObtainedRate}%
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
