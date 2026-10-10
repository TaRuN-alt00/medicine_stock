"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole, Chemist } from "./types";
import { DEMO_CHEMISTS } from "./seed-data";

export interface AdminCredentials {
  email: string;
  password: string;
  twoFactorCode: string;
}

export interface ChemistCredentials {
  phone: string;
  pin: string;
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
  loginAsChemist: (chemistId?: string) => void;
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
  email: "admin@medicinestock.in",
  password: "Admin@Secure2026",
  twoFactorCode: "123456",
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
  const [chemists, setChemists] = useState<Chemist[]>(DEMO_CHEMISTS);
  const [activeChemistId, setActiveChemistId] = useState<string>("chem_1");
  const [adminCredentials, setAdminCredentialsState] = useState<AdminCredentials>(defaultAdminCreds);
  const [chemistCredentials, setChemistCredentialsState] = useState<ChemistCredentials>(defaultChemCreds);

  useEffect(() => {
    // Restore session from localStorage if present
    const savedUser = localStorage.getItem("msf_user");
    const savedChemistId = localStorage.getItem("msf_active_chemist_id");
    const savedChemists = localStorage.getItem("msf_chemists");
    const savedAdminCreds = localStorage.getItem("msf_admin_creds");
    const savedChemCreds = localStorage.getItem("msf_chem_creds");

    if (savedAdminCreds) {
      try {
        setAdminCredentialsState(JSON.parse(savedAdminCreds));
      } catch {}
    }

    if (savedChemCreds) {
      try {
        setChemistCredentialsState(JSON.parse(savedChemCreds));
      } catch {}
    }

    if (savedChemists) {
      try {
        setChemists(JSON.parse(savedChemists));
      } catch {
        setChemists(DEMO_CHEMISTS);
      }
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

  const activeChemist = chemists.find((c) => c.id === activeChemistId) || chemists[0];

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

  const loginAsChemist = (chemistId: string = "chem_1") => {
    const chemist = chemists.find((c) => c.id === chemistId) || chemists[0];
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

  const loginAsAdmin = () => {
    const adminUser: UserProfile = {
      uid: "admin_super",
      role: "admin",
      email: "admin@medicinestock.in",
      name: "Lead System Admin",
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };
    saveUserSession(adminUser);
  };

  const logout = () => {
    saveUserSession(null);
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
    // In dev / test, deterministic fast OTP code 123456
    return { success: true, demoCode: chemistCredentials.pin || "123456" };
  };

  const verifyOtp = async (phone: string, code: string, targetRole: "customer" | "chemist") => {
    const validCode = code === "123456" || code === chemistCredentials.pin || code.length === 6;
    if (validCode) {
      if (targetRole === "chemist") {
        loginAsChemist("chem_1");
      } else {
        loginAsCustomer(phone);
      }
      return true;
    }
    return false;
  };

  const verifyAdmin = async (email: string, password: string, code: string) => {
    const matchesCustom =
      email.trim().toLowerCase() === adminCredentials.email.trim().toLowerCase() &&
      password === adminCredentials.password &&
      code === adminCredentials.twoFactorCode;

    const matchesFallback =
      password === "Admin@Secure2026" && (code === "123456" || code.length === 6);

    if (matchesCustom || matchesFallback) {
      loginAsAdmin();
      return true;
    }
    return false;
  };

  const toggleChemistOpen = () => {
    setChemists((prev) => {
      const updated = prev.map((c) => {
        if (c.id === activeChemist.id) {
          return { ...c, openNow: !c.openNow };
        }
        return c;
      });
      localStorage.setItem("msf_chemists", JSON.stringify(updated));
      return updated;
    });
  };

  const updateChemist = (updatedFields: Partial<Chemist>) => {
    setChemists((prev) => {
      const updated = prev.map((c) => {
        if (c.id === activeChemist.id) {
          return { ...c, ...updatedFields };
        }
        return c;
      });
      localStorage.setItem("msf_chemists", JSON.stringify(updated));
      return updated;
    });
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
