"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { db } from "@/lib/db";
import { Medicine, MedicineRequest, RequestResponse } from "@/lib/types";
import { MapComponent } from "@/components/MapComponent";
import { playCustomerConfirmedSound } from "@/lib/sound";
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Navigation,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  Radio,
  Share2,
} from "lucide-react";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "Dolo 650";

  const { user } = useAuth();
  const { t } = useI18n();

  const [medicineQuery, setMedicineQuery] = useState(initialQuery);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [activeRequest, setActiveRequest] = useState<MedicineRequest | null>(null);
  const [responses, setResponses] = useState<RequestResponse[]>([]);
  const [countdownSeconds, setCountdownSeconds] = useState(180); // 3 minutes initial
  const [autoWidened, setAutoWidened] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // Auto-match medicine on query
  useEffect(() => {
    const matched = db.searchMedicines(medicineQuery);
    if (matched.length > 0) {
      setSelectedMedicine(matched[0]);
    }
  }, [medicineQuery]);

  // Initiate request if not already created
  useEffect(() => {
    const newReq = db.createRequest({
      customerId: user?.uid || "guest_patient",
      customerPhone: user?.phone,
      medicineQuery,
      matchedMedicine: selectedMedicine || undefined,
      coarseLat: 28.9845,
      coarseLng: 77.7064,
      geohash: "ttp4ec",
      localityName: "Civil Lines & Clock Tower Chowk",
      radiusKm: 3,
    });
    setActiveRequest(newReq);
  }, []);

  // Poll / subscribe to responses
  useEffect(() => {
    if (!activeRequest) return;

    const checkResponses = () => {
      const liveResponses = db.getResponsesForRequest(activeRequest.id);
      if (liveResponses.some((r) => r.answer === "yes")) {
        playCustomerConfirmedSound();
      }
      setResponses(liveResponses);
    };

    checkResponses();
    const unsub = db.subscribe(checkResponses);
    return () => unsub();
  }, [activeRequest]);

  // Countdown timer & 3-minute auto-widening
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          if (!autoWidened && activeRequest) {
            db.widenRequestRadius(activeRequest.id, 5);
            setAutoWidened(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoWidened, activeRequest]);

  const confirmedResponses = responses.filter((r) => r.answer === "yes");
  const unavailableResponses = responses.filter((r) => r.answer === "no");

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOutcomeFeedback = (outcome: "yes" | "no" | "not_yet") => {
    if (!activeRequest) return;
    db.setPatientOutcome(activeRequest.id, outcome);
    setFeedbackGiven(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Search Header Status Card */}
      <div className="card-base p-6 bg-surface border-2 border-stone space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-forest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-available animate-ping"></span>
              Live Availability Search
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink mt-0.5">
              {medicineQuery}
            </h1>
            {selectedMedicine && (
              <p className="text-xs text-ink-muted mt-1">
                Composition: <strong className="text-ink">{selectedMedicine.saltComposition}</strong> • Form:{" "}
                <span className="font-mono">{selectedMedicine.form}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="px-3 py-1.5 bg-paper rounded-btn border border-stone text-xs font-mono font-bold text-ink flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-forest" />
              <span>{formatTimer(countdownSeconds)} left</span>
            </div>
          </div>
        </div>

        {/* Location & Radius info */}
        <div className="pt-2 border-t border-stone flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-forest" />
            <span>Searching near Civil Lines (~{activeRequest?.radiusKm || 3} km radius)</span>
          </div>
          {autoWidened && (
            <span className="text-clay font-medium">
              Widened to 5 km automatically (Night / Emergency logic)
            </span>
          )}
        </div>

        {/* Prescription notice if applicable */}
        {selectedMedicine?.prescriptionRequired && (
          <div className="p-3 bg-paper border border-stone rounded-btn text-xs text-ink flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-unavailable shrink-0" />
            <span>Prescription required at the chemist counter before physical collection.</span>
          </div>
        )}
      </div>

      {/* Live Leaflet Radar Map */}
      <MapComponent
        userLat={28.9845}
        userLng={77.7064}
        confirmedShops={confirmedResponses}
      />

      {/* Confirmed Answers Section (Realtime Live Stream) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
            <span>Confirmed Available ({confirmedResponses.length})</span>
          </h2>
          <span className="text-xs text-ink-muted">Sorted by confirmed first</span>
        </div>

        {confirmedResponses.length === 0 ? (
          <div className="card-base p-8 bg-surface text-center space-y-3 border border-stone">
            <Radio className="w-8 h-8 text-forest mx-auto animate-pulse" />
            <h3 className="font-serif font-bold text-base text-ink">
              Waiting for nearby open chemists to answer...
            </h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
              We have pinged verified shops in your radius. Chemist replies will appear here immediately as they tap.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  if (activeRequest) {
                    db.respondToRequest({
                      requestId: activeRequest.id,
                      chemistId: "chem_1",
                      answer: "yes",
                    });
                  }
                }}
                className="btn-base btn-forest text-xs px-4"
              >
                ⚡ Test: Simulate Chemist taps &quot;Yes&quot;
              </button>
              <Link
                href="/chemist"
                className="btn-base btn-outline text-xs px-4"
              >
                Or Open Chemist Portal in New Tab →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {confirmedResponses.map((resp) => (
              <div
                key={resp.id}
                className="card-base p-5 bg-surface border-2 border-available space-y-4 shadow-soft animate-fadeIn"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-ink">
                        {resp.chemistShopName}
                      </h3>
                      <span className="px-2 py-0.5 bg-available/10 text-available text-[11px] font-bold rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed Available</span>
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Distance: <strong className="font-mono text-ink">~{resp.chemistDistanceKm} km</strong> • Verified retail chemist
                    </p>
                  </div>

                  {/* Actions: Call & Directions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${resp.chemistPhone}`}
                      className="btn-base btn-forest text-xs px-4 py-2 flex items-center gap-1.5 font-bold"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{t("common.call")}</span>
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        resp.chemistShopName + " Meerut"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-base btn-outline text-xs px-3 py-2 flex items-center gap-1.5 font-bold"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t("common.directions")}</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone flex items-center justify-between text-[11px] text-ink-muted">
                  <span>Stock answer valid for next 30 minutes</span>
                  <span className="font-mono">
                    Replied at {new Date(resp.respondedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Collapsed "Not available at" Section */}
      {unavailableResponses.length > 0 && (
        <details className="card-base p-4 bg-paper border border-stone text-xs text-ink-muted">
          <summary className="font-semibold cursor-pointer text-ink flex items-center justify-between">
            <span>Not available at ({unavailableResponses.length} shops)</span>
            <span className="text-[11px] underline">View details</span>
          </summary>
          <div className="pt-3 divide-y divide-stone">
            {unavailableResponses.map((r) => (
              <div key={r.id} className="py-2 flex items-center justify-between">
                <span>{r.chemistShopName}</span>
                <span className="text-unavailable font-semibold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Out of stock
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* "Close the Loop" Feedback Modal Card */}
      {confirmedResponses.length > 0 && !feedbackGiven && (
        <div className="card-base p-5 bg-paper border-2 border-stone space-y-3">
          <h4 className="font-serif font-bold text-sm text-ink">
            Did you get the medicine?
          </h4>
          <p className="text-xs text-ink-muted">
            Your single tap helps keep chemist reliability scores accurate for your neighbourhood.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleOutcomeFeedback("yes")}
              className="btn-base btn-forest text-xs px-4"
            >
              Yes, Got it
            </button>
            <button
              onClick={() => handleOutcomeFeedback("no")}
              className="btn-base btn-outline text-xs px-4 text-unavailable"
            >
              No, Shop was out of stock
            </button>
            <button
              onClick={() => handleOutcomeFeedback("not_yet")}
              className="btn-base btn-outline text-xs px-4"
            >
              Not yet visited
            </button>
          </div>
        </div>
      )}

      {feedbackGiven && (
        <div className="p-3 bg-surface border border-stone rounded-card text-xs text-forest text-center font-semibold">
          ✓ Thank you for your feedback! It helps keep local chemist scores honest.
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading search session...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
