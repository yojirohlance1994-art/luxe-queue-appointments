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
        Glammee is a neighborhood hair, nail & beauty salon dedicated to honest care and real results.
        Every visit is built around comfort, attention to detail, and small luxuries.
      </p>
      <p className="text-foreground/80 leading-relaxed">
        Our team of stylists and beauty experts brings years of experience and a passion for craft —
        from precision cuts to flawless gel manicures and lash applications.
      </p>
    </section>
  );
}