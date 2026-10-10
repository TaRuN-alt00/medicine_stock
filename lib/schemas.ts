import { z } from "zod";

export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number");

export const otpSchema = z
  .string()
  .trim()
  .length(6, "Verification code must be 6 digits");

export const adminLoginSchema = z.object({
  email: z.string().email("Enter a valid admin email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  twoFactorCode: z.string().length(6, "2FA code must be 6 digits"),
});

export const chemistOnboardingSchema = z.object({
  shopName: z.string().min(3, "Shop name is required"),
  ownerName: z.string().min(3, "Owner name is required"),
  phone: indianPhoneSchema,
  drugLicenceNumber: z.string().min(5, "Valid Drug Licence Number is required"),
  gstNumber: z.string().optional(),
  address: z.string().min(10, "Complete shop address is required"),
  town: z.string().min(2, "Town or city name is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  is24Hours: z.boolean().default(false),
  openHour: z.string().default("09:00"),
  closeHour: z.string().default("22:00"),
});

export const medicineRequestSchema = z.object({
  medicineQuery: z.string().min(2, "Enter a medicine brand or salt name"),
  medicineId: z.string().optional(),
  coarseLat: z.number(),
  coarseLng: z.number(),
  localityName: z.string().min(2, "Locality is required"),
  radiusKm: z.number().min(1).max(15).default(3),
});

export const chemistResponseSchema = z.object({
  requestId: z.string(),
  chemistId: z.string(),
  answer: z.enum(["yes", "no"]),
  noteChip: z.enum(["exact_brand", "other_brand_same_salt", "limited_quantity"]).optional(),
});
