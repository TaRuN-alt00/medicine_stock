"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { db } from "@/lib/db";
import { Chemist, AuditLog } from "@/lib/types";
import {
  ShieldCheck,
  Store,
  FileCheck,
  Check,
  X,
  Clock,
  Plus,
  Lock,
  KeyRound,
  Save,
  Trash2,
  RotateCcw,
  AlertTriangle,
  LogOut,
  Sparkles,
  Phone,
  CheckCircle2,
} from "lucide-react";

export default function AdminPortalPage() {
  const {
    user,
    role,
    adminCredentials,
    chemistCredentials,
    updateAdminCredentials,
    updateChemistCredentials,
    verifyAdmin,
    logout,
  } = useAuth();
  const { t } = useI18n();

  // Admin login form states
  const [loginEmail, setLoginEmail] = useState(adminCredentials.email || "admin@medicinestock.in");
  const [loginPassword, setLoginPassword] = useState("");
  const [login2FA, setLogin2FA] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Portal tabs
  const [activeTab, setActiveTab] = useState<"queue" | "directory" | "logs" | "security">("queue");

  // Data states
  const [chemists, setChemists] = useState<Chemist[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Security tab states
  const [adminEmail, setAdminEmail] = useState(adminCredentials.email);
  const [adminPassword, setAdminPassword] = useState(adminCredentials.password);
  const [admin2FA, setAdmin2FA] = useState(adminCredentials.twoFactorCode);
  const [chemistPin, setChemistPin] = useState(chemistCredentials.pin);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Direct Enroll Chemist Modal state in Admin
  const [showAddChemistModal, setShowAddChemistModal] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLicence, setNewLicence] = useState("");
  const [newPin, setNewPin] = useState("123456");
  const [newAddress, setNewAddress] = useState("");
  const [newTown, setNewTown] = useState("Meerut");

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

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const ok = await verifyAdmin(loginEmail, loginPassword, login2FA);
    if (!ok) {
      setLoginError("Invalid email, password, or 2FA code. Please check your credentials.");
    }
  };

  const handleApprove = (chemistId: string) => {
    db.updateChemistStatus(chemistId, "verified", user?.email || adminCredentials.email);
  };

  const handleReject = (chemistId: string) => {
    const reason =
      prompt("Enter rejection reason (e.g. Invalid Drug Licence number):") ||
      "Licence verification failed";
    db.updateChemistStatus(chemistId, "rejected", user?.email || adminCredentials.email, reason);
  };

  const handleDeleteChemist = (chemist: Chemist) => {
    if (confirm(`Are you sure you want to permanently delete pharmacy "${chemist.shopName}"?`)) {
      db.deleteChemist(chemist.id, user?.email || adminCredentials.email);
    }
  };

  const handleClearSynthetic = () => {
    if (
      confirm(
        "Are you sure you want to remove all sample / synthetic shops? Only genuine enrolled pharmacies will remain."
      )
    ) {
      db.clearSyntheticChemists(user?.email || adminCredentials.email);
    }
  };

  const handleRestoreSample = () => {
    if (confirm("Restore the default 5 demo chemist shops for testing?")) {
      db.resetToSampleChemists(user?.email || adminCredentials.email);
    }
  };

  const handleCreateChemistDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName || !newOwnerName || !newPhone || !newLicence || !newAddress) {
      alert("Please fill all required fields");
      return;
    }

    const newChemistId = "chem_" + Date.now();
    const newChemist: Chemist = {
      id: newChemistId,
      userId: "user_" + newChemistId,
      shopName: newShopName.trim(),
      ownerName: newOwnerName.trim(),
      phone: newPhone.trim(),
      pin: newPin.trim() || "123456",
      isSynthetic: false,
      drugLicenceNumber: newLicence.trim(),
      address: newAddress.trim(),
      town: newTown.trim(),
      status: "verified", // Admin direct enroll is verified immediately
      openNow: true,
      hours: { open: "09:00", close: "22:00", is24Hours: false },
      latitude: 28.985 + (Math.random() * 0.01 - 0.005),
      longitude: 77.708 + (Math.random() * 0.01 - 0.005),
      geohash: "ttp4ec",
      metrics: { replyRate: 100, avgReplyTimeSeconds: 20, confirmedObtainedRate: 100, consecutiveMisses: 0 },
      createdAt: new Date().toISOString(),
    };

    db.addChemist(newChemist, user?.email || adminCredentials.email);
    setShowAddChemistModal(false);
    setNewShopName("");
    setNewOwnerName("");
    setNewPhone("");
    setNewLicence("");
    setNewAddress("");
    alert(`Pharmacy "${newChemist.shopName}" enrolled and verified! The chemist can now log in with Phone: ${newChemist.phone} and PIN: ${newChemist.pin}`);
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

  // ADMIN LOGIN GATE (Visible when role is not admin)
  if (role !== "admin") {
    return (
      <div className="max-w-md mx-auto my-12 p-8 card-base bg-surface space-y-6 border-2 border-stone">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-btn bg-forest text-white flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink">Super Admin Portal Gate</h1>
          <p className="text-xs text-ink-muted">
            Administrative access is restricted to verified Drug Controllers and System Administrators.
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-unavailable/10 border border-unavailable/30 rounded-card text-xs text-unavailable flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              Admin Email Address *
            </label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="admin@medicinestock.in"
              className="input-base w-full text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              Admin Password *
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter admin password"
              className="input-base w-full text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1 flex items-center justify-between">
              <span>2FA Security Code *</span>
              <span className="text-[10px] text-forest font-mono">Default: 123456</span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={login2FA}
              onChange={(e) => setLogin2FA(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit 2FA code"
              className="input-base w-full font-mono text-center tracking-widest text-sm"
            />
          </div>

          <button
            type="submit"
            className="btn-base btn-forest w-full text-sm font-semibold py-3 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticate & Access Admin</span>
          </button>
        </form>

        <div className="p-3 bg-paper border border-stone rounded-btn text-[11px] text-ink-muted space-y-1">
          <div className="font-semibold text-ink">Default Administrative Credentials:</div>
          <div>Email: <span className="font-mono text-forest">admin@medicinestock.in</span></div>
          <div>Password: <span className="font-mono text-forest">Admin@Secure2026</span></div>
          <div>2FA Code: <span className="font-mono text-forest">123456</span></div>
          <div className="pt-1 text-[10px] text-ink-muted italic">You can change these anytime in the Password & Security tab once logged in.</div>
        </div>
      </div>
    );
  }

  // ACTIVE ADMIN CONSOLE
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

        <div className="flex items-center gap-3 text-xs">
          <span className="p-2 bg-paper rounded border border-stone font-mono text-ink">
            Admin: {user?.email || adminCredentials.email}
          </span>
          <button
            onClick={logout}
            className="btn-base btn-outline text-xs px-3 py-2 flex items-center gap-1 text-ink-muted hover:text-unavailable"
            title="Log out from Admin console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-base p-4 bg-surface border border-stone">
          <span className="text-xs text-ink-muted block">Total Pharmacies</span>
          <span className="font-mono text-2xl font-bold text-ink">{chemists.length}</span>
        </div>
        <div className="card-base p-4 bg-surface border border-stone">
          <span className="text-xs text-ink-muted block">Verified & Active</span>
          <span className="font-mono text-2xl font-bold text-available">
            {chemists.filter((c) => c.status === "verified").length}
          </span>
        </div>
        <div className="card-base p-4 bg-surface border border-stone">
          <span className="text-xs text-ink-muted block">Pending Reviews</span>
          <span className="font-mono text-2xl font-bold text-pending">
            {pendingChemists.length}
          </span>
        </div>
        <div className="card-base p-4 bg-surface border border-stone">
          <span className="text-xs text-ink-muted block">Audit Logs</span>
          <span className="font-mono text-2xl font-bold text-forest">{auditLogs.length}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
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

      {/* TAB 1: CHEMIST VERIFICATION QUEUE */}
      {activeTab === "queue" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-ink">
              Retail Drug Licence Verification Queue
            </h2>
            <span className="text-xs text-ink-muted">
              {pendingChemists.length} application(s) pending review
            </span>
          </div>

          {pendingChemists.length === 0 ? (
            <div className="card-base p-8 text-center bg-surface border border-stone space-y-2">
              <Check className="w-8 h-8 text-available mx-auto" />
              <p className="text-sm font-semibold text-ink">Verification Queue is Clear</p>
              <p className="text-xs text-ink-muted">
                All registered chemists have been processed. New pharmacies registered via /chemist will appear here.
              </p>
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
                        Pending Verification
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted">
                      Pharmacist / Owner: <strong>{chem.ownerName}</strong> • Phone:{" "}
                      <span className="font-mono text-ink font-semibold">{chem.phone}</span>
                      {chem.pin && (
                        <span> • Login PIN: <strong className="font-mono text-forest">{chem.pin}</strong></span>
                      )}
                    </p>
                    <p className="text-xs text-ink">
                      Address: {chem.address}, {chem.town}
                    </p>
                    <div className="p-2 bg-paper rounded border border-stone text-xs font-mono inline-block text-forest font-semibold">
                      Drug Licence Number: {chem.drugLicenceNumber} (Form 20/21)
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
                    <button
                      onClick={() => handleDeleteChemist(chem)}
                      className="btn-base btn-outline text-xs p-2 text-ink-muted hover:text-unavailable"
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: CHEMISTS DIRECTORY & MANAGEMENT */}
      {activeTab === "directory" && (
        <section className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddChemistModal(true)}
                className="btn-base btn-forest text-xs px-3.5 py-2 flex items-center gap-1.5 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enroll Real Chemist Directly</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSynthetic}
                className="btn-base btn-outline text-xs px-3 py-2 text-unavailable border-unavailable/30 hover:bg-unavailable/10 flex items-center gap-1.5 font-semibold"
                title="Remove sample/fake demo pharmacies so only actual shops remain"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Sample / Synthetic Shops</span>
              </button>
              <button
                onClick={handleRestoreSample}
                className="btn-base btn-outline text-xs px-3 py-2 text-ink-muted hover:text-ink flex items-center gap-1.5"
                title="Restore default test pharmacies"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Sample Data</span>
              </button>
            </div>
          </div>

          {chemists.length === 0 ? (
            <div className="card-base p-10 text-center bg-surface border border-stone space-y-3">
              <Store className="w-10 h-10 text-ink-muted mx-auto" />
              <h3 className="font-serif font-bold text-base text-ink">No Chemist Shops Enrolled</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                All sample shops have been removed. You can enroll real chemists directly using the button above or have chemists register via /chemist.
              </p>
              <button
                onClick={() => setShowAddChemistModal(true)}
                className="btn-base btn-forest text-xs px-4 py-2"
              >
                + Enroll First Real Pharmacy
              </button>
            </div>
          ) : (
            <div className="card-base bg-surface border border-stone overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper border-b border-stone text-ink-muted font-semibold">
                  <tr>
                    <th className="p-3.5">Shop Name</th>
                    <th className="p-3.5">Owner / Contact</th>
                    <th className="p-3.5">Town</th>
                    <th className="p-3.5">Licence No</th>
                    <th className="p-3.5">PIN</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Open/Closed</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone">
                  {chemists.map((chem) => (
                    <tr key={chem.id} className="hover:bg-paper/50">
                      <td className="p-3.5 font-semibold text-ink">
                        <div>{chem.shopName}</div>
                        {chem.isSynthetic && (
                          <span className="text-[10px] text-ink-muted italic font-normal">
                            (Sample Demo Shop)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-ink-muted">
                        <div>{chem.ownerName}</div>
                        <div className="font-mono text-ink text-[11px]">{chem.phone}</div>
                      </td>
                      <td className="p-3.5 text-ink-muted">{chem.town}</td>
                      <td className="p-3.5 font-mono">{chem.drugLicenceNumber}</td>
                      <td className="p-3.5 font-mono text-forest font-semibold">{chem.pin || "123456"}</td>
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
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteChemist(chem)}
                          className="btn-base btn-outline text-xs px-2.5 py-1 text-unavailable hover:bg-unavailable/10 flex items-center gap-1 ml-auto"
                          title="Delete this shop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: SECURITY AUDIT LOG */}
      {activeTab === "logs" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-ink">
              Append-Only Security Audit Log
            </h2>
            <span className="text-xs text-ink-muted">{auditLogs.length} events logged</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="card-base p-6 text-center text-xs text-ink-muted bg-surface border border-stone">
              No administrative events recorded yet in this session.
            </div>
          ) : (
            <div className="card-base bg-surface border border-stone divide-y divide-stone max-h-[500px] overflow-y-auto">
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

      {/* TAB 4: SECURITY & PASSWORD SETTINGS */}
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
            {/* Admin Credentials */}
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

            {/* Chemist Default Settings */}
            <div className="card-base p-6 bg-surface border border-stone space-y-4">
              <h3 className="font-serif font-bold text-base text-ink flex items-center gap-2">
                <Store className="w-4 h-4 text-forest" />
                <span>Chemist Default PIN Setting</span>
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
                  Chemists can use their customized PIN or this default PIN to log into their terminal.
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

      {/* MODAL: DIRECT ENROLL CHEMIST */}
      {showAddChemistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40">
          <div className="card-base w-full max-w-lg p-6 bg-surface relative shadow-dropdown max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddChemistModal(false)}
              className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink rounded-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCreateChemistDirectly} className="space-y-4">
              <div className="flex items-center gap-2 text-forest font-serif font-bold text-xl">
                <Store className="w-6 h-6" />
                <span>Enroll Real Chemist Shop</span>
              </div>
              <p className="text-xs text-ink-muted">
                Directly register and verify an actual retail pharmacy on the network.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    Shop / Pharmacy Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
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
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="input-base w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile"
                    className="input-base w-full font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    Drug Licence No (Form 20/21) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLicence}
                    onChange={(e) => setNewLicence(e.target.value)}
                    placeholder="e.g. DL-UP-2026-99210"
                    className="input-base w-full font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">
                  Chemist Login PIN *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit PIN (e.g. 123456)"
                  className="input-base w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">
                  Shop Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Market road, shop number..."
                  className="input-base w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Town / City</label>
                <input
                  type="text"
                  value={newTown}
                  onChange={(e) => setNewTown(e.target.value)}
                  className="input-base w-full text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="submit" className="btn-base btn-forest flex-1 text-xs py-2 font-bold">
                  Enroll & Verify Pharmacy Immediately
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddChemistModal(false)}
                  className="btn-base btn-outline text-xs px-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
