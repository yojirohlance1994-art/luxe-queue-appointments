/**
 * SALON PACKAGES
 * 
 * Pre-configured service bundles with discounted pricing.
 * These packages combine multiple services into attractive offers.
 * 
 * Edit packages here to:
 * - Change service combinations
 * - Adjust discount amounts
 * - Add new themed packages
 * - Update package descriptions
 */

import { Service } from "./services-data";

export interface SalonPackage {
  id: string;
  name: string;
  description: string;
  serviceIds: string[]; // IDs of services included in package
  originalPrice: number; // Sum of individual service prices
  packagePrice: number; // Discounted bundle price
  discountPercent: number; // Calculated discount percentage
  duration_minutes: number; // Total estimated time
  icon?: string; // Optional icon name
  color?: string; // Optional brand color
}

// PRINCESS PACKAGE
// Pamper yourself with hair and nail treatments
export const PRINCESS_PACKAGE: SalonPackage = {
  id: "pkg-princess",
  name: "Princess Package",
  description: "A complete pampering experience with hair styling, deep treatment, and nails",
  serviceIds: [
    "hair-cut-women-shampoo", // Women + Shampoo Blower — 250
    "hair-spa", // Hair Spa — 350
    "gel-pedicure", // Gel Pedicure — 300
  ],
  originalPrice: 250 + 350 + 300, // 900
  packagePrice: 750,
  discountPercent: 17,
  duration_minutes: 60 + 60 + 45, // 165 minutes (2h 45m)
  icon: "Crown",
  color: "bg-pink-500",
};

// GLOW UP PACKAGE
// Transform your look with color and lash enhancements
export const GLOWUP_PACKAGE: SalonPackage = {
  id: "pkg-glowup",
  name: "Glow Up Package",
  description: "Refresh your look with professional coloring, keratin treatment, and lash enhancement",
  serviceIds: [
    "women-basic-tone", // Women Basic Tone — 800
    "keratin-cream", // Keratin Cream — 500
    "lash-tint", // Eye Lash Tint — 150
    "foot-massage-30", // Foot Massage (30 mins) — 250
  ],
  originalPrice: 800 + 500 + 150 + 250, // 1700
  packagePrice: 1450,
  discountPercent: 15,
  duration_minutes: 90 + 90 + 20 + 30, // 230 minutes (3h 50m)
  icon: "Sparkles",
  color: "bg-amber-500",
};

// BRIDAL PACKAGE
// Complete beauty preparation for your special day
export const BRIDAL_PACKAGE: SalonPackage = {
  id: "pkg-bridal",
  name: "Bridal Package",
  description: "Look and feel your absolute best on your special day with complete beauty services",
  serviceIds: [
    "hair-makeup", // Hair & Make Up — 700
    "hair-spa", // Hair Spa — 350
    "luxury-footspa-full", // Luxury Footspa + Pedicure + Manicure — 600
    "whole-body-massage", // Whole Body Massage (1 hour) — 400
  ],
  originalPrice: 700 + 350 + 600 + 400, // 2050
  packagePrice: 1699,
  discountPercent: 17,
  duration_minutes: 120 + 60 + 90 + 60, // 330 minutes (5h 30m)
  icon: "Heart",
  color: "bg-rose-500",
};

// RELAXATION PACKAGE
// Unwind and de-stress with massage and foot treatments
export const RELAXATION_PACKAGE: SalonPackage = {
  id: "pkg-relaxation",
  name: "Relaxation Package",
  description: "Pure relaxation with foot care, hair treatment, and soothing massage",
  serviceIds: [
    "foot-massage-30", // Foot Massage (30 mins) — 250
    "hair-spa", // Hair Spa — 350
    "luxury-footspa-pedi", // Luxury Footspa + Pedicure — 370
  ],
  originalPrice: 250 + 350 + 370, // 970
  packagePrice: 799,
  discountPercent: 18,
  duration_minutes: 30 + 60 + 45, // 135 minutes (2h 15m)
  icon: "Wind",
  color: "bg-blue-500",
};

// QUICK REFRESH PACKAGE
// Fast and affordable beauty touch-up
export const QUICK_REFRESH_PACKAGE: SalonPackage = {
  id: "pkg-quick-refresh",
  name: "Quick Refresh Package",
  description: "Quick beauty touch-ups: haircut, manicure and pedicure",
  serviceIds: [
    "hair-cut-women-shampoo", // Women + Shampoo Blower — 250
    "gel-manicure", // Gel Manicure — 320
    "gel-pedicure", // Gel Pedicure — 300
  ],
  originalPrice: 250 + 320 + 300, // 870
  packagePrice: 699,
  discountPercent: 20,
  duration_minutes: 60 + 45 + 45, // 150 minutes (2h 30m)
  icon: "Zap",
  color: "bg-green-500",
};

// ALL PACKAGES
// Used for package display on homepage and booking flow
export const ALL_PACKAGES: SalonPackage[] = [
  PRINCESS_PACKAGE,
  GLOWUP_PACKAGE,
  BRIDAL_PACKAGE,
  RELAXATION_PACKAGE,
  QUICK_REFRESH_PACKAGE,
];

// Helper: Get package by ID
export function getPackageById(id: string): SalonPackage | undefined {
  return ALL_PACKAGES.find((pkg) => pkg.id === id);
}

// Helper: Get all packages
export function getAllPackages(): SalonPackage[] {
  return ALL_PACKAGES;
}

// Helper: Calculate savings amount
export function getPackageSavings(pkg: SalonPackage): number {
  return pkg.originalPrice - pkg.packagePrice;
}
