"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { db } from "@/lib/db";
import { Chemist, AuditLog, Medicine } from "@/lib/types";
import {
  ShieldCheck,
  Users,
  Store,
  FileCheck,
  Check,
  X,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  Lock,
  KeyRound,
  Save,
} from "lucide-react";

export default function AdminPortalPage() {
  const {
    user,
    role,
    loginAsAdmin,
    adminCredentials,
    chemistCredentials,
    updateAdminCredentials,
    updateChemistCredentials,
  } = useAuth();
  const { t } = useI18n();

  const [chemists, setChemists] = useState<Chemist[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"queue" | "directory" | "logs" | "security">("queue");

  const [adminEmail, setAdminEmail] = useState(adminCredentials.email);
  const [adminPassword, setAdminPassword] = useState(adminCredentials.password);
  const [admin2FA, setAdmin2FA] = useState(adminCredentials.twoFactorCode);
  const [chemistPin, setChemistPin] = useState(chemistCredentials.pin);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const refreshData = () => {
    setChemists(db.getChemists());
    setAuditLogs(db.getAuditLogs());
  };

  useEffect(() => {
    refreshData();
    const unsub = db.subscribe(refreshData);
    return () => unsub();
  }, []);

  const pendingChemists = chemists.filter((c) => c.status === "pending");

  const handleApprove = (chemistId: string) => {
    db.updateChemistStatus(chemistId, "verified", user?.email || "admin@medicinestock.in");
  };

  const handleReject = (chemistId: string) => {
    const reason = prompt("Enter rejection reason (e.g. Invalid Drug Licence number):") || "Licence verification failed";
    db.updateChemistStatus(chemistId, "rejected", user?.email || "admin@medicinestock.in", reason);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminCredentials({
      email: adminEmail,
      password: adminPassword,
      twoFactorCode: admin2FA,
    });
    updateChemistCredentials({
      phone: chemistCredentials.phone,
      pin: chemistPin,
    });
    db.addAuditLog(
      adminEmail,
      `Updated Admin credentials and security settings (New 2FA: ${admin2FA})`,
      "setting",
      "credentials"
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  if (role !== "admin") {
    return (
      <div className="max-w-md mx-auto my-12 p-8 card-base bg-surface text-center space-y-4 border-2 border-stone">
        <Lock className="w-10 h-10 text-forest mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-ink">Admin Portal Gate</h1>
        <p className="text-xs text-ink-muted">
          Mandatory two-factor authentication (2FA) is enforced for all administrative and verifier roles.
        </p>
        <button
          onClick={() => loginAsAdmin()}
          className="btn-base btn-forest w-full text-sm font-semibold"
        >
          Login as Super Admin (Demo with 2FA)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone pb-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-forest flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Admin & Verifier Terminal</span>
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink mt-0.5">
            {t("admin.dashboardTitle")}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="p-2 bg-paper rounded border border-stone font-mono">
            Admin: {user?.email}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-base p-4 bg-surface border border-stone">
          <span className="text-xs text-ink-muted block">Requests Today</span>
          <span className="font-mono text-2xl font-bold text-ink">142</span>
        </div>
        <div className="card-base p-4 bg-surface border border-stone">
          <span className="text-xs text-ink-muted block">Median Reply Time</span>
          <span className="font-mono text-2xl font-bold text-forest">38 sec</span>
        </div>
        <div className="card-base p-4 bg-surface border border-stone">
          <span className="text-xs text-ink-muted block">% Found Available</span>
          <span className="font-mono text-2xl font-bold text-available">89.4%</span>
        </div>
        <div className="card-base p-4 bg-surface border border-stone">
          <span className="text-xs text-ink-muted block">Active Chemists</span>
          <span className="font-mono text-2xl font-bold text-ink">
            {chemists.filter((c) => c.status === "verified" && c.openNow).length}
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-stone gap-4">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "queue"
              ? "border-forest text-forest"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Verification Queue</span>
          {pendingChemists.length > 0 && (
            <span className="px-1.5 py-0.2 bg-unavailable text-white text-[11px] font-mono font-bold rounded-full">
              {pendingChemists.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("directory")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "directory"
              ? "border-forest text-forest"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Chemists Directory ({chemists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "logs"
              ? "border-forest text-forest"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "security"
              ? "border-forest text-forest"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Password & Security</span>
        </button>
      </div>

      {/* Tab 1: Chemist Verification Queue */}
      {activeTab === "queue" && (
        <section className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-ink">
            Drug Licence Verification Queue
          </h2>

          {pendingChemists.length === 0 ? (
            <div className="card-base p-8 text-center bg-surface border border-stone">
              <Check className="w-8 h-8 text-available mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink">Queue is clear</p>
              <p className="text-xs text-ink-muted">All registered chemists have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingChemists.map((chem) => (
                <div
                  key={chem.id}
                  className="card-base p-6 bg-surface border-2 border-stone flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-ink">{chem.shopName}</h3>
                      <span className="px-2 py-0.5 bg-pending/20 text-pending font-semibold text-[11px] rounded">
                        Pending Review
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted">
                      Owner: <strong>{chem.ownerName}</strong> • Phone: <span className="font-mono">{chem.phone}</span>
                    </p>
                    <p className="text-xs text-ink">
                      Address: {chem.address}, {chem.town}
                    </p>
                    <div className="p-2 bg-paper rounded border border-stone text-xs font-mono inline-block text-forest">
                      Licence Number: <strong>{chem.drugLicenceNumber}</strong> (Form 20/21)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleApprove(chem.id)}
                      className="btn-base btn-yes text-xs px-4 flex-1 md:flex-initial flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Chemist</span>
                    </button>
                    <button
                      onClick={() => handleReject(chem.id)}
                      className="btn-base btn-outline text-xs px-4 text-unavailable hover:bg-unavailable/10 flex-1 md:flex-initial flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Chemists Directory */}
      {activeTab === "directory" && (
        <section className="space-y-4">
          <div className="card-base bg-surface border border-stone overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper border-b border-stone text-ink-muted font-semibold">
                <tr>
                  <th className="p-3.5">Shop Name</th>
                  <th className="p-3.5">Town</th>
                  <th className="p-3.5">Licence No</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Open/Closed</th>
                  <th className="p-3.5">Reply Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone">
                {chemists.map((chem) => (
                  <tr key={chem.id} className="hover:bg-paper/50">
                    <td className="p-3.5 font-semibold text-ink">{chem.shopName}</td>
                    <td className="p-3.5 text-ink-muted">{chem.town}</td>
                    <td className="p-3.5 font-mono">{chem.drugLicenceNumber}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          chem.status === "verified"
                            ? "bg-available/10 text-available"
                            : chem.status === "pending"
                            ? "bg-pending/20 text-pending"
                            : "bg-unavailable/10 text-unavailable"
                        }`}
                      >
                        {chem.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                          chem.openNow ? "bg-available" : "bg-ink-muted"
                        }`}
                      ></span>
                      {chem.openNow ? "Open" : "Closed"}
                    </td>
                    <td className="p-3.5 font-mono">{chem.metrics.replyRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 3: Security Audit Log */}
      {activeTab === "logs" && (
        <section className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-ink">
            Append-Only Audit Log
          </h2>
          {auditLogs.length === 0 ? (
            <div className="card-base p-6 text-center text-xs text-ink-muted bg-surface border border-stone">
              No administrative events recorded yet in this session.
            </div>
          ) : (
            <div className="card-base bg-surface border border-stone divide-y divide-stone">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs gap-3">
                  <div>
                    <span className="font-semibold text-ink">{log.action}</span>
                    <span className="text-[11px] text-ink-muted block mt-0.5">
                      By {log.adminEmail} • Target: {log.targetType} ({log.targetId})
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-ink-muted shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 4: Security & Password Settings */}
      {activeTab === "security" && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-forest" />
                <span>Security & Password Settings</span>
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Manage authentication credentials, custom passwords, and Two-Factor Security Codes (2FA).
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-4 bg-available/10 border border-available text-forest rounded-card text-xs flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 text-available shrink-0" />
              <span>Settings Saved! Your new admin password, 2FA code, and chemist login PIN are now active immediately.</span>
            </div>
          )}

          <form onSubmit={handleSaveCredentials} className="space-y-6">
            {/* Section 1: Admin Credentials */}
            <div className="card-base p-6 bg-surface border-2 border-stone space-y-4">
              <h3 className="font-serif font-bold text-base text-ink flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>Admin Login Credentials (Super Admin)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="input-base w-full text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    Admin Password
                  </label>
                  <input
                    type="text"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter new admin password"
                    className="input-base w-full text-xs font-mono"
                  />
                  <span className="text-[11px] text-ink-muted mt-1 block">
                    You can set any custom password here (e.g. your own secure password).
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-forest" />
                  <span>Mandatory Two-Factor Authentication (2FA) Code</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={admin2FA}
                  onChange={(e) => setAdmin2FA(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code (e.g. 123456)"
                  className="input-base w-full sm:w-64 font-mono text-center tracking-widest text-base"
                />
                <span className="text-[11px] text-ink-muted mt-1 block">
                  This 6-digit code will be required during admin login.
                </span>
              </div>
            </div>

            {/* Section 2: Chemist Portal Access Settings */}
            <div className="card-base p-6 bg-surface border border-stone space-y-4">
              <h3 className="font-serif font-bold text-base text-ink flex items-center gap-2">
                <Store className="w-4 h-4 text-forest" />
                <span>Chemist Portal Authentication Settings</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">
                  Default Chemist Login PIN / OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={chemistPin}
                  onChange={(e) => setChemistPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code (e.g. 123456)"
                  className="input-base w-full sm:w-64 font-mono text-center tracking-widest text-base"
                />
                <span className="text-[11px] text-ink-muted mt-1 block">
                  Chemists can use this PIN or OTP code to access their counter terminal.
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-base btn-forest px-6 text-xs flex items-center gap-2 font-bold"
              >
                <Save className="w-4 h-4" />
                <span>Save New Password & Credentials</span>
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
