import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team — Glammee" },
      { name: "description", content: "Meet the stylists, nail artists, and beauty experts at Glammee." },
      { property: "og:title", content: "Our Team — Glammee" },
      { property: "og:description", content: "Meet the people behind every Glammee visit." },
    ],
  }),
  component: TeamPage,
});

type Staff = { id: string; full_name: string; role: string; seniority: string; bio: string | null; category: string; image_url: string | null };
const CATS = ["all", "hair", "nails", "beauty", "body"] as const;

function TeamPage() {
  const [list, setList] = useState<Staff[]>([]);
  const [filter, setFilter] = useState<(typeof CATS)[number]>("all");

  useEffect(() => {
    supabase.from("staff").select("id, full_name, role, seniority, bio, category, image_url").eq("active", true).order("sort_order").then(({ data }) => setList((data as Staff[]) ?? []));
  }, []);

  const visible = filter === "all" ? list : list.filter((s) => s.category === filter);

  return (
    <section className="container mx-auto px-4 lg:px-8 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">Our Team</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 text-gradient">The Glammee Crew</h1>
        <p className="text-muted-foreground leading-relaxed">A handpicked roster of stylists, nail artists, and beauty experts — each with their own craft and signature touch.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATS.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`px-5 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-smooth border ${filter === c ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-surface-1 border-white/10 text-foreground/70 hover:text-foreground"}`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((s) => (
          <article key={s.id} className="group relative rounded-2xl overflow-hidden bg-surface-1 hover-lift">
            <div className="aspect-[4/5] overflow-hidden bg-surface-2">
              {s.image_url ? <img src={s.image_url} alt={s.full_name} loading="lazy" className="w-full h-full object-cover transition-spring group-hover:scale-105" /> : <div className="w-full h-full" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/80 mb-1">{s.category} · {s.seniority}</div>
              <h3 className="font-display text-2xl font-bold text-white">{s.full_name}</h3>
              <p className="text-sm text-white/85 mb-2">{s.role}</p>
              {s.bio && <p className="text-xs text-white/70 leading-relaxed line-clamp-3 max-h-0 group-hover:max-h-24 transition-all duration-500 overflow-hidden">{s.bio}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
