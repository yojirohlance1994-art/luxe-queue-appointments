import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListOrdered, Clock, CheckCircle2, Users, Sparkles, ArrowRight, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

type Stat = { pending: number; accepted: number; in_service: number; completed_today: number; staff: number };

type RecentRow = {
  id: string;
  preferred_at: string;
  status: string;
  clients: { full_name: string } | null;
  services: { name: string; category: string } | null;
};

const formatWhen = (value: string) =>
  new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  });

function Overview() {
  const [stats, setStats] = useState<Stat>({ pending: 0, accepted: 0, in_service: 0, completed_today: 0, staff: 0 });
  const [recent, setRecent] = useState<RecentRow[]>([]);

  useEffect(() => {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    (async () => {
      const [pending, accepted, inService, completed, staff, recentData] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true }).in("status", ["pending", "queued"]),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "accepted"),
        supabase.from("appointments").select("id", { count: "exact", head: true }).in("status", ["in_service", "in_progress"]),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "completed").gte("updated_at", since.toISOString()),
        supabase.from("staff").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("appointments").select("id, preferred_at, status, clients(full_name), services(name, category)").order("created_at", { ascending: false }).limit(6),
      ]);
      setStats({
        pending: pending.count ?? 0,
        accepted: accepted.count ?? 0,
        in_service: inService.count ?? 0,
        completed_today: completed.count ?? 0,
        staff: staff.count ?? 0,
      });
      setRecent((recentData.data as unknown as RecentRow[]) ?? []);
    })();
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-float-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Dashboard</p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold">Overview</h1>
          <p className="text-foreground/70 mt-1">Snapshot of the salon today.</p>
        </div>
        <Link to="/admin/queue">
          <Button className="bg-gradient-primary text-primary-foreground shadow-glow rounded-full px-6">
            Go to queue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Pending" value={stats.pending} icon={Clock} accent="from-amber-500/20 to-amber-500/5" />
        <StatTile label="Accepted" value={stats.accepted} icon={ListOrdered} accent="from-sky-500/20 to-sky-500/5" />
        <StatTile label="In Service" value={stats.in_service} icon={Sparkles} accent="from-primary/30 to-primary/5" />
        <StatTile label="Completed Today" value={stats.completed_today} icon={CheckCircle2} accent="from-emerald-500/20 to-emerald-500/5" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-surface-1 border-white/5 text-foreground p-0 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold">Recent Bookings</h3>
              <p className="text-xs text-muted-foreground">Latest reservations across all categories.</p>
            </div>
            <Link to="/admin/queue" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-white/5">
            {recent.length === 0 && <div className="p-6 text-sm text-muted-foreground">No bookings yet.</div>}
            {recent.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-smooth">
                <div className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-display text-sm shrink-0">
                  {(r.clients?.full_name ?? "?").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">{r.clients?.full_name ?? "Unknown"}</div>
                  <div className="text-xs text-foreground/70 truncate">
                    {r.services?.name ?? "—"} · {new Date(r.preferred_at).toLocaleString()}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-primary text-primary-foreground border-0 p-6 relative overflow-hidden shadow-glow">
          <Sparkles className="absolute -right-4 -top-4 h-32 w-32 opacity-10" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.25em] opacity-80">Active team</p>
            <div className="font-display text-6xl font-bold mt-2">{stats.staff}</div>
            <p className="text-sm opacity-85 mt-2">Stylists, artists & therapists currently on the roster.</p>
            <div className="mt-6 flex items-center gap-2 text-sm opacity-90">
              <TrendingUp className="h-4 w-4" /> Roster healthy
            </div>
            <Link to="/admin/staff" className="mt-6 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
              Manage team <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatTile({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) {
  return (
    <Card className={`relative overflow-hidden border-white/5 bg-surface-1 text-foreground p-5 hover-lift`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} pointer-events-none`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="font-display text-4xl font-bold">{value}</div>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status === "queued" ? "pending" : status === "in_progress" ? "in_service" : status;
  const map: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    accepted: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    in_service: "bg-primary/20 text-primary-foreground border-primary/40",
    completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    cancelled: "bg-destructive/15 text-destructive-foreground border-destructive/30",
    declined: "bg-destructive/15 text-destructive-foreground border-destructive/30",
  };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${map[s] ?? "bg-white/5 border-white/10"}`}>{s.replace("_", " ")}</span>;
}
