import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SERVICES_IMAGE_DIR = "/Services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services - Glammee Salon" },
      {
        name: "description",
        content: "Hair, nail, and beauty services at Glammee with live booking prices.",
      },
    ],
  }),
  component: ServicesPage,
});

type Category = "hair" | "nails" | "body" | "beauty" | "lashes" | "waxing";

type Service = {
  id: string;
  name: string;
  category: Category;
  description: string | null;
  duration_minutes: number;
  price: number;
  price_note: string | null;
};

type Pkg = {
  id: string;
  service_id: string;
  service_ids?: string[];
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
};

const peso = (n: number) => `PHP ${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

const categoryMeta: Record<Category, { title: string; blurb: string; limit: number }> = {
  hair: {
    title: "Hair Services",
    blurb: "Highlighted cuts, color, smoothing, and treatment services from the booking menu.",
    limit: 6,
  },
  nails: {
    title: "Nail Services",
    blurb: "Core manicure, pedicure, gel, and foot spa options for everyday care.",
    limit: 6,
  },
  lashes: {
    title: "Lashes & Brows",
    blurb: "Focused lash and brow services with clear price and timing.",
    limit: 4,
  },
  waxing: {
    title: "Waxing Treatment",
    blurb: "Popular waxing services shown as a compact salon menu.",
    limit: 6,
  },
  body: {
    title: "Body & Massage",
    blurb: "Massage highlights for quick recovery and relaxation.",
    limit: 4,
  },
  beauty: {
    title: "Beauty Services",
    blurb: "Finishing services for events and polished occasions.",
    limit: 4,
  },
};

const categoryOrder: Category[] = ["hair", "nails", "lashes", "waxing", "body", "beauty"];

const imageFileByServiceName: Record<string, string> = {
  "Brazilian Blowout": "brazilian-blowout.png",
  "Classic Mani": "classic-manicure.png",
  "Classic Mani/Pedi": "mani-pedi.png",
  "Classic Manicure": "classic-manicure.png",
  "Color + Highlight + Brazilian": "colorhighlightbrazilian.png",
  "Color Rebond": "color-rebond.png",
  "Eye Brow Tint": "eyebrow-tint.png",
  "Eye Lash Tint": "eye-lash-tint.png",
  "Gel Mani": "gel-polish-manicure.png",
  "Gel Mani + Gel Pedi": "mani-pedi.png",
  "Gel Manicure": "gel-polish-manicure.png",
  "Gel Polish Manicure": "gel-polish-manicure.png",
  "Human Hair Mascara": "human-hair-mascara.png",
  "Keratin Lash Lift": "Keratin-lashlift.png",
  "Luxury Footspa + Pedi": "Luxury-footspa-pedi.png",
  "Luxury Footspa + Pedi + Mani": "Luxury-footspa-pedi.png",
  "Men & Women Hair Cut": "precision-haircut.png",
  "Men Hair Rebonding": "men-hair-rebonding.png",
  "Nail Art Design": "nail-art-design.png",
  "Pamper Footspa + Classic Pedi": "pamper-footspa-pedi.png",
  "Pamper Footspa + Classic Mani/Pedi": "mani-pedi.png",
  "Pamper Footspa + Classic Pedi + Gel Mani": "pamper-footspa-pedi.png",
  "Pamper Footspa + Gel Mani/Pedi": "mani-pedi.png",
  "Pamper Footspa + Gel Pedi": "pamper-footspa-pedi.png",
  "Precision Haircut": "precision-haircut.png",
  "Women Hair Rebonding": "women-hair-rebonding.png",
};

const infoOnlyCategories = new Set<Category>(["body", "waxing"]);

const displayCategory = (service: Service): Category => {
  if (service.name === "Makeup Application") return "beauty";
  if (["Brow Lamination & Tint", "Lash Extensions"].includes(service.name)) return "lashes";
  return service.category;
};

const serviceImage = (service: Service) => {
  const fileName = imageFileByServiceName[service.name];
  return fileName ? `${SERVICES_IMAGE_DIR}/${fileName}` : null;
};

const packagePrice = (pkg: Pkg, services: Service[]) => {
  const serviceIds = pkg.service_ids?.length ? pkg.service_ids : [pkg.service_id];
  const included = serviceIds
    .map((id) => services.find((service) => service.id === id))
    .filter(Boolean) as Service[];
  const subtotal = included.reduce((sum, service) => sum + Number(service.price || 0), 0);
  const discount = included.length >= 3 ? 0.15 : included.length === 2 ? 0.1 : 0;
  return subtotal > 0 ? Math.round(subtotal * (1 - discount)) : Number(pkg.price || 0);
};

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Pkg[]>([]);

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, category, description, duration_minutes, price, price_note")
      .eq("active", true)
      .order("category")
      .then(({ data }) => data && setServices(data as Service[]));

    Promise.all([
      supabase
        .from("service_packages")
        .select("id, service_id, name, description, price, duration_minutes")
        .eq("active", true)
        .order("sort_order"),
      supabase.from("service_package_items").select("package_id, service_id").order("sort_order"),
    ]).then(([packageRes, itemRes]) => {
      const itemsByPackage = (
        (itemRes.data as { package_id: string; service_id: string }[]) ?? []
      ).reduce((map, item) => {
        const ids = map.get(item.package_id) ?? [];
        ids.push(item.service_id);
        map.set(item.package_id, ids);
        return map;
      }, new Map<string, string[]>());

      if (packageRes.data) {
        setPackages(
          (packageRes.data as Pkg[])
            .map((pkg) => ({
              ...pkg,
              service_ids: itemsByPackage.get(pkg.id) ?? [pkg.service_id],
            }))
            .filter((pkg) => (pkg.service_ids?.length ?? 0) > 1),
        );
      }
    });
  }, []);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-16">
      <section className="grid md:grid-cols-2 gap-6 items-stretch mb-16">
        <div className="rounded-2xl overflow-hidden shadow-card bg-surface-1 aspect-[4/3]">
          <img
            src={`${SERVICES_IMAGE_DIR}/services-banner.jpg`}
            alt="Salon services"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="bg-card text-card-foreground rounded-2xl p-8 md:p-10 shadow-card flex flex-col justify-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 underline decoration-primary/40 underline-offset-8">
            We offer
          </h1>
          <p className="text-base md:text-lg leading-relaxed mb-6">
            A curated view of the live booking menu. This page stays lighter than the booking screen
            while keeping the same prices, service names, and estimated times.
          </p>
          <Link
            to="/booking"
            search={{ category: undefined }}
            className="inline-flex items-center justify-center rounded-full bg-gradient-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
          >
            Book Now
          </Link>
        </div>
      </section>

      {categoryOrder.map((cat) => {
        const meta = categoryMeta[cat];
        const items = services
          .filter((service) => displayCategory(service) === cat)
          .sort((a, b) => {
            const aHasImage = serviceImage(a) ? 1 : 0;
            const bHasImage = serviceImage(b) ? 1 : 0;
            return bHasImage - aHasImage || a.name.localeCompare(b.name);
          })
          .slice(0, meta.limit);
        if (items.length === 0) return null;

        return (
          <section key={cat} className="mb-16">
            <div className="bg-popover rounded-2xl py-4 px-6 mb-8 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wide text-popover-foreground uppercase">
                {meta.title}
              </h2>
              <p className="text-sm text-popover-foreground/70 mt-1">{meta.blurb}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((service) => {
                const relatedPackages = packages
                  .filter((pkg) =>
                    (pkg.service_ids?.length ? pkg.service_ids : [pkg.service_id]).includes(
                      service.id,
                    ),
                  )
                  .filter((pkg) => (pkg.service_ids?.length ? pkg.service_ids.length : 1) > 1)
                  .slice(0, 2);

                const image = serviceImage(service);
                const showImage = !infoOnlyCategories.has(cat) && image;

                return (
                  <article
                    key={service.id}
                    className="bg-card/60 backdrop-blur border border-border rounded-xl p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant flex flex-col"
                  >
                    {showImage && (
                      <div className="rounded-lg overflow-hidden bg-surface-1 aspect-video mb-4">
                        <img
                          src={image}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-display text-lg font-semibold text-card-foreground">
                        {service.name}
                      </h4>
                      <span className="text-primary font-semibold whitespace-nowrap">
                        {service.price_note || peso(service.price)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-card-foreground/80 mb-4">
                      {service.description ||
                        "A focused salon service with consultation, clean preparation, and a practical finish."}
                    </p>

                    {relatedPackages.length > 0 && (
                      <div className="border-t border-border/60 pt-3 mb-3 space-y-1.5">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Featured in bundles
                        </div>
                        {relatedPackages.map((pkg) => (
                          <div key={pkg.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-card-foreground/85">{pkg.name}</span>
                            <span className="text-primary font-semibold whitespace-nowrap">
                              {peso(packagePrice(pkg, services))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-xs uppercase tracking-widest text-card-foreground/60">
                      <span>{service.duration_minutes} min</span>
                      <span>{service.price_note || peso(service.price)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
