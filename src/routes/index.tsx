import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/BookingDialog";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles, Scissors, Hand, Heart, Star, Clock, MapPin } from "lucide-react";

// Replace these in /public with real photography to bring the hero to life.
const PLACEHOLDER = "/placeholder.svg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glammee — Hair, Nail & Beauty Salon" },
      { name: "description", content: "Glammee — neighborhood hair, nail, and beauty salon. Book your visit today." },
      { property: "og:title", content: "Glammee — Hair, Nail & Beauty Salon" },
      { property: "og:description", content: "Honest care, real results. Book your appointment at Glammee." },
    ],
  }),
  component: Index,
});

// Cinematic hero slides — swap src for hero-1.jpg / hero-2.jpg / hero-3.jpg in /public.
const HERO_SLIDES = [
  { src: PLACEHOLDER, alt: "Glammee styling chair", eyebrow: "Hair · Color · Style", headline: "Style that actually suits you." },
  { src: PLACEHOLDER, alt: "Glammee nail bar",       eyebrow: "Nails · Gel · Art",      headline: "Nails worth showing off." },
  { src: PLACEHOLDER, alt: "Glammee beauty room",    eyebrow: "Lashes · Brows · Makeup", headline: "Polished, never overdone." },
];

const peso = (n: number) => `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

const CATEGORY_META = {
  hair:  { label: "Hair",  icon: Scissors, blurb: "Cuts, color, and treatments." },
  nails: { label: "Nails", icon: Hand,     blurb: "Manicures, gel, and nail art." },
  body:  { label: "Beauty & Body", icon: Heart, blurb: "Lashes, brows, and makeup." },
} as const;
type Cat = keyof typeof CATEGORY_META;

type ServicePreview = { id: string; name: string; category: Cat; description: string | null; duration_minutes: number; price: number };

function Index() {
  const [open, setOpen] = useState(false);
  const [defaultId, setDefaultId] = useState<string>();
  const [slide, setSlide] = useState(0);
  const [services, setServices] = useState<ServicePreview[]>([]);

  // Auto-rotate hero
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, category, description, duration_minutes, price")
      .eq("active", true)
      .order("category")
      .then(({ data }) => data && setServices(data as ServicePreview[]));
  }, []);

  const openBooking = (id?: string) => { setDefaultId(id); setOpen(true); };

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
              <img src={s.src} alt={s.alt} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
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
              A neighborhood hair, nail and beauty studio focused on honest care and real results — book your seat in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => openBooking()}
                size="lg"
                className="rounded-full px-10 py-7 text-base font-semibold bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-glow"
              >
                Book Now <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-10 py-7 text-base font-semibold border-white/20 bg-white/5 text-foreground hover:bg-white/10 backdrop-blur">
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 text-sm text-foreground/70">
              <div className="flex items-center gap-2"><Star className="h-4 w-4 text-primary fill-primary" /> 4.9 average client rating</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Same-week appointments</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 123 Beauty Lane, Manila</div>
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

      {/* ============== SERVICES PREVIEW ============== */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Available Services</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Curated care, <span className="text-gradient">priced honestly</span>.
              </h2>
              <p className="mt-5 text-foreground/70 text-lg leading-relaxed">
                A focused menu across hair, nails and beauty — every service includes a quick consult so you walk out exactly how you wanted.
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="rounded-full self-start lg:self-end border-white/15 bg-white/5 hover:bg-white/10 text-foreground">
              <Link to="/services">View full menu <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {(Object.keys(CATEGORY_META) as Cat[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const items = services.filter((s) => s.category === cat).slice(0, 3);
              const Icon = meta.icon;
              return (
                <article
                  key={cat}
                  className="group relative rounded-3xl bg-gradient-surface border border-white/5 p-8 shadow-card hover-lift overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-glow opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary mb-5">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-1">{meta.label}</h3>
                    <p className="text-sm text-foreground/60 mb-6">{meta.blurb}</p>

                    <ul className="space-y-3 mb-7">
                      {items.length === 0 && (
                        <li className="text-sm text-foreground/50 italic">Menu coming soon.</li>
                      )}
                      {items.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-4 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">{s.name}</div>
                            <div className="text-[11px] text-foreground/55 uppercase tracking-wider">{s.duration_minutes} min</div>
                          </div>
                          <span className="text-primary font-semibold whitespace-nowrap">{peso(s.price)}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => openBooking(items[0]?.id)}
                      size="lg"
                      className="w-full rounded-full bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-glow"
                    >
                      Book {meta.label} <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== OUR TEAM (image right) ============== */}
      <section className="py-24 bg-surface-1">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Our Team</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Hands you can <span className="text-gradient">actually trust</span>.
              </h2>
              <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                Our stylists, nail artists and beauty experts each bring their own signature touch — chosen for their craft, kept for the way they treat every guest.
              </p>
              <ul className="space-y-3 mb-9">
                {["Hair stylists with 5+ years of color expertise", "Certified nail technicians, sanitized tools every visit", "Beauty artists trained in lashes, brows & makeup"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-foreground/80">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="rounded-full px-9 bg-gradient-primary text-primary-foreground shadow-glow">
                <Link to="/team">Meet the team <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-surface-2 shadow-elegant hover-lift">
                    <img src={PLACEHOLDER} alt="Stylist at work" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="aspect-square rounded-3xl overflow-hidden bg-surface-2 shadow-card hover-lift">
                    <img src={PLACEHOLDER} alt="Nail artist" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
                <div className="space-y-4 pt-10">
                  <div className="aspect-square rounded-3xl overflow-hidden bg-surface-2 shadow-card hover-lift">
                    <img src={PLACEHOLDER} alt="Beauty artist" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-surface-2 shadow-elegant hover-lift">
                    <img src={PLACEHOLDER} alt="Salon team" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 -inset-10 bg-gradient-glow opacity-40 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ============== OUR WORK (image left) ============== */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 row-span-2 aspect-square rounded-3xl overflow-hidden bg-surface-1 shadow-elegant hover-lift">
                  <img src={PLACEHOLDER} alt="Featured look" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-surface-1 shadow-card hover-lift">
                  <img src={PLACEHOLDER} alt="Recent work" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-surface-1 shadow-card hover-lift">
                  <img src={PLACEHOLDER} alt="Recent work" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="aspect-[3/2] col-span-3 rounded-3xl overflow-hidden bg-surface-1 shadow-elegant hover-lift">
                  <img src={PLACEHOLDER} alt="Featured portfolio" className="w-full h-full object-cover" loading="lazy" />
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
                Every cut, color, and set in our gallery comes from a Glammee chair — no stock photos, no filters, just the looks our clients walked out with.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-9">
                {[{ n: "1.2k+", l: "Looks created" }, { n: "98%", l: "Repeat clients" }, { n: "4.9★", l: "Avg rating" }].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-surface-1 border border-white/5 p-4 text-center">
                    <div className="font-display text-2xl font-bold text-foreground">{s.n}</div>
                    <div className="text-[10px] uppercase tracking-widest text-foreground/55 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="rounded-full px-9 bg-gradient-primary text-primary-foreground shadow-glow">
                <Link to="/work">Browse the gallery <ArrowRight className="h-4 w-4 ml-2" /></Link>
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
            From precision cuts to flawless gel manicures and lash applications, every Glammee visit is built around comfort, attention to detail, and pricing you can actually trust.
          </p>
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {[
              { t: "Transparent pricing", d: "No surprise add-ons — every PHP price is on the menu." },
              { t: "Sanitized tools", d: "Fresh, sanitized tools and clean stations every visit." },
              { t: "Real consultations", d: "Five honest minutes before scissors ever touch hair." },
            ].map((p) => (
              <div key={p.t} className="rounded-2xl bg-background border border-white/5 p-6 text-left hover-lift">
                <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1.5">{p.t}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-foreground">
            <Link to="/about">Discover our story <ArrowRight className="h-4 w-4 ml-2" /></Link>
          </Button>
        </div>
      </section>

      <BookingDialog open={open} onOpenChange={setOpen} defaultServiceId={defaultId} />
    </>
  );
}
