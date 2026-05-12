import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Phone, Clock, FileText, MessageSquareQuote, CheckCircle2, Play, X, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/queue")({
  component: QueuePage,
});

type Row = {
  id: string;
  preferred_at: string;
  created_at: string;
  status: string;
  notes: string | null;
  concern: string | null;
  queue_seq: number;
  clients: { full_name: string; contact_number: string; email: string | null } | null;
  services: { name: string; category: string } | null;
};

const COLUMNS = [
  { key: "pending", label: "Pending", filter: ["pending", "queued"] },
  { key: "accepted", label: "Accepted", filter: ["accepted"] },
  { key: "in_service", label: "In Service", filter: ["in_service", "in_progress"] },
  { key: "completed", label: "Completed", filter: ["completed"] },
] as const;

function QueuePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("appointments")
      .select("id, preferred_at, created_at, status, notes, concern, queue_seq, clients(full_name, contact_number, email), services(name, category)")
      .or(`status.in.(pending,queued,accepted,in_service,in_progress),and(status.eq.completed,updated_at.gte.${since.toISOString()}),and(status.in.(cancelled,declined),updated_at.gte.${since.toISOString()})`)
      .order("queue_seq", { ascending: true });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data as unknown as Row[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status.replace("_", " ")}`);
    setSelected(null);
    load();
  };

  const grouped = (cols: readonly string[]) => rows.filter((r) => cols.includes(r.status));
  const cancelledRows = rows.filter((r) => r.status === "cancelled" || r.status === "declined");

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-float-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Queue</p>
          <h1 className="font-display text-4xl font-bold">Reservation Board</h1>
          <p className="text-muted-foreground mt-1">Move bookings through the workflow.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 bg-transparent">
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCancelled((v) => !v)} className="border-white/10 bg-transparent">
            {showCancelled ? "Hide" : "Show"} cancelled ({cancelledRows.length})
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = grouped(col.filter);
          return (
            <div key={col.key} className="bg-surface-1 border border-white/5 rounded-2xl p-3 min-h-[200px] flex flex-col">
              <div className="px-2 pt-1 pb-3 flex items-center justify-between">
                <h3 className="font-display text-sm uppercase tracking-widest text-foreground/80">{col.label}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-foreground/70">{items.length}</span>
              </div>
              <div className="space-y-2 flex-1">
                {items.length === 0 && <div className="text-xs text-muted-foreground text-center py-8">Empty</div>}
                {items.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="w-full text-left bg-card text-card-foreground rounded-xl p-4 shadow-card hover-lift transition-smooth group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-semibold text-sm text-card-foreground truncate">{r.clients?.full_name ?? "—"}</div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-smooth shrink-0" />
                    </div>
                    <div className="text-xs text-card-foreground/80 truncate">{r.services?.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {new Date(r.preferred_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-primary font-bold">#{r.queue_seq}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCancelled && (
        <Card className="bg-surface-1 border-white/5 text-foreground p-6">
          <h3 className="font-display text-lg mb-3">Cancelled / Declined Today</h3>
          {cancelledRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">None.</p>
          ) : (
            <div className="space-y-2">
              {cancelledRows.map((r) => (
                <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                  <div className="flex-1">
                    <div className="font-medium">{r.clients?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{r.services?.name} · {new Date(r.preferred_at).toLocaleString()}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="sm:max-w-lg bg-card text-card-foreground border-0 shadow-elegant p-0 overflow-hidden">
          {selected && (
            <>
              <div className="bg-gradient-primary text-primary-foreground p-6">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">{selected.clients?.full_name}</DialogTitle>
                </DialogHeader>
                <div className="mt-2 flex items-center gap-3 text-sm opacity-90">
                  <StatusBadge status={selected.status} className="bg-white/15 border-white/20 text-primary-foreground" />
                  <span className="text-xs">Queue #{selected.queue_seq}</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <DetailRow icon={Clock} label="Requested">
                  {new Date(selected.preferred_at).toLocaleString()}
                </DetailRow>
                <DetailRow icon={Phone} label="Contact">
                  {selected.clients?.contact_number}
                  {selected.clients?.email && <span className="block text-xs opacity-70">{selected.clients.email}</span>}
                </DetailRow>
                <DetailRow icon={FileText} label="Service">
                  {selected.services?.name} <span className="text-xs opacity-70">· {selected.services?.category}</span>
                </DetailRow>
                {selected.concern && (
                  <DetailRow icon={MessageSquareQuote} label="Concern">{selected.concern}</DetailRow>
                )}
                {selected.notes && (
                  <DetailRow icon={FileText} label="Notes">{selected.notes}</DetailRow>
                )}

                <div className="flex flex-wrap gap-2 pt-3 border-t border-border/40">
                  {(selected.status === "pending" || selected.status === "queued") && (
                    <>
                      <Button size="sm" onClick={() => update(selected.id, "accepted")} className="bg-gradient-primary text-primary-foreground">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => update(selected.id, "declined")}>
                        Decline
                      </Button>
                    </>
                  )}
                  {selected.status === "accepted" && (
                    <Button size="sm" onClick={() => update(selected.id, "in_service")} className="bg-gradient-primary text-primary-foreground">
                      <Play className="h-4 w-4 mr-1" /> Start service
                    </Button>
                  )}
                  {(selected.status === "in_service" || selected.status === "in_progress") && (
                    <Button size="sm" onClick={() => update(selected.id, "completed")} className="bg-gradient-primary text-primary-foreground">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Mark complete
                    </Button>
                  )}
                  {selected.status !== "completed" && selected.status !== "cancelled" && (
                    <Button size="sm" variant="outline" onClick={() => update(selected.id, "cancelled")}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="h-4 w-4 text-primary mt-1 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm text-card-foreground">{children}</div>
      </div>
    </div>
  );
}
