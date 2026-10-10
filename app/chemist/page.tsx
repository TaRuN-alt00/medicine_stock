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
  HelpCircle,
} from "lucide-react";

export default function ChemistPortalPage() {
  const { user, role, activeChemist, toggleChemistOpen, loginAsChemist } = useAuth();
  const { t } = useI18n();

  const [incomingRequests, setIncomingRequests] = useState<MedicineRequest[]>([]);
  const [undoToast, setUndoToast] = useState<{ id: string; seconds: number; requestId: string } | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

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

  // Keep incoming requests in sync with DB
  useEffect(() => {
    if (!activeChemist) return;

    const updateRequests = () => {
      // Find incoming requests routed to this chemist
      let reqs = db.getIncomingRequestsForChemist(activeChemist.id);

      // If no live requests in memory yet, create a realistic seeded inquiry for demonstration
      if (reqs.length === 0) {
        reqs = [
          {
            id: "req_demo_1",
            customerId: "cust_demo",
            medicineQuery: "Dolo 650",
            matchedMedicine: {
              id: "med_1",
              brandName: "Dolo 650",
              saltComposition: "Paracetamol 650mg",
              strength: "650mg",
              form: "tablet",
              schedule: "OTC",
              prescriptionRequired: false,
              synonyms: ["dolo", "paracetamol"],
              searchTokens: ["dolo", "650"],
            },
            coarseLat: 28.986,
            coarseLng: 77.708,
            geohash: "ttp4ec",
            localityName: "Near Clock Tower Chowk",
            radiusKm: 3,
            status: "open",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
            patientOutcome: "unrecorded",
            notifiedChemistIds: [activeChemist.id],
          },
        ];
      }
      if (reqs.length > 0) {
        playChemistAlertSound();
      }
      setIncomingRequests(reqs);
    };

    updateRequests();
    const unsubscribe = db.subscribe(updateRequests);
    return () => unsubscribe();
  }, [activeChemist]);

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

    // Remove from local list optimistically
    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleUndo = () => {
    if (!undoToast || !activeChemist) return;
    db.undoResponse(undoToast.requestId, activeChemist.id);
    setUndoToast(null);
    setLastAnswer(null);
  };

  if (!activeChemist || role !== "chemist") {
    return (
      <div className="max-w-md mx-auto my-12 p-6 card-base bg-surface text-center space-y-4">
        <Store className="w-10 h-10 text-forest mx-auto" />
        <h1 className="font-serif text-xl font-bold text-ink">Chemist Portal Access</h1>
        <p className="text-xs text-ink-muted">
          Please log in as a registered chemist or use the quick demo button below.
        </p>
        <button
          onClick={() => loginAsChemist("chem_1")}
          className="btn-base btn-forest w-full text-sm font-semibold"
        >
          Login as Demo Chemist (Sharma Medicos)
        </button>
      </div>
    );
  }

  // Pending verification view
  if (activeChemist.status === "pending") {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 card-base bg-surface text-center space-y-4 border-2 border-stone">
        <Clock className="w-12 h-12 text-pending mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-ink">Verification in Progress</h1>
        <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
          Your shop <strong>{activeChemist.shopName}</strong> (Licence: {activeChemist.drugLicenceNumber}) has been submitted for administrative review.
        </p>
        <div className="p-3 bg-paper rounded-btn text-xs text-ink-muted">
          Our team inspects retail drug licence credentials within 24 hours. You cannot receive live inquiries until verified.
        </div>
        <div className="pt-2">
          <button
            onClick={() => loginAsChemist("chem_1")}
            className="btn-base btn-outline text-xs"
          >
            Switch to Verified Chemist Demo
          </button>
        </div>
      </div>
    );
  }

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
            <span className="font-mono">{activeChemist.drugLicenceNumber}</span>
          </p>
        </div>

        {/* Open / Closed Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
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
        </div>
      </div>

      {/* Notifications banner if permission not granted */}
      {notificationPermission !== "granted" && (
        <div className="p-3.5 bg-paper border border-stone rounded-card text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-ink">
            <Bell className="w-4 h-4 text-forest shrink-0" />
            <span>Enable Web Push to receive audible alerts even when this browser tab is in the background.</span>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="btn-base btn-forest text-xs px-3 h-8 shrink-0"
          >
            Enable Audio & Push
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

      {/* Core Screen: Incoming Requests (The Heart of Chemist Product) */}
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
          <span className="text-xs text-ink-muted">
            Auto-refreshes in real-time
          </span>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="card-base p-10 bg-surface text-center space-y-2 border border-stone">
            <Clock className="w-8 h-8 text-ink-muted mx-auto" />
            <h3 className="font-serif font-bold text-base text-ink">No pending inquiries</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              You are all caught up. When a patient searches for medicine in your area, an alert will ring here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="card-base p-6 bg-surface border-2 border-stone space-y-5 shadow-soft"
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

                {req.matchedMedicine?.prescriptionRequired && (
                  <div className="p-2.5 bg-paper rounded-btn border border-stone text-xs text-ink font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-forest shrink-0" />
                    <span>{t("chemist.prescriptionRequiredBadge")}</span>
                  </div>
                )}

                {/* The Two Huge Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
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
            ))}
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
