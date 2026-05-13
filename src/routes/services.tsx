import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/BookingDialog";
import { supabase } from "@/integrations/supabase/client";
// Hero: replace with hero-services.png in /public or src/assets
const PLACEHOLDER = "/placeholder.svg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Glammee Salon" },
      { name: "description", content: "Hair, nail, and beauty services at Glammee — explore packages and prices in PHP." },
      { property: "og:title", content: "Services — Glammee Salon" },
      { property: "og:description", content: "Explore our full menu of hair, nail, and beauty services with packages." },
    ],
  }),
  component: ServicesPage,
});

type Service = {
  id: string;
  name: string;
  category: "hair" | "nails" | "body";
  description: string | null;
  duration_minutes: number;
  price: number;
};
type Pkg = { id: string; service_id: string; name: string; description: string | null; price: number; duration_minutes: number };

const peso = (n: number) => `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

const categoryMeta = {
  hair: { title: "Hair Services", blurb: "Healthy, styled hair done with practical, reliable care." },
  nails: { title: "Nail Services", blurb: "Everyday manicures and detailed enhancements." },
  body: { title: "Beauty & Body", blurb: "Lashes, brows, and event-ready makeup." },
} as const;

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [open, setOpen] = useState(false);
  const [defaultId, setDefaultId] = useState<string>();

  useEffect(() => {
    supabase.from("services").select("id, name, category, description, duration_minutes, price").eq("active", true).order("category")
      .then(({ data }) => data && setServices(data as Service[]));
    supabase.from("service_packages").select("id, service_id, name, description, price, duration_minutes").eq("active", true).order("sort_order")
      .then(({ data }) => data && setPackages(data as Pkg[]));
  }, []);

  const openWith = (id?: string) => { setDefaultId(id); setOpen(true); };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-16">
      {/* Header */}
      <section className="grid md:grid-cols-2 gap-6 items-stretch mb-16">
        <div className="rounded-2xl overflow-hidden shadow-card bg-surface-1 aspect-[4/3]">
          {/* Services Hero Image: replace with services-hero.png */}
          <img src={PLACEHOLDER} alt="Services hero placeholder" className="w-full h-full object-cover" />
        </div>
        <div className="bg-card text-card-foreground rounded-2xl p-8 md:p-10 shadow-card flex flex-col justify-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 underline decoration-primary/40 underline-offset-8">We offer</h1>
          <p className="text-base md:text-lg leading-relaxed mb-6">
            Practical hair, nail, and beauty services focused on real results and honest care. All prices in Philippine Peso (₱).
          </p>
          <Button onClick={() => openWith()} className="self-start rounded-full bg-gradient-primary text-primary-foreground px-8">
            Book Now
          </Button>
        </div>
      </section>

      {/* Categories */}
      {(["hair", "nails", "body"] as const).map((cat) => {
        const meta = categoryMeta[cat];
        const items = services.filter((s) => s.category === cat);
        return (
          <section key={cat} className="mb-16">
            <div className="bg-popover rounded-2xl py-4 px-6 mb-8 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wide text-popover-foreground uppercase">
                {meta.title}
              </h2>
              <p className="text-sm text-popover-foreground/70 mt-1">{meta.blurb}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((s) => {
                const pkgs = packages.filter((p) => p.service_id === s.id);
                return (
                  <article key={s.id} className="bg-card/60 backdrop-blur border border-border rounded-xl p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant flex flex-col">
                    {/* Service thumbnail: replace with service-{id}.png */}
                    <div className="rounded-lg overflow-hidden bg-surface-1 aspect-video mb-4">
                      <img src={PLACEHOLDER} alt={`${s.name} placeholder`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-display text-lg font-semibold text-card-foreground">{s.name}</h4>
                      <span className="text-primary font-semibold">{peso(s.price)}</span>
                    </div>
                    <p className="text-sm text-card-foreground/80 mb-3">{s.description}</p>

                    {pkgs.length > 0 && (
                      <div className="border-t border-border/60 pt-3 mb-3 space-y-1.5">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Packages</div>
                        {pkgs.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-sm">
                            <span className="text-card-foreground/85">{p.name}</span>
                            <span className="text-primary font-semibold">{peso(p.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between text-xs text-card-foreground/60">
                      <span>{s.duration_minutes} min</span>
                      <button onClick={() => openWith(s.id)} className="text-primary font-semibold hover:underline">
                        Book →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <BookingDialog open={open} onOpenChange={setOpen} defaultServiceId={defaultId} />
    </div>
  );
}
