import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, ImageIcon, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/records")({
  component: RecordsPage,
});

type Row = {
  id: string;
  preferred_at: string;
  status: string;
  notes: string | null;
  concern: string | null;
  clients: { id: string; full_name: string; contact_number: string } | null;
  services: { name: string; category: string } | null;
};

const TABS = ["hair", "nails", "beauty", "body"] as const;

function RecordsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [photos, setPhotos] = useState<{ id: string; url: string }[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("appointments")
      .select("id, preferred_at, status, notes, concern, clients(id, full_name, contact_number), services(name, category)")
      .order("preferred_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setRows((data as unknown as Row[]) ?? []));
  }, []);

  const showPhotos = async (id: string) => {
    const { data } = await supabase.from("appointment_photos").select("id, url").eq("appointment_id", id);
    setPhotos((data as { id: string; url: string }[]) ?? []);
  };

  const filtered = (cat: string) => rows.filter((r) => r.services?.category === cat && (!q || r.clients?.full_name.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-float-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Archive</p>
          <h1 className="font-display text-4xl font-bold">Appointment Records</h1>
          <p className="text-muted-foreground mt-1">Browse history by category.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customer…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </header>

      <Tabs defaultValue="hair">
        <TabsList className="bg-surface-1 border border-white/5">
          {TABS.map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <Card className="bg-surface-1 border-white/5 text-foreground p-0 overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_1fr_120px_120px_auto] gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/5">
                <div>ID</div><div>Customer</div><div>Service</div><div>Date</div><div>Status</div><div></div>
              </div>
              <div className="divide-y divide-white/5">
                {filtered(t).length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No records.</div>}
                {filtered(t).map((r) => {
                  const isOpen = expanded === r.id;
                  return (
                    <div key={r.id}>
                      <button onClick={() => setExpanded(isOpen ? null : r.id)} className="w-full grid grid-cols-[60px_1fr_1fr_120px_120px_auto] gap-3 px-5 py-3 items-center text-left hover:bg-white/[0.02] transition-smooth text-sm">
                        <div className="text-xs text-primary font-mono">#{(r.clients?.id ?? "—").slice(0, 6)}</div>
                        <div className="font-medium truncate">{r.clients?.full_name}</div>
                        <div className="text-foreground/80 truncate">{r.services?.name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(r.preferred_at).toLocaleDateString()}</div>
                        <div><StatusBadge status={r.status} /></div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 bg-black/10 grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Concern</div>
                            <div>{r.concern || "—"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Notes</div>
                            <div>{r.notes || "—"}</div>
                          </div>
                          <div className="sm:col-span-2">
                            <Button size="sm" variant="outline" className="border-white/10 bg-transparent text-foreground hover:bg-white/5 hover:text-foreground" onClick={() => showPhotos(r.id)}>
                              <ImageIcon className="h-3.5 w-3.5 mr-1" /> View proof / result photos
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={photos !== null} onOpenChange={(v) => !v && setPhotos(null)}>
        <DialogContent className="sm:max-w-3xl bg-card text-card-foreground border-0 shadow-elegant">
          <DialogHeader><DialogTitle className="font-display">Proof / Result Photos</DialogTitle></DialogHeader>
          {photos && photos.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No photos uploaded yet.</p>}
          {photos && photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((p) => <img key={p.id} src={p.url} alt="" className="rounded-lg w-full aspect-square object-cover" />)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
