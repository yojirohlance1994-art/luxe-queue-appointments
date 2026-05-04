import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/BookingDialog";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";
import hero5 from "@/assets/hero-5.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glammee — Hair, Nail & Beauty Salon" },
      {
        name: "description",
        content:
          "Glammee is a neighborhood hair, nail, and beauty salon offering precision haircuts, manicures, lashes, and more. Book your visit today.",
      },
      { property: "og:title", content: "Glammee — Hair, Nail & Beauty Salon" },
      { property: "og:description", content: "Honest care, real results. Book your appointment at Glammee." },
    ],
  }),
  component: Index,
});

const heroImages = [
  { src: hero1, alt: "Curly hair model editorial", offset: "translate-y-4" },
  { src: hero2, alt: "Two models in autumn outfits", offset: "-translate-y-2" },
  { src: hero3, alt: "Yellow knit fashion", offset: "translate-y-6" },
  { src: hero4, alt: "Black and white portrait", offset: "-translate-y-4" },
  { src: hero5, alt: "Color block knitwear", offset: "translate-y-2" },
];

function Index() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 pt-12 pb-20">
          <div className="text-center mb-10">
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-gradient">Welcome to Glammee</span>
            </h1>
          </div>

          {/* Carousel-style fanned image gallery */}
          <div className="relative h-[520px] md:h-[720px] flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center gap-3 md:gap-6">
              {heroImages.map((img, i) => {
                const center = i === 2;
                return (
                  <div
                    key={i}
                    className={`relative rounded-2xl overflow-hidden shadow-elegant transition-smooth hover:scale-105 hover:-translate-y-3 ${img.offset} ${
                      center
                        ? "w-56 md:w-96 h-96 md:h-[640px] z-20"
                        : i === 1 || i === 3
                          ? "w-44 md:w-72 h-72 md:h-[520px] z-10"
                          : "w-32 md:w-56 h-56 md:h-[420px]"
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      loading={i === 2 ? "eager" : "lazy"}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg" className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90">
              <Link to="/services">Available Services</Link>
            </Button>
            <Button size="lg" onClick={() => setOpen(true)} className="rounded-full px-8 bg-gradient-primary text-primary-foreground hover:opacity-90">
              Book Now
            </Button>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="container mx-auto px-4 lg:px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm tracking-[0.25em] uppercase text-primary-foreground/80 mb-4">Our Promise</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6 text-foreground">
            Honest care.<br />Real results.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            From precision cuts to flawless gel manicures and lash applications, every Glammee visit is built around
            comfort, attention to detail, and small luxuries that make you feel taken care of.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/about">Discover Our Story →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[hero3, hero1, hero5, hero4].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              loading="lazy"
              className="rounded-xl object-cover w-full h-48 md:h-56 shadow-card transition-smooth hover:scale-[1.02]"
            />
          ))}
        </div>
      </section>

      <BookingDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
