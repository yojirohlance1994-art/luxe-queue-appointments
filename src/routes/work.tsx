import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Our Work — Glammee" },
      { name: "description", content: "Browse a portfolio of hair, nails, beauty, and body work from the Glammee team." },
      { property: "og:title", content: "Our Work — Glammee" },
      { property: "og:description", content: "Real results from real clients at Glammee." },
    ],
  }),
  component: WorkPage,
});

type Item = { id: string; title: string; description: string | null; category: string; image_url: string };
const CATS = ["all", "hair", "nails", "beauty", "body"] as const;

function WorkPage() {
  const [list, setList] = useState<Item[]>([]);
  const [filter, setFilter] = useState<(typeof CATS)[number]>("all");
  const [lightbox, setLightbox] = useState<Item | null>(null);

  useEffect(() => {
    supabase.from("portfolio_items").select("id, title, description, category, image_url").eq("active", true).order("sort_order").then(({ data }) => setList((data as Item[]) ?? []));
  }, []);

  const visible = filter === "all" ? list : list.filter((i) => i.category === filter);

  return (
    <section className="container mx-auto px-4 lg:px-8 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">Our Work</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 text-gradient">Recent Looks</h1>
        <p className="text-muted-foreground leading-relaxed">A curated showcase of cuts, color, nails, lashes, makeup, and body care from the Glammee team.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATS.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`px-5 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-smooth border ${filter === c ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-surface-1 border-white/10 text-foreground/70 hover:text-foreground"}`}>{c}</button>
        ))}
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
        {visible.map((i, idx) => (
          <button key={i.id} onClick={() => setLightbox(i)} className="block w-full break-inside-avoid group relative rounded-2xl overflow-hidden bg-surface-1 hover-lift text-left">
            <img src={i.image_url} alt={i.title} loading="lazy" className={`w-full h-auto object-cover transition-spring group-hover:scale-[1.03] ${idx % 3 === 0 ? "aspect-[3/4]" : idx % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/80 mb-1">{i.category}</div>
              <h3 className="font-display text-lg font-semibold text-white">{i.title}</h3>
              {i.description && <p className="text-xs text-white/75 mt-1 line-clamp-2">{i.description}</p>}
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!lightbox} onOpenChange={(v) => !v && setLightbox(null)}>
        <DialogContent className="sm:max-w-3xl bg-card text-card-foreground border-0 shadow-elegant p-0 overflow-hidden">
          {lightbox && (
            <>
              <img src={lightbox.image_url} alt={lightbox.title} className="w-full max-h-[70vh] object-contain bg-black" />
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-[0.25em] text-primary mb-1">{lightbox.category}</div>
                <h3 className="font-display text-2xl font-bold mb-2">{lightbox.title}</h3>
                {lightbox.description && <p className="text-sm text-muted-foreground">{lightbox.description}</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
