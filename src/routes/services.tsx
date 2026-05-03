import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/BookingDialog";
import { supabase } from "@/integrations/supabase/client";
import salonInterior from "@/assets/salon-interior.jpg";
import serviceHair from "@/assets/service-hair.jpg";
import serviceNails from "@/assets/service-nails.jpg";
import serviceBody from "@/assets/service-body.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Glammee Salon" },
      { name: "description", content: "Hair, nail, and beauty services at Glammee — precision haircuts, gel manicures, lash extensions, and more." },
      { property: "og:title", content: "Services — Glammee Salon" },
      { property: "og:description", content: "Explore our full menu of hair, nail, and beauty services." },
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

const categoryMeta = {
  hair: { title: "Hair Services", image: serviceHair, blurb: "Practical, reliable hair services to keep your hair healthy, styled, and easy to manage." },
  nails: { title: "Nail Services", image: serviceNails, blurb: "Everyday nail care from simple manicures to detailed enhancements done with attention and care." },
  body: { title: "Beauty & Body", image: serviceBody, blurb: "Lashes, brows, and event-ready makeup — done with patience, honesty, and genuine care." },
} as const;

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [defaultId, setDefaultId] = useState<string>();

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, category, description, duration_minutes, price")
      .eq("active", true)
      .order("category")
      .then(({ data }) => data && setServices(data as Service[]));
  }, []);

  const openWith = (id?: string) => {
    setDefaultId(id);
    setOpen(true);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-16">
      {/* Header card */}
      <section className="grid md:grid-cols-2 gap-6 items-stretch mb-16">
        <div className="rounded-2xl overflow-hidden shadow-card">
          <img src={salonInterior} alt="Glammee salon interior" className="w-full h-full object-cover" loading="eager" width={1024} height={768} />
        </div>
        <div className="bg-card text-card-foreground rounded-2xl p-8 md:p-10 shadow-card flex flex-col justify-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 underline decoration-primary/40 underline-offset-8">
            We offer
          </h1>
          <p className="text-base md:text-lg leading-relaxed mb-6">
            Bringing together practical hair, nail, and beauty services that focus on real results
            and honest care. Every visit is easy, comfortable, and enjoyable — so you leave fresh,
            confident, and well taken care of.
          </p>
          <Button onClick={() => openWith()} className="self-start rounded-full bg-gradient-primary text-primary-foreground px-8">
            Book Now
          </Button>
        </div>
      </section>

      {/* Category sections */}
      {(["hair", "nails", "body"] as const).map((cat) => {
        const meta = categoryMeta[cat];
        const items = services.filter((s) => s.category === cat);
        return (
          <section key={cat} className="mb-16">
            <div className="bg-popover rounded-2xl py-4 px-6 mb-8 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wide text-popover-foreground uppercase">
                {meta.title}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-stretch mb-8">
              <div className="bg-card text-card-foreground rounded-2xl p-8 shadow-card flex flex-col justify-center order-2 md:order-1">
                <h3 className="font-display text-3xl font-bold mb-3 underline decoration-primary/40 underline-offset-8">We offer</h3>
                <p className="leading-relaxed mb-5">{meta.blurb}</p>
                <Button onClick={() => openWith()} className="self-start rounded-full bg-gradient-primary text-primary-foreground px-8">
                  Book Now
                </Button>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-card order-1 md:order-2">
                <img src={meta.image} alt={meta.title} className="w-full h-full object-cover" loading="lazy" width={1024} height={768} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((s) => (
                <article key={s.id} className="bg-card/60 backdrop-blur border border-border rounded-xl p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-display text-lg font-semibold text-card-foreground">{s.name}</h4>
                    <span className="text-primary font-semibold">${Number(s.price).toFixed(0)}</span>
                  </div>
                  <p className="text-sm text-card-foreground/80 mb-4">{s.description}</p>
                  <div className="flex items-center justify-between text-xs text-card-foreground/60">
                    <span>{s.duration_minutes} min</span>
                    <button onClick={() => openWith(s.id)} className="text-primary font-semibold hover:underline">
                      Book →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <BookingDialog open={open} onOpenChange={setOpen} defaultServiceId={defaultId} />
    </div>
  );
}