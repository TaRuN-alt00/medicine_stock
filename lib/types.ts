export type UserRole = "customer" | "chemist" | "admin";
export type Language = "en" | "hi";

export interface UserProfile {
  uid: string;
  role: UserRole;
  phone?: string;
  email?: string;
  name?: string;
  preferredLanguage: Language;
  createdAt: string;
}

export type ChemistVerificationStatus = "pending" | "verified" | "rejected" | "suspended";

export interface ChemistHours {
  open: string; // "09:00"
  close: string; // "22:00"
  is24Hours: boolean;
}

export interface ChemistMetrics {
  replyRate: number; // e.g. 96 (%)
  avgReplyTimeSeconds: number; // e.g. 42 (seconds)
  confirmedObtainedRate: number; // e.g. 92 (%)
  consecutiveMisses: number;
}

export interface Chemist {
  id: string;
  userId: string;
  shopName: string;
  ownerName: string;
  phone: string;
  drugLicenceNumber: string;
  gstNumber?: string;
  licenceDocUrl?: string;
  address: string;
  town: string;
  status: ChemistVerificationStatus;
  rejectionReason?: string;
  openNow: boolean;
  hours: ChemistHours;
  latitude: number;
  longitude: number;
  geohash: string;
  metrics: ChemistMetrics;
  createdAt: string;
}

export type MedicineForm = "tablet" | "syrup" | "injection" | "capsule" | "drops" | "ointment" | "inhaler";
export type MedicineSchedule = "OTC" | "H" | "H1" | "X";

export interface Medicine {
  id: string;
  brandName: string;
  saltComposition: string;
  strength: string;
  form: MedicineForm;
  schedule: MedicineSchedule;
  prescriptionRequired: boolean;
  synonyms: string[];
  searchTokens: string[];
}

export type RequestStatus = "open" | "answered" | "expired" | "cancelled";
export type PatientOutcome = "yes" | "no" | "not_yet" | "unrecorded";

export interface MedicineRequest {
  id: string;
  customerId: string;
  customerPhone?: string;
  medicineQuery: string;
  matchedMedicine?: Medicine;
  coarseLat: number; // Rounded to ~200m
  coarseLng: number;
  geohash: string;
  localityName: string;
  radiusKm: number;
  status: RequestStatus;
  createdAt: string;
  expiresAt: string;
  patientOutcome: PatientOutcome;
  notifiedChemistIds: string[];
}

export type ChemistAnswer = "yes" | "no";
export type ChemistNoteChip = "exact_brand" | "other_brand_same_salt" | "limited_quantity";

export interface RequestResponse {
  id: string;
  requestId: string;
  chemistId: string;
  chemistShopName: string;
  chemistPhone: string;
  chemistDistanceKm: number;
  answer: ChemistAnswer;
  noteChip?: ChemistNoteChip;
  respondedAt: string;
  validUntil: string; // 30 minutes from response
  isLate: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: "chemist" | "customer" | "medicine" | "setting";
  targetId: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  defaultRadiusKm: number;
  maxRadiusKm: number;
  requestExpiryMinutes: number;
  maxPingsPerChemistPerHour: number;
  retentionDays: number;
  featureFlags: {
    FEATURE_HOME_DELIVERY: boolean; // Must be false for v1
    FEATURE_PHOTO_SEARCH: boolean;
  };
}
