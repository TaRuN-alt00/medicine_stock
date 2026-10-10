import { Chemist, Medicine, MedicineRequest, RequestResponse, AuditLog } from "./types";
import { DEMO_CHEMISTS, STARTER_MEDICINES } from "./seed-data";

// Helper: Calculate distance between two lat/lng in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// In-memory + LocalStorage backed store
class DatabaseStore {
  private chemists: Chemist[] = DEMO_CHEMISTS;
  private medicines: Medicine[] = STARTER_MEDICINES;
  private requests: MedicineRequest[] = [];
  private responses: RequestResponse[] = [];
  private auditLogs: AuditLog[] = [];
  private listeners: Set<() => void> = new Set();
  private channel: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
      window.addEventListener("storage", () => {
        this.loadFromStorage();
        this.notify();
      });

      if ("BroadcastChannel" in window) {
        try {
          this.channel = new BroadcastChannel("medicine_stock_network");
          this.channel.onmessage = () => {
            this.loadFromStorage();
            this.notify();
          };
        } catch (e) {
          console.error("BroadcastChannel not supported", e);
        }
      }
    }
  }

  private loadFromStorage() {
    try {
      const savedChemists = localStorage.getItem("msf_chemists");
      if (savedChemists !== null) {
        try { this.chemists = JSON.parse(savedChemists); } catch {}
      }

      const savedMedicines = localStorage.getItem("msf_medicines");
      if (savedMedicines && savedMedicines.trim().length > 1) {
        try { this.medicines = JSON.parse(savedMedicines); } catch {}
      }

      const savedRequests = localStorage.getItem("msf_requests");
      if (savedRequests && savedRequests.trim().length > 1) {
        try { this.requests = JSON.parse(savedRequests); } catch {}
      }

      const savedResponses = localStorage.getItem("msf_responses");
      if (savedResponses && savedResponses.trim().length > 1) {
        try { this.responses = JSON.parse(savedResponses); } catch {}
      }

      const savedLogs = localStorage.getItem("msf_audit_logs");
      if (savedLogs && savedLogs.trim().length > 1) {
        try { this.auditLogs = JSON.parse(savedLogs); } catch {}
      }
    } catch (e) {
      console.error("Failed to load local database state", e);
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("msf_chemists", JSON.stringify(this.chemists));
      localStorage.setItem("msf_medicines", JSON.stringify(this.medicines));
      localStorage.setItem("msf_requests", JSON.stringify(this.requests));
      localStorage.setItem("msf_responses", JSON.stringify(this.responses));
      localStorage.setItem("msf_audit_logs", JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error("Failed to persist database state", e);
    }
    if (this.channel) {
      try {
        this.channel.postMessage({ type: "SYNC", timestamp: Date.now() });
      } catch {}
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Chemist methods
  public getChemists(): Chemist[] {
    return [...this.chemists];
  }

  public getChemistById(id: string): Chemist | undefined {
    return this.chemists.find((c) => c.id === id);
  }

  public getChemistByPhone(phone: string): Chemist | undefined {
    return this.chemists.find((c) => c.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""));
  }

  public addChemist(chemist: Chemist, adminEmail: string = "system") {
    // Avoid duplicate IDs
    this.chemists = this.chemists.filter((c) => c.id !== chemist.id);
    this.chemists.unshift(chemist);
    this.addAuditLog(adminEmail, `Enrolled pharmacy shop: ${chemist.shopName} (${chemist.drugLicenceNumber})`, "chemist", chemist.id);
    this.persist();
  }

  public deleteChemist(id: string, adminEmail: string = "admin@medicinestock.in") {
    const chem = this.chemists.find((c) => c.id === id);
    this.chemists = this.chemists.filter((c) => c.id !== id);
    this.addAuditLog(adminEmail, `Deleted pharmacy shop: ${chem?.shopName || id}`, "chemist", id);
    this.persist();
  }

  public clearSyntheticChemists(adminEmail: string = "admin@medicinestock.in") {
    const countBefore = this.chemists.length;
    this.chemists = this.chemists.filter((c) => !c.isSynthetic && !["chem_1", "chem_2", "chem_3", "chem_4", "chem_5"].includes(c.id));
    this.addAuditLog(adminEmail, `Cleared sample synthetic shops (${countBefore - this.chemists.length} removed)`, "chemist", "all");
    this.persist();
  }

  public resetToSampleChemists(adminEmail: string = "admin@medicinestock.in") {
    this.chemists = [...DEMO_CHEMISTS];
    this.addAuditLog(adminEmail, "Restored default sample chemist dataset", "chemist", "all");
    this.persist();
  }

  public updateChemistStatus(id: string, status: Chemist["status"], adminEmail: string, reason?: string) {
    const chemist = this.chemists.find((c) => c.id === id);
    if (chemist) {
      chemist.status = status;
      if (reason) chemist.rejectionReason = reason;
      this.addAuditLog(adminEmail, `Updated chemist ${chemist.shopName} status to ${status}`, "chemist", id);
      this.persist();
    }
  }

  public toggleChemistOpen(id: string) {
    const chemist = this.chemists.find((c) => c.id === id);
    if (chemist) {
      chemist.openNow = !chemist.openNow;
      this.persist();
    }
  }

  // Medicine methods
  public getMedicines(): Medicine[] {
    return [...this.medicines];
  }

  public searchMedicines(query: string): Medicine[] {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];

    return this.medicines.filter((m) => {
      const matchBrand = m.brandName.toLowerCase().includes(clean);
      const matchSalt = m.saltComposition.toLowerCase().includes(clean);
      const matchSynonyms = m.synonyms.some((s) => s.toLowerCase().includes(clean));
      const matchTokens = m.searchTokens.some((t) => t.toLowerCase().includes(clean));
      return matchBrand || matchSalt || matchSynonyms || matchTokens;
    });
  }

  public addMedicine(medicine: Medicine, adminEmail: string) {
    this.medicines.unshift(medicine);
    this.addAuditLog(adminEmail, `Added new medicine: ${medicine.brandName}`, "medicine", medicine.id);
    this.persist();
  }

  // Request & Fan-Out methods
  public createRequest(data: Omit<MedicineRequest, "id" | "createdAt" | "expiresAt" | "status" | "patientOutcome" | "notifiedChemistIds">): MedicineRequest {
    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins expiry

    // Fan-out logic: find open, verified chemists within radius
    const nearbyChemists = this.chemists.filter((chem) => {
      if (chem.status !== "verified" || !chem.openNow) return false;
      const dist = calculateDistanceKm(data.coarseLat, data.coarseLng, chem.latitude, chem.longitude);
      return dist <= data.radiusKm;
    });

    const newRequest: MedicineRequest = {
      ...data,
      id: "req_" + Date.now(),
      status: "open",
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      patientOutcome: "unrecorded",
      notifiedChemistIds: nearbyChemists.map((c) => c.id),
    };

    this.requests.unshift(newRequest);
    this.persist();
    return newRequest;
  }

  public getRequestById(id: string): MedicineRequest | undefined {
    return this.requests.find((r) => r.id === id);
  }

  public getRequestsForCustomer(customerId: string): MedicineRequest[] {
    return this.requests.filter((r) => r.customerId === customerId);
  }

  public getIncomingRequestsForChemist(chemistId: string): MedicineRequest[] {
    return this.requests.filter((r) => r.status === "open" && r.notifiedChemistIds.includes(chemistId));
  }

  public respondToRequest(data: {
    requestId: string;
    chemistId: string;
    answer: "yes" | "no";
    noteChip?: RequestResponse["noteChip"];
  }): RequestResponse {
    const chemist = this.chemists.find((c) => c.id === data.chemistId);
    const request = this.requests.find((r) => r.id === data.requestId);
    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins valid

    const distance =
      chemist && request
        ? calculateDistanceKm(request.coarseLat, request.coarseLng, chemist.latitude, chemist.longitude)
        : 1.0;

    // Remove any previous response from this chemist for this request (handles changing answer or undo)
    this.responses = this.responses.filter(
      (resp) => !(resp.requestId === data.requestId && resp.chemistId === data.chemistId)
    );

    const newResponse: RequestResponse = {
      id: "resp_" + Date.now(),
      requestId: data.requestId,
      chemistId: data.chemistId,
      chemistShopName: chemist?.shopName || "Local Chemist",
      chemistPhone: chemist?.phone || "9810123456",
      chemistDistanceKm: distance,
      answer: data.answer,
      noteChip: data.noteChip,
      respondedAt: now.toISOString(),
      validUntil: validUntil.toISOString(),
      isLate: request ? new Date(request.expiresAt) < now : false,
    };

    this.responses.unshift(newResponse);

    if (request && data.answer === "yes") {
      request.status = "answered";
    }

    this.persist();
    return newResponse;
  }

  public undoResponse(requestId: string, chemistId: string) {
    this.responses = this.responses.filter(
      (resp) => !(resp.requestId === requestId && resp.chemistId === chemistId)
    );
    this.persist();
  }

  public getResponsesForRequest(requestId: string): RequestResponse[] {
    return this.responses.filter((r) => r.requestId === requestId);
  }

  public setPatientOutcome(requestId: string, outcome: MedicineRequest["patientOutcome"]) {
    const request = this.requests.find((r) => r.id === requestId);
    if (request) {
      request.patientOutcome = outcome;
      this.persist();
    }
  }

  public widenRequestRadius(requestId: string, newRadiusKm: number) {
    const request = this.requests.find((r) => r.id === requestId);
    if (request) {
      request.radiusKm = newRadiusKm;
      // Recompute notified chemists
      const nearbyChemists = this.chemists.filter((chem) => {
        if (chem.status !== "verified" || !chem.openNow) return false;
        const dist = calculateDistanceKm(request.coarseLat, request.coarseLng, chem.latitude, chem.longitude);
        return dist <= newRadiusKm;
      });
      request.notifiedChemistIds = nearbyChemists.map((c) => c.id);
      this.persist();
    }
  }

  // Audit Log methods
  public addAuditLog(adminEmail: string, details: string, targetType: AuditLog["targetType"], targetId: string) {
    const log: AuditLog = {
      id: "log_" + Date.now(),
      adminId: "admin_super",
      adminEmail,
      action: details,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }
}

export const db = new DatabaseStore();
