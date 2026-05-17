/**
 * SERVICES & PRICING DATA
 * 
 * This file contains all salon services, categories, and pricing.
 * EDIT HERE to update service names, prices, durations, and categories.
 * 
 * Structure:
 * - Each service has: id, name, category, price, duration_minutes, description
 * - Categories: hair, nails, waxing, lashes, massage
 * 
 * Categories are used for:
 * - Filtering in booking flow
 * - Homepage service cards
 * - Service menu organization
 */

export type ServiceCategory = "hair" | "nails" | "waxing" | "lashes" | "massage";

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  duration_minutes: number;
  description?: string;
}

// HAIR CATEGORY SERVICES
// Edit service names, prices, and durations here
export const HAIR_SERVICES: Service[] = [
  // Hair Cuts
  {
    id: "hair-cut-men-women",
    name: "Men & Women Hair Cut",
    category: "hair",
    price: 120,
    duration_minutes: 30,
    description: "Professional haircut for men or women",
  },
  {
    id: "hair-cut-men-shampoo",
    name: "Men + Shampoo Blower",
    category: "hair",
    price: 170,
    duration_minutes: 45,
    description: "Haircut with complimentary shampoo and blow dry",
  },
  {
    id: "hair-cut-women-shampoo",
    name: "Women + Shampoo Blower",
    category: "hair",
    price: 250,
    duration_minutes: 60,
    description: "Haircut with shampoo and professional blow dry",
  },
  {
    id: "shampoo-blower",
    name: "Shampoo Blower",
    category: "hair",
    price: 150,
    duration_minutes: 30,
    description: "Professional shampoo and blow dry styling",
  },
  {
    id: "hair-makeup",
    name: "Hair & Make Up",
    category: "hair",
    price: 700,
    duration_minutes: 120,
    description: "Complete hair styling and makeup application",
  },

  // Hair Treatment
  {
    id: "hot-oil",
    name: "Hot Oil",
    category: "hair",
    price: 250,
    duration_minutes: 45,
    description: "Nourishing hot oil hair treatment",
  },
  {
    id: "hair-spa",
    name: "Hair Spa",
    category: "hair",
    price: 350,
    duration_minutes: 60,
    description: "Deep conditioning spa treatment for hair",
  },
  {
    id: "keratin-cream",
    name: "Keratin Cream",
    category: "hair",
    price: 500,
    duration_minutes: 90,
    description: "Keratin treatment for smoothing and shine",
  },
  {
    id: "brazilian-blowout",
    name: "Brazilian Blowout",
    category: "hair",
    price: 800,
    duration_minutes: 120,
    description: "Brazilian blowout smoothing treatment",
  },
  {
    id: "brazilian-botox",
    name: "Brazilian Botox",
    category: "hair",
    price: 1000,
    duration_minutes: 120,
    description: "Brazilian botox hair rejuvenation treatment",
  },

  // Hair Coloring
  {
    id: "men-basic-tone",
    name: "Men Basic Tone",
    category: "hair",
    price: 500,
    duration_minutes: 60,
    description: "Men's basic hair color application",
  },
  {
    id: "women-basic-tone",
    name: "Women Basic Tone",
    category: "hair",
    price: 800,
    duration_minutes: 90,
    description: "Women's basic hair color application",
  },
  {
    id: "women-regrowth",
    name: "Women Regrowth (1 inch)",
    category: "hair",
    price: 400,
    duration_minutes: 60,
    description: "Regrowth color touch-up for women",
  },
  {
    id: "women-short-hair",
    name: "Women Short Hair Color",
    category: "hair",
    price: 600,
    duration_minutes: 75,
    description: "Color for women with short hair",
  },

  // Fashion Color
  {
    id: "highlight-men",
    name: "Highlight 1st Coat for Men",
    category: "hair",
    price: 350,
    duration_minutes: 90,
    description: "Men's hair highlights first application",
  },
  {
    id: "highlight-women",
    name: "Highlight 1st Coat for Women",
    category: "hair",
    price: 500,
    duration_minutes: 120,
    description: "Women's hair highlights first application",
  },
  {
    id: "full-bleach-women",
    name: "Full Bleach for Women",
    category: "hair",
    price: 800,
    duration_minutes: 150,
    description: "Full hair bleaching service for women",
  },
  {
    id: "ombre-color-shade",
    name: "Ombre & Color Shade",
    category: "hair",
    price: 800,
    duration_minutes: 150,
    description: "Ombre or color shade blending",
  },
  {
    id: "balayage-color",
    name: "Balayage Color",
    category: "hair",
    price: 2000,
    duration_minutes: 180,
    description: "Professional balayage color technique",
  },

  // Hair Perm
  {
    id: "perm-men",
    name: "Men Traditional Perm",
    category: "hair",
    price: 500,
    duration_minutes: 90,
    description: "Traditional permanent wave for men",
  },
  {
    id: "perm-women",
    name: "Women Traditional Perm",
    category: "hair",
    price: 800,
    duration_minutes: 120,
    description: "Traditional permanent wave for women",
  },
  {
    id: "air-perm-women",
    name: "Women Air Perming",
    category: "hair",
    price: 1500,
    duration_minutes: 150,
    description: "Air perming technique for women",
  },

  // Hair Rebonding
  {
    id: "rebond-men",
    name: "Hair Rebond - Men",
    category: "hair",
    price: 800,
    duration_minutes: 120,
    description: "Hair rebonding straightening for men",
  },
  {
    id: "rebond-women",
    name: "Hair Rebond - Women",
    category: "hair",
    price: 1000,
    duration_minutes: 150,
    description: "Hair rebonding straightening for women",
  },
  {
    id: "brazilian-blowout-rebond",
    name: "Brazilian + Blowout",
    category: "hair",
    price: 1500,
    duration_minutes: 180,
    description: "Brazilian treatment with blowout",
  },
  {
    id: "color-rebond",
    name: "Color Rebond",
    category: "hair",
    price: 1500,
    duration_minutes: 180,
    description: "Rebonding with color application",
  },
  {
    id: "brazilian-botox-rebond",
    name: "Brazilian + Botox",
    category: "hair",
    price: 1800,
    duration_minutes: 180,
    description: "Brazilian treatment with botox",
  },
  {
    id: "color-brazilian",
    name: "Color Brazilian",
    category: "hair",
    price: 2500,
    duration_minutes: 210,
    description: "Brazilian treatment with color",
  },
  {
    id: "color-highlight-brazilian",
    name: "Color + Highlight + Brazilian",
    category: "hair",
    price: 3000,
    duration_minutes: 240,
    description: "Complete color, highlight, and Brazilian treatment",
  },
];

// NAIL SERVICES
// Edit nail service names, prices, and durations here
export const NAIL_SERVICES: Service[] = [
  {
    id: "footspa-classic-pedicure",
    name: "Pamper Footspa + Classic Pedicure",
    category: "nails",
    price: 300,
    duration_minutes: 45,
  },
  {
    id: "footspa-classic-mani-pedi",
    name: "Pamper Footspa + Classic Manicure & Pedicure",
    category: "nails",
    price: 360,
    duration_minutes: 60,
  },
  {
    id: "gel-mani-pedi",
    name: "Gel Manicure + Gel Pedicure",
    category: "nails",
    price: 630,
    duration_minutes: 75,
  },
  {
    id: "gel-manicure",
    name: "Gel Manicure",
    category: "nails",
    price: 320,
    duration_minutes: 45,
  },
  {
    id: "gel-pedicure",
    name: "Gel Pedicure",
    category: "nails",
    price: 300,
    duration_minutes: 45,
  },
  {
    id: "footspa-gel-pedi",
    name: "Pamper Footspa + Gel Pedicure",
    category: "nails",
    price: 530,
    duration_minutes: 60,
  },
  {
    id: "footspa-classic-gel-mani",
    name: "Pamper Footspa + Classic Pedicure + Gel Manicure",
    category: "nails",
    price: 500,
    duration_minutes: 75,
  },
  {
    id: "footspa-gel-mani-pedi",
    name: "Pamper Footspa + Gel Manicure & Pedicure",
    category: "nails",
    price: 850,
    duration_minutes: 90,
  },
  {
    id: "classic-mani-pedi",
    name: "Classic Manicure & Pedicure",
    category: "nails",
    price: 250,
    duration_minutes: 60,
  },
  {
    id: "luxury-footspa",
    name: "Luxury Footspa",
    category: "nails",
    price: 270,
    duration_minutes: 30,
  },
  {
    id: "luxury-footspa-pedi",
    name: "Luxury Footspa + Pedicure",
    category: "nails",
    price: 370,
    duration_minutes: 45,
  },
  {
    id: "luxury-footspa-full",
    name: "Luxury Footspa + Pedicure + Manicure",
    category: "nails",
    price: 600,
    duration_minutes: 90,
  },
  {
    id: "classic-manicure",
    name: "Classic Manicure",
    category: "nails",
    price: 100,
    duration_minutes: 30,
  },
  {
    id: "pedicure",
    name: "Pedicure",
    category: "nails",
    price: 100,
    duration_minutes: 30,
  },
  {
    id: "add-on-scrub",
    name: "Add-on Scrub",
    category: "nails",
    price: 50,
    duration_minutes: 10,
  },
  {
    id: "footspa-pedi-scrub",
    name: "Footspa + Pedicure + Foot Spa Scrubbing",
    category: "nails",
    price: 400,
    duration_minutes: 60,
  },
  {
    id: "foot-massage",
    name: "Foot Massage",
    category: "nails",
    price: 300,
    duration_minutes: 30,
  },
];

// WAXING SERVICES
// Edit waxing service names, prices, and durations here
export const WAXING_SERVICES: Service[] = [
  { id: "wax-eyebrow", name: "Eyebrow", category: "waxing", price: 150, duration_minutes: 15 },
  { id: "wax-upper-lip", name: "Upper Lip", category: "waxing", price: 150, duration_minutes: 10 },
  { id: "wax-lower-lip", name: "Lower Lip", category: "waxing", price: 150, duration_minutes: 10 },
  { id: "wax-underarm", name: "Underarm", category: "waxing", price: 200, duration_minutes: 15 },
  { id: "wax-half-leg", name: "Half Leg", category: "waxing", price: 350, duration_minutes: 30 },
  { id: "wax-whole-leg", name: "Whole Leg", category: "waxing", price: 600, duration_minutes: 45 },
  { id: "wax-half-arm", name: "Half Arm", category: "waxing", price: 300, duration_minutes: 20 },
  { id: "wax-whole-arm", name: "Whole Arm", category: "waxing", price: 550, duration_minutes: 30 },
  { id: "wax-chest", name: "Chest", category: "waxing", price: 300, duration_minutes: 20 },
  { id: "wax-back", name: "Back", category: "waxing", price: 450, duration_minutes: 30 },
  { id: "wax-whole-face", name: "Whole Face", category: "waxing", price: 250, duration_minutes: 30 },
  { id: "wax-bikini", name: "Bikini", category: "waxing", price: 250, duration_minutes: 30 },
  { id: "wax-brazilian", name: "Brazilian", category: "waxing", price: 550, duration_minutes: 45 },
  { id: "wax-unlimited", name: "Unlimited", category: "waxing", price: 1600, duration_minutes: 180 },
];

// EYELASH EXTENSION SERVICES
// Edit lash services and prices here
export const LASH_SERVICES: Service[] = [
  { id: "lash-human-hair-450", name: "Human Hair Mascara (Classic)", category: "lashes", price: 450, duration_minutes: 60 },
  { id: "lash-human-hair-550", name: "Human Hair Mascara (Volume)", category: "lashes", price: 550, duration_minutes: 75 },
  { id: "lash-human-hair-600", name: "Human Hair Mascara (Premium)", category: "lashes", price: 600, duration_minutes: 90 },
  { id: "eyebrow-tint", name: "Eye Brow Tint", category: "lashes", price: 150, duration_minutes: 20 },
  { id: "lash-tint", name: "Eye Lash Tint", category: "lashes", price: 150, duration_minutes: 20 },
  { id: "keratin-lash-lift", name: "Keratin Lash Lift", category: "lashes", price: 500, duration_minutes: 60 },
];

// BODY MASSAGE SERVICES
// Edit massage service names, prices, and durations here
export const MASSAGE_SERVICES: Service[] = [
  { id: "foot-massage-30", name: "Foot Massage (30 mins)", category: "massage", price: 250, duration_minutes: 30 },
  { id: "back-massage-30", name: "Back Massage (30 mins)", category: "massage", price: 300, duration_minutes: 30 },
  { id: "legs-massage-30", name: "Legs Massage (30 mins)", category: "massage", price: 200, duration_minutes: 30 },
  { id: "whole-body-massage", name: "Whole Body Massage (1 hour)", category: "massage", price: 400, duration_minutes: 60 },
];

// ALL SERVICES COMBINED
// Used for database seeding and service filtering
export const ALL_SERVICES = [
  ...HAIR_SERVICES,
  ...NAIL_SERVICES,
  ...WAXING_SERVICES,
  ...LASH_SERVICES,
  ...MASSAGE_SERVICES,
];

// CATEGORY METADATA
// Used for homepage display and UI organization
export const CATEGORY_META = {
  hair: {
    label: "Hair",
    description: "Cuts, color, styling, treatments and more",
    icon: "Scissors",
  },
  nails: {
    label: "Nails",
    description: "Manicures, pedicures, gel services and foot care",
    icon: "Hand",
  },
  waxing: {
    label: "Waxing",
    description: "Professional hair removal treatments",
    icon: "Sparkles",
  },
  lashes: {
    label: "Lashes & Brows",
    description: "Eyelash extensions, tinting and lash lifts",
    icon: "Eye",
  },
  massage: {
    label: "Massage",
    description: "Relaxing body and foot massage treatments",
    icon: "Wind",
  },
} as const;

// Helper function: Get all services in a category
export function getServicesByCategory(category: ServiceCategory): Service[] {
  return ALL_SERVICES.filter((s) => s.category === category);
}

// Helper function: Get service by ID
export function getServiceById(id: string): Service | undefined {
  return ALL_SERVICES.find((s) => s.id === id);
}

// Helper function: Format price in Philippine Peso
export function formatPrice(price: number): string {
  return `₱${Number(price).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
}

// Helper function: Get total duration from multiple service IDs
export function getTotalDuration(serviceIds: string[]): number {
  return serviceIds.reduce((total, id) => {
    const service = getServiceById(id);
    return total + (service?.duration_minutes || 0);
  }, 0);
}

// Helper function: Get total price from multiple service IDs
export function getTotalPrice(serviceIds: string[]): number {
  return serviceIds.reduce((total, id) => {
    const service = getServiceById(id);
    return total + (service?.price || 0);
  }, 0);
}
