"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import { X, Store, FileText, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ChemistRegisterModal({ isOpen, onClose }: Props) {
  const { loginAsChemist } = useAuth();

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenceNo, setLicenceNo] = useState("");
  const [address, setAddress] = useState("");
  const [town, setTown] = useState("Meerut");
  const [is24Hours, setIs24Hours] = useState(false);
  const [openHour, setOpenHour] = useState("09:00");
  const [closeHour, setCloseHour] = useState("22:00");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !ownerName || !phone || !licenceNo || !address) {
      alert("Please fill all required fields");
      return;
    }

    const newChemistId = "chem_" + Date.now();
    const newChemist = {
      id: newChemistId,
      userId: "user_" + newChemistId,
      shopName,
      ownerName,
      phone,
      drugLicenceNumber: licenceNo,
      address,
      town,
      status: "pending" as const,
      openNow: true,
      hours: {
        open: openHour,
        close: closeHour,
        is24Hours,
      },
      latitude: 28.985 + (Math.random() * 0.01 - 0.005),
      longitude: 77.708 + (Math.random() * 0.01 - 0.005),
      geohash: "ttp4ec",
      metrics: { replyRate: 0, avgReplyTimeSeconds: 0, confirmedObtainedRate: 0, consecutiveMisses: 0 },
      createdAt: new Date().toISOString(),
    };

    // Save chemist to DB
    const existing = db.getChemists();
    existing.push(newChemist);
    localStorage.setItem("msf_chemists", JSON.stringify(existing));

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40">
      <div className="card-base w-full max-w-lg p-6 bg-surface relative shadow-dropdown max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink rounded-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-forest font-serif font-bold text-xl">
              <Store className="w-6 h-6" />
              <span>Register Chemist / Pharmacy</span>
            </div>
            <p className="text-xs text-ink-muted">
              Submit your retail pharmacy details for administrative verification (State Form 20/21).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">
                  Shop / Pharmacy Name *
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
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
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Amit Kumar"
                  className="input-base w-full text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">
                  Mobile Number (For Alerts) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
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
                  value={licenceNo}
                  onChange={(e) => setLicenceNo(e.target.value)}
                  placeholder="e.g. DL-UP-2026-99210"
                  className="input-base w-full font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Shop Address *
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop number, market, road..."
                className="input-base w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Town / City</label>
                <input
                  type="text"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  className="input-base w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Operating Hours</label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is24Hours"
                    checked={is24Hours}
                    onChange={(e) => setIs24Hours(e.target.checked)}
                    className="w-4 h-4 accent-forest"
                  />
                  <label htmlFor="is24Hours" className="text-xs text-ink">
                    Open 24 Hours
                  </label>
                </div>
              </div>
            </div>

            <div className="p-3 bg-paper border border-stone rounded-btn text-xs text-ink-muted flex items-center gap-2">
              <FileText className="w-4 h-4 text-forest shrink-0" />
              <span>Licence document upload will be verified by the admin team before activation.</span>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-base btn-forest w-full text-sm">
                Submit Registration for Verification
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-available mx-auto" />
            <h3 className="font-serif font-bold text-xl text-ink">Registration Submitted!</h3>
            <p className="text-xs text-ink-muted leading-relaxed max-w-sm mx-auto">
              <strong>{shopName}</strong> has been placed in the <strong>Admin Verification Queue</strong> with status <em>Pending</em>.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/admin";
                }}
                className="btn-base btn-forest text-xs"
              >
                Go to Admin Portal to Approve Shop →
              </button>
              <button
                onClick={onClose}
                className="btn-base btn-outline text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
