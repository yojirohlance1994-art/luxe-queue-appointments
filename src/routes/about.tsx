import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Glammee Salon" },
      { name: "description", content: "Learn about Glammee, a neighborhood hair, nail and beauty salon." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-20 max-w-3xl">
      <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Our Story</p>
      <h1 className="font-display text-5xl font-bold mb-6 text-gradient">About Glammee</h1>
      <p className="text-foreground/90 leading-relaxed mb-4">
        Glammee was born from a simple idea: beauty should feel personal, never rushed.
        Tucked into the heart of the neighborhood, our salon is a calm, light-filled space
        designed to slow you down — somewhere you can step away from the noise of the day
        and be genuinely cared for.
      </p>
      <p className="text-foreground/80 leading-relaxed mb-4">
        From the moment you walk in, we want you to feel at home. A warm hello, your favorite
        drink in hand, soft music in the background, and a stylist who actually listens. Whether
        you're here for a fresh cut, a glossy gel set, fluttery lashes, or a full event-ready
        look, every service is built around what suits <em>you</em> — your hair, your features,
        your lifestyle.
      </p>
      <p className="text-foreground/80 leading-relaxed mb-4">
        Our team of stylists, nail artists, and beauty experts bring years of training and a
        real love for the craft. We invest in education, premium products, and gentle techniques
        because honest care and real results matter more than trends. No pressure, no upselling
        — just thoughtful work and small luxuries that make a big difference.
      </p>
      <p className="text-foreground/80 leading-relaxed">
        Come as you are. Leave feeling unmistakably you, only fresher. We can't wait to meet you.
      </p>
    </section>
  );
}