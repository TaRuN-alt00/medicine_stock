"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole, Chemist } from "./types";
import { DEMO_CHEMISTS } from "./seed-data";
import { db } from "./db";

export interface AdminCredentials {
  email: string;
  password: string;
  twoFactorCode: string;
}

export interface ChemistCredentials {
  phone: string;
  pin: string;
}

export interface ChemistLoginResult {
  success: boolean;
  status?: "pending" | "verified" | "rejected" | "suspended" | "not_found";
  message?: string;
  chemist?: Chemist;
}

interface AuthContextType {
  user: UserProfile | null;
  activeChemist: Chemist | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  adminCredentials: AdminCredentials;
  chemistCredentials: ChemistCredentials;
  updateAdminCredentials: (creds: AdminCredentials) => void;
  updateChemistCredentials: (creds: ChemistCredentials) => void;
  loginAsCustomer: (phone?: string) => void;
  loginAsChemist: (chemistId: string) => void;
  loginChemistWithCredentials: (phone: string, pin: string) => ChemistLoginResult;
  loginAsAdmin: () => void;
  logout: () => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; demoCode: string }>;
  verifyOtp: (phone: string, code: string, role: "customer" | "chemist") => Promise<boolean>;
  verifyAdmin: (email: string, password: string, code: string) => Promise<boolean>;
  toggleChemistOpen: () => void;
  updateChemist: (updated: Partial<Chemist>) => void;
  deleteAccount: () => Promise<void>;
}

const defaultAdminCreds: AdminCredentials = {
  email: "Tarunngiga",
  password: "12345678900987654321",
  twoFactorCode: "081207",
};

const defaultChemCreds: ChemistCredentials = {
  phone: "9810123456",
  pin: "123456",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeChemist: null,
  isAuthenticated: false,
  role: null,
  adminCredentials: defaultAdminCreds,
  chemistCredentials: defaultChemCreds,
  updateAdminCredentials: () => {},
  updateChemistCredentials: () => {},
  loginAsCustomer: () => {},
  loginAsChemist: () => {},
  loginChemistWithCredentials: () => ({ success: false, message: "Not initialized" }),
  loginAsAdmin: () => {},
  logout: () => {},
  sendOtp: async () => ({ success: true, demoCode: "123456" }),
  verifyOtp: async () => true,
  verifyAdmin: async () => true,
  toggleChemistOpen: () => {},
  updateChemist: () => {},
  deleteAccount: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [chemists, setChemists] = useState<Chemist[]>([]);
  const [activeChemistId, setActiveChemistId] = useState<string>("");
  const [adminCredentials, setAdminCredentialsState] = useState<AdminCredentials>(defaultAdminCreds);
  const [chemistCredentials, setChemistCredentialsState] = useState<ChemistCredentials>(defaultChemCreds);

  // Sync chemists from DB
  useEffect(() => {
    const syncChemists = () => {
      setChemists(db.getChemists());
    };
    syncChemists();
    const unsub = db.subscribe(syncChemists);
    return () => unsub();
  }, []);

  useEffect(() => {
    // Restore session from localStorage if present
    const savedUser = localStorage.getItem("msf_user");
    const savedChemistId = localStorage.getItem("msf_active_chemist_id");
    const savedAdminCreds = localStorage.getItem("msf_admin_creds");
    const savedChemCreds = localStorage.getItem("msf_chem_creds");

    if (savedAdminCreds) {
      try {
        const parsed = JSON.parse(savedAdminCreds);
        if (parsed.email === "admin@medicinestock.in" || !parsed.email) {
          setAdminCredentialsState(defaultAdminCreds);
          localStorage.setItem("msf_admin_creds", JSON.stringify(defaultAdminCreds));
        } else {
          setAdminCredentialsState(parsed);
        }
      } catch {
        setAdminCredentialsState(defaultAdminCreds);
      }
    } else {
      setAdminCredentialsState(defaultAdminCreds);
      localStorage.setItem("msf_admin_creds", JSON.stringify(defaultAdminCreds));
    }

    if (savedChemCreds) {
      try {
        setChemistCredentialsState(JSON.parse(savedChemCreds));
      } catch {}
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }

    if (savedChemistId) {
      setActiveChemistId(savedChemistId);
    }
  }, []);

  const saveUserSession = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("msf_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("msf_user");
    }
  };

  // Only return active chemist if currently logged in with chemist role
  const activeChemist: Chemist | null =
    user?.role === "chemist"
      ? chemists.find((c) => c.userId === user.uid || c.id === activeChemistId) || null
      : null;

  const loginAsCustomer = (phone: string = "9876543210") => {
    const customerUser: UserProfile = {
      uid: "cust_" + phone,
      role: "customer",
      phone,
      name: "Ramesh Verma",
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };
    saveUserSession(customerUser);
  };

  const loginAsChemist = (chemistId: string) => {
    const chemist = db.getChemistById(chemistId);
    if (!chemist) return;

    setActiveChemistId(chemist.id);
    localStorage.setItem("msf_active_chemist_id", chemist.id);

    const chemistUser: UserProfile = {
      uid: chemist.userId,
      role: "chemist",
      phone: chemist.phone,
      name: chemist.ownerName,
      preferredLanguage: "en",
      createdAt: chemist.createdAt,
    };
    saveUserSession(chemistUser);
  };

  const loginChemistWithCredentials = (phone: string, pin: string): ChemistLoginResult => {
    const cleanPhone = phone.replace(/\D/g, "");
    const allChemists = db.getChemists();
    const chem = allChemists.find((c) => c.phone.replace(/\D/g, "") === cleanPhone);

    if (!chem) {
      return {
        success: false,
        status: "not_found",
        message: "No pharmacy found with this mobile number. Please register your shop first.",
      };
    }

    const expectedPin = chem.pin || "123456";
    if (pin.trim() !== expectedPin) {
      return {
        success: false,
        message: "Incorrect PIN/Password. Please enter the valid 6-digit PIN used during registration.",
      };
    }

    if (chem.status === "pending") {
      return {
        success: false,
        status: "pending",
        chemist: chem,
        message: `Verification Pending: "${chem.shopName}" is awaiting administrative approval in the Drug Controller queue. You will be able to access the counter terminal once verified.`,
      };
    }

    if (chem.status === "rejected") {
      return {
        success: false,
        status: "rejected",
        chemist: chem,
        message: `Registration Rejected: ${chem.rejectionReason || "Drug licence verification failed"}. Contact Admin for review.`,
      };
    }

    // Success - Verified Chemist!
    setActiveChemistId(chem.id);
    localStorage.setItem("msf_active_chemist_id", chem.id);
    const chemistUser: UserProfile = {
      uid: chem.userId,
      role: "chemist",
      phone: chem.phone,
      name: chem.ownerName,
      preferredLanguage: "en",
      createdAt: chem.createdAt,
    };
    saveUserSession(chemistUser);
    return {
      success: true,
      status: "verified",
      chemist: chem,
    };
  };

  const loginAsAdmin = () => {
    const adminUser: UserProfile = {
      uid: "admin_super",
      role: "admin",
      email: adminCredentials.email,
      name: "Lead System Admin",
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };
    saveUserSession(adminUser);
  };

  const logout = () => {
    saveUserSession(null);
    localStorage.removeItem("msf_active_chemist_id");
    setActiveChemistId("");
  };

  const updateAdminCredentials = (creds: AdminCredentials) => {
    setAdminCredentialsState(creds);
    localStorage.setItem("msf_admin_creds", JSON.stringify(creds));
  };

  const updateChemistCredentials = (creds: ChemistCredentials) => {
    setChemistCredentialsState(creds);
    localStorage.setItem("msf_chem_creds", JSON.stringify(creds));
  };

  const sendOtp = async (phone: string) => {
    return { success: true, demoCode: chemistCredentials.pin || "123456" };
  };

  const verifyOtp = async (phone: string, code: string, targetRole: "customer" | "chemist") => {
    const validCode = code === "123456" || code === chemistCredentials.pin || code.length === 6;
    if (validCode) {
      if (targetRole === "chemist") {
        const found = db.getChemistByPhone(phone);
        if (found) {
          loginAsChemist(found.id);
        }
      } else {
        loginAsCustomer(phone);
      }
      return true;
    }
    return false;
  };

  const verifyAdmin = async (email: string, password: string, code: string) => {
    const cleanInput = email.trim().toLowerCase();
    const cleanSaved = adminCredentials.email.trim().toLowerCase();

    const matchesCustom =
      (cleanInput === cleanSaved ||
       cleanInput === "tarunngiga" ||
       cleanInput === "tarunngiga@medicinestock.in") &&
      (password === adminCredentials.password || password === "12345678900987654321") &&
      (code.trim() === adminCredentials.twoFactorCode.trim() || code.trim() === "081207");

    const matchesFallback =
      (cleanInput === "admin@medicinestock.in" || cleanInput === "admin") &&
      password === "Admin@Secure2026" &&
      (code === "123456" || code === "081207");

    if (matchesCustom || matchesFallback) {
      loginAsAdmin();
      return true;
    }
    return false;
  };

  const toggleChemistOpen = () => {
    if (!activeChemist) return;
    db.toggleChemistOpen(activeChemist.id);
  };

  const updateChemist = (updatedFields: Partial<Chemist>) => {
    if (!activeChemist) return;
    const existing = db.getChemistById(activeChemist.id);
    if (existing) {
      const merged = { ...existing, ...updatedFields };
      db.addChemist(merged);
    }
  };

  const deleteAccount = async () => {
    logout();
    localStorage.removeItem("msf_user");
    localStorage.removeItem("msf_active_chemist_id");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeChemist,
        isAuthenticated: !!user,
        role: user?.role || null,
        adminCredentials,
        chemistCredentials,
        updateAdminCredentials,
        updateChemistCredentials,
        loginAsCustomer,
        loginAsChemist,
        loginChemistWithCredentials,
        loginAsAdmin,
        logout,
        sendOtp,
        verifyOtp,
        verifyAdmin,
        toggleChemistOpen,
        updateChemist,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
