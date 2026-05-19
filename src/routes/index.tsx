/**
 * HOMEPAGE ROUTE
 *
 * Main landing page showcasing salon services, team, portfolio, and booking.
 *
 * PRICING & SERVICES:
 * - All service pricing is now in: src/lib/services-data.ts
 * - Edit that file to update prices, durations, and service descriptions
 * - Changes automatically reflect on homepage
 *
 * PACKAGES:
 * - Pre-configured bundles in: src/lib/packages-data.ts
 * - Edit to change package offerings and discounts
 *
 * IMAGE LOCATIONS & REPLACEMENTS:
 * See detailed comments below for each image section
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Sparkles,
  Scissors,
  Hand,
  Heart,
  Star,
  Clock,
  MapPin,
} from "lucide-react";

// PLACEHOLDER IMAGE
// Replace with your actual images
const PLACEHOLDER = "/placeholder.svg";

/*
════════════════════════════════════════════════════════════════════════
  HERO IMAGE LOCATIONS & REPLACEMENTS
════════════════════════════════════════════════════════════════════════

File Location: /public/hero/
Current files: hero-1.jpg, hero-2.jpg, hero-3.jpg

To update hero images:
1. Add your images to /public/hero/ folder
2. Update the src paths below (currently /placeholder.svg)

Recommended dimensions: 1920x1440px (16:9 aspect ratio)
Format: JPG or PNG

Example replacement:
  { src: "/hero/hero-1.jpg", alt: "...", ... }
*/

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glammee — Hair, Nail & Beauty Salon" },
      {
        name: "description",
        content: "Glammee — neighborhood hair, nail, and beauty salon. Book your visit today.",
      },
      { property: "og:title", content: "Glammee — Hair, Nail & Beauty Salon" },
      {
        property: "og:description",
        content: "Honest care, real results. Book your appointment at Glammee.",
      },
    ],
  }),
  component: Index,
});

// HERO CAROUSEL SLIDES
// Edit headline and image filenames here
const HERO_SLIDES = [
  {
    src: "/Hero/hero.jpg",
    alt: "Glammee styling chair",
    eyebrow: "Hair - Color - Style",
    headline: "Style that actually suits you.",
    category: "hair",
  },
  {
    src: "/Hero/hero-nails.jpg.jpg",
    alt: "Glammee nail bar",
    eyebrow: "Nails - Gel - Art",
    headline: "Nails worth showing off.",
    category: "nails",
  },
  {
    src: "/Hero/hero-makeup.jpg.jpg",
    alt: "Glammee beauty room",
    eyebrow: "Lashes - Brows - Makeup",
    headline: "Polished, never overdone.",
    category: "lashes",
  },
];

const peso = (n: number) => `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

type ServicePreview = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  price_note: string | null;
};
type Announcement = { id: string; title: string; body: string; image_url: string | null };
type HomePackage = {
  id: string;
  service_id: string;
  service_ids?: string[];
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
};

function Index() {
  const [slide, setSlide] = useState(0);
  const [services, setServices] = useState<ServicePreview[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [packages, setPackages] = useState<HomePackage[]>([]);

  // AUTO-ROTATE HERO CAROUSEL
  // Changes slide every 5.5 seconds
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  // FETCH SERVICES FROM DATABASE
  // Shows preview of services by category
  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, category, description, duration_minutes, price, price_note")
      .eq("active", true)
      .order("category")
      .then(({ data }) => data && setServices(data as ServicePreview[]));
    supabase
      .from("announcements")
      .select("id, title, body, image_url")
      .eq("active", true)
      .order("sort_order")
      .limit(3)
      .then(({ data }) => data && setAnnouncements(data as Announcement[]));

    Promise.all([
      supabase
        .from("service_packages")
        .select("id, service_id, name, description, price, duration_minutes")
        .eq("active", true)
        .order("sort_order")
        .limit(6),
      supabase.from("service_package_items").select("package_id, service_id").order("sort_order"),
    ]).then(([packageRes, itemRes]) => {
      const itemsByPackage = ((itemRes.data as { package_id: string; service_id: string }[]) ?? []).reduce(
        (map, item) => {
          const ids = map.get(item.package_id) ?? [];
          ids.push(item.service_id);
          map.set(item.package_id, ids);
          return map;
        },
        new Map<string, string[]>(),
      );
      if (packageRes.data) {
        setPackages(
          (packageRes.data as HomePackage[])
            .map((pkg) => ({
              ...pkg,
              service_ids: itemsByPackage.get(pkg.id) ?? [pkg.service_id],
            }))
            .filter((pkg) => (pkg.service_ids?.length ?? 0) > 1),
        );
      }
    });
  }, []);

  const packagePricing = (pkg: HomePackage) => {
    const serviceIds = pkg.service_ids?.length ? pkg.service_ids : [pkg.service_id];
    const included = serviceIds
      .map((id) => services.find((service) => service.id === id))
      .filter(Boolean) as ServicePreview[];
    const original = included.reduce((sum, service) => sum + Number(service.price || 0), 0);
    const discount = included.length >= 3 ? 0.15 : included.length === 2 ? 0.1 : 0;
    const adjusted = original > 0 ? Math.round(original * (1 - discount)) : Number(pkg.price || 0);
    return { included, original, adjusted, savings: Math.max(original - adjusted, 0) };
  };

  return (
    <>
      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden bg-background">
        {/* Slides */}
        <div className="absolute inset-0">
          {HERO_SLIDES.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0"}`}
              aria-hidden={i !== slide}
            >
              <img
                src={s.src}
                alt={s.alt}
                className="w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
            </div>
          ))}
        </div>

        <div className="relative container mx-auto px-4 lg:px-8 min-h-[88vh] flex flex-col justify-center py-24">
          <div className="max-w-2xl animate-float-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-[0.3em] text-foreground/80 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {HERO_SLIDES[slide].eyebrow}
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] text-foreground mb-6">
              <span className="text-gradient">Glammee.</span>
              <br />
              <span className="text-foreground/90">{HERO_SLIDES[slide].headline}</span>
            </h1>
            <p className="text-lg text-foreground/75 max-w-xl leading-relaxed mb-10">
              A neighborhood hair, nail and beauty studio focused on honest care and real results —
              book your seat in minutes.
            </p>

            {/* CALL TO ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full px-10 py-7 text-base font-semibold bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-glow"
              >
                <Link to="/booking" search={{ category: HERO_SLIDES[slide].category }}>
                  Book Now <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-10 py-7 text-base font-semibold border-white/20 bg-white/5 text-foreground hover:bg-white/10 backdrop-blur"
              >
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary fill-primary" /> 4.9 average client rating
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Same-week appointments
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> 7 Tamarraw Hill Rd, Marulas
              </div>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-10 right-4 lg:right-8 flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Show slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "w-10 bg-primary" : "w-5 bg-white/30 hover:bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="py-14 bg-surface-1">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-3 gap-4">
              {announcements.map((a) => (
                <article key={a.id} className="rounded-2xl border border-white/5 bg-background p-5">
                  {a.image_url && (
                    <img
                      src={a.image_url}
                      alt=""
                      className="mb-4 aspect-video w-full rounded-xl object-cover"
                    />
                  )}
                  <h2 className="font-display text-xl font-semibold text-foreground">{a.title}</h2>
                  <p className="mt-2 text-sm text-foreground/70 line-clamp-3">{a.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============== SERVICES PREVIEW ============== */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">
                Available Services
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Curated care, <span className="text-gradient">priced honestly</span>.
              </h2>
              <p className="mt-5 text-foreground/70 text-lg leading-relaxed">
                A focused menu across hair, nails and beauty — every service includes a quick
                consult so you walk out exactly how you wanted.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full self-start lg:self-end border-white/15 bg-white/5 hover:bg-white/10 text-foreground"
            >
              <Link to="/services">
                View full menu <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* SERVICE CATEGORY CARDS */}
          {/* Grouped by: hair, nails, waxing, lashes, massage */}
          {/* Edit service names & prices in: src/lib/services-data.ts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* HAIR CATEGORY */}
            <article className="group relative rounded-3xl bg-gradient-surface border border-white/5 p-8 shadow-card hover-lift overflow-hidden">
              <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-glow opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary mb-5">
                  <Scissors className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">Hair</h3>
                <p className="text-sm text-foreground/60 mb-6">
                  Cuts, color, styling, treatments and more.
                </p>

                <ul className="space-y-3 mb-7">
                  {services
                    .filter((s) => s.category === "hair")
                    .slice(0, 3)
                    .map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-4 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-foreground/55 uppercase tracking-wider">
                            {s.duration_minutes} min
                          </div>
                        </div>
                        <span className="text-primary font-semibold whitespace-nowrap">
                          {s.price_note || peso(s.price)}
                        </span>
                      </li>
                    ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-glow"
                >
                  <Link to="/booking" search={{ category: "hair" }}>
                    Book Hair <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </article>

            {/* NAILS CATEGORY */}
            <article className="group relative rounded-3xl bg-gradient-surface border border-white/5 p-8 shadow-card hover-lift overflow-hidden">
              <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-glow opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary mb-5">
                  <Hand className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">Nails</h3>
                <p className="text-sm text-foreground/60 mb-6">
                  Manicures, pedicures, gel services and foot care.
                </p>

                <ul className="space-y-3 mb-7">
                  {services
                    .filter((s) => s.category === "nails")
                    .slice(0, 3)
                    .map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-4 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-foreground/55 uppercase tracking-wider">
                            {s.duration_minutes} min
                          </div>
                        </div>
                        <span className="text-primary font-semibold whitespace-nowrap">
                          {s.price_note || peso(s.price)}
                        </span>
                      </li>
                    ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-glow"
                >
                  <Link to="/booking" search={{ category: "nails" }}>
                    Book Nails <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </article>

            {/* BEAUTY & BODY CATEGORY (Lashes, Massage, Waxing) */}
            <article className="group relative rounded-3xl bg-gradient-surface border border-white/5 p-8 shadow-card hover-lift overflow-hidden">
              <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-glow opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary mb-5">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                  Beauty & Body
                </h3>
                <p className="text-sm text-foreground/60 mb-6">
                  Lashes, brows, massage and more treatments.
                </p>

                <ul className="space-y-3 mb-7">
                  {[
                    ...services.filter((s) => s.category === "lashes"),
                    ...services.filter((s) => s.category === "body"),
                    ...services.filter((s) => s.category === "waxing"),
                  ]
                    .slice(0, 3)
                    .map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-4 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-foreground/55 uppercase tracking-wider">
                            {s.duration_minutes} min
                          </div>
                        </div>
                        <span className="text-primary font-semibold whitespace-nowrap">
                          {s.price_note || peso(s.price)}
                        </span>
                      </li>
                    ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-glow"
                >
                  <Link to="/booking" search={{ category: "lashes" }}>
                    Book Beauty <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============== PACKAGES SHOWCASE ============== */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Special Offers</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-4">
              Curated <span className="text-gradient">package deals</span>.
            </h2>
            <p className="text-foreground/70 max-w-2xl text-lg leading-relaxed">
              Combine multiple services into one appointment and save — from bridal beauty to
              relaxation getaways.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const pricing = packagePricing(pkg);
              return (
              <div
                key={pkg.id}
                className="group relative rounded-3xl bg-gradient-surface border border-white/5 p-8 shadow-card hover-lift overflow-hidden transition-all"
              >
                <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-glow opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  {/* Package header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                        {pkg.name}
                      </h3>
                      <p className="text-sm text-foreground/60">{pkg.description}</p>
                    </div>
                    <Sparkles className="h-6 w-6 text-primary flex-shrink-0" />
                  </div>

                  {/* Services included */}
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-foreground/70 uppercase tracking-widest mb-3">
                      Includes:
                    </div>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {pricing.included.map((service) => {
                        const serviceId = service.id;
                        return (
                          <li key={serviceId} className="flex items-center gap-2">
                            <span className="text-primary">•</span>
                            <span>{service?.name || serviceId}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3 mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/60 uppercase tracking-widest">
                        Original
                      </span>
                      <span className="line-through text-foreground/60">
                        {peso(pricing.original)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/60 uppercase tracking-widest">
                        Package
                      </span>
                      <span className="font-display text-2xl font-bold text-primary">
                        {peso(pricing.adjusted)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-sm font-semibold text-green-400">You Save</span>
                      <span className="font-semibold text-green-400">
                        {peso(pricing.savings)}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    asChild
                    size="lg"
                    className="w-full rounded-full bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-glow"
                  >
                    <Link to="/booking" search={{ category: undefined }}>
                      Book {pkg.name} <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== OUR TEAM (image right) ============== */}
      {/* TEAM IMAGES LOCATION & REPLACEMENT */}
      {/* 
        File Location: /public/team/
        Images to add: team-1.jpg, team-2.jpg, team-3.jpg, team-4.jpg
        
        Recommended dimensions:
        - team-1.jpg (left column, tall): 800x1000px
        - team-2.jpg (left column, square): 800x800px
        - team-3.jpg (right column, square): 800x800px
        - team-4.jpg (right column, tall): 800x1000px
        
        Format: JPG or PNG
        
        Replace /placeholder.svg with actual paths like: /team/team-1.jpg
      */}
      <section className="py-24 bg-surface-1">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Our Team</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Hands you can <span className="text-gradient">actually trust</span>.
              </h2>
              <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                Our stylists, nail artists and beauty experts each bring their own signature touch —
                chosen for their craft, kept for the way they treat every guest.
              </p>
              <ul className="space-y-3 mb-9">
                {[
                  "Hair stylists with 5+ years of color expertise",
                  "Certified nail technicians, sanitized tools every visit",
                  "Beauty artists trained in lashes, brows & makeup",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-foreground/80">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                className="rounded-full px-9 bg-gradient-primary text-primary-foreground shadow-glow"
              >
                <Link to="/team">
                  Meet the team <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-surface-2 shadow-elegant hover-lift">
                    <img
                      src="/Team/team-hair.png"
                      alt="Hair stylist at work"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Team image 1: /public/team/team-1.jpg */}
                  </div>
                  <div className="aspect-square rounded-3xl overflow-hidden bg-surface-2 shadow-card hover-lift">
                    <img
                      src="/Team/team-nails.png"
                      alt="Nail artist working"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Team image 2: /public/team/team-2.jpg */}
                  </div>
                </div>
                <div className="space-y-4 pt-10">
                  <div className="aspect-square rounded-3xl overflow-hidden bg-surface-2 shadow-card hover-lift">
                    <img
                      src="/Team/team-makeup.png"
                      alt="Beauty artist applying makeup"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Team image 3: /public/team/team-3.jpg */}
                  </div>
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-surface-2 shadow-elegant hover-lift">
                    <img
                      src="/Team/team-group.jpg"
                      alt="Salon team members"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Team image 4: /public/team/team-4.jpg */}
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 -inset-10 bg-gradient-glow opacity-40 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ============== OUR WORK (image left) ============== */}
      {/* PORTFOLIO & GALLERY IMAGES */}
      {/* 
        File Location: /public/portfolio/ or /public/gallery/
        Images to add: portfolio-featured.jpg, work-1.jpg, work-2.jpg, work-3.jpg
        
        Recommended dimensions:
        - portfolio-featured.jpg (large): 1200x1200px
        - work-1.jpg (square): 400x400px
        - work-2.jpg (square): 400x400px
        - work-3.jpg (wide): 1200x600px
        
        Format: JPG or PNG
        Quality: High resolution for detailed salon work showcases
        
        Replace /placeholder.svg with actual portfolio images
      */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 row-span-2 aspect-square rounded-3xl overflow-hidden bg-surface-1 shadow-elegant hover-lift">
                  <img
                    src="/Portfolio/portfolio-featured.jpg"
                    alt="Featured salon work"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Featured work: /public/portfolio/portfolio-featured.jpg */}
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-surface-1 shadow-card hover-lift">
                  <img
                    src="/Hero/hero-nails.jpg.jpg"
                    alt="Recent salon work 1"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Work 1: /public/portfolio/work-1.jpg */}
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-surface-1 shadow-card hover-lift">
                  <img
                    src="/Hero/hero-makeup.jpg.jpg"
                    alt="Recent salon work 2"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Work 2: /public/portfolio/work-2.jpg */}
                </div>
                <div className="aspect-[3/2] col-span-3 rounded-3xl overflow-hidden bg-surface-1 shadow-elegant hover-lift">
                  <img
                    src="/Portfolio/portfolio-wide.jpg"
                    alt="Featured portfolio showcase"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Work 3: /public/portfolio/work-3.jpg */}
                </div>
              </div>
              <div className="absolute -z-10 -inset-10 bg-gradient-glow opacity-40 blur-3xl" />
            </div>

            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Our Work</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Real results, <span className="text-gradient">real clients</span>.
              </h2>
              <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                Every cut, color, and set in our gallery comes from a Glammee chair — no stock
                photos, no filters, just the looks our clients walked out with.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-9">
                {[
                  { n: "1.2k+", l: "Looks created" },
                  { n: "98%", l: "Repeat clients" },
                  { n: "4.9★", l: "Avg rating" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-2xl bg-surface-1 border border-white/5 p-4 text-center"
                  >
                    <div className="font-display text-2xl font-bold text-foreground">{s.n}</div>
                    <div className="text-[10px] uppercase tracking-widest text-foreground/55 mt-1">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                asChild
                size="lg"
                className="rounded-full px-9 bg-gradient-primary text-primary-foreground shadow-glow"
              >
                <Link to="/work">
                  Browse the gallery <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============== OUR PROMISE ============== */}
      <section className="py-24 bg-surface-1">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Our Promise</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Honest care. <span className="text-gradient">Real results.</span>
          </h2>
          <p className="text-foreground/75 text-lg leading-relaxed mb-10">
            From precision cuts to flawless gel manicures and lash applications, every Glammee visit
            is built around comfort, attention to detail, and pricing you can actually trust.
          </p>
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {[
              {
                t: "Transparent pricing",
                d: "No surprise add-ons — every PHP price is on the menu.",
              },
              { t: "Sanitized tools", d: "Fresh, sanitized tools and clean stations every visit." },
              {
                t: "Real consultations",
                d: "Five honest minutes before scissors ever touch hair.",
              },
            ].map((p) => (
              <div
                key={p.t}
                className="rounded-2xl bg-background border border-white/5 p-6 text-left hover-lift"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1.5">{p.t}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-foreground"
          >
            <Link to="/about">
              Discover our story <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
