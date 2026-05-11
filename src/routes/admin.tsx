import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CalendarClock, Users, Scissors, LayoutDashboard, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Queue — Glammee" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type QueueRow = {
  id: string;
  preferred_at: string;
  status: "queued" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  queue_seq: number;
  created_at: string;
  clients: { full_name: string; contact_number: string; email: string | null } | null;
  services: { name: string; category: string } | null;
};

type ServiceRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  duration_minutes: number;
  active: boolean;
};

type ClientRow = {
  id: string;
  full_name: string;
  contact_number: string;
  email: string | null;
  created_at: string;
};

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  const load = async () => {
    setLoading(true);
    const since = new Date();
    since.setHours(0, 0, 0, 0);

    const [{ data: qData, error: qErr }, { data: sData }, { data: cData }, { count: completedCount }] = await Promise.all([
      supabase
      .from("appointments")
      .select("id, preferred_at, status, notes, queue_seq, created_at, clients(full_name, contact_number, email), services(name, category)")
      .in("status", ["queued", "in_progress"])
      .order("queue_seq", { ascending: true }),
      supabase.from("services").select("id, name, category, price, duration_minutes, active").order("category"),
      supabase.from("clients").select("id, full_name, contact_number, email, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "completed").gte("updated_at", since.toISOString()),
    ]);
    setLoading(false);
    if (qErr) toast.error(qErr.message);
    else setRows((qData as unknown as QueueRow[]) ?? []);
    setServices((sData as ServiceRow[]) ?? []);
    setClients((cData as ClientRow[]) ?? []);
    setCompletedToday(completedCount ?? 0);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) return toast.error(error.message);
      toast.success("Account created. An admin must grant you the 'admin' role.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return toast.error(error.message);
    }
  };

  const updateStatus = async (id: string, status: QueueRow["status"]) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status.replace("_", " ")}`);
    load();
  };

  const toggleService = async (id: string, active: boolean) => {
    const { error } = await supabase.from("services").update({ active }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(active ? "Service enabled" : "Service disabled");
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));
  };

  const updateServicePrice = async (id: string, price: number) => {
    const { error } = await supabase.from("services").update({ price }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Price updated");
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 max-w-md py-20">
        <h1 className="font-display text-3xl font-bold mb-2">Admin Access</h1>
        <p className="text-muted-foreground mb-6 text-sm">Sign in to manage the reservation queue.</p>
        <form onSubmit={handleAuth} className="space-y-4 bg-card text-card-foreground p-6 rounded-xl shadow-card">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full bg-gradient-primary text-primary-foreground" type="submit">
            {authMode === "signin" ? "Sign In" : "Create Account"}
          </Button>
          <button type="button" onClick={() => setAuthMode((m) => (m === "signin" ? "signup" : "signin"))} className="text-xs text-primary underline w-full">
            {authMode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </form>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto px-4 max-w-md py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-3">Not Authorized</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Your account is signed in but doesn't have admin privileges. To grant access, run this SQL in the
          backend SQL editor (replace with your user id):
        </p>
        <pre className="bg-card text-card-foreground text-left text-xs p-4 rounded-xl overflow-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${session.user.id}', 'admin');`}
        </pre>
        <Button variant="outline" onClick={() => supabase.auth.signOut()} className="mt-6">Sign out</Button>
      </div>
    );
  }

  if (isAdmin === null) return <div className="container mx-auto py-20 text-center">Loading…</div>;

  const head = rows[0];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage reservations, services, and clients across the salon.</p>
        </div>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="overview"><LayoutDashboard className="h-4 w-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="queue"><CalendarClock className="h-4 w-4 mr-2" />Queue ({rows.length})</TabsTrigger>
          <TabsTrigger value="services"><Scissors className="h-4 w-4 mr-2" />Services</TabsTrigger>
          <TabsTrigger value="clients"><Users className="h-4 w-4 mr-2" />Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="In Queue" value={rows.filter((r) => r.status === "queued").length} icon={<CalendarClock className="h-5 w-5" />} />
            <StatCard label="In Service" value={rows.filter((r) => r.status === "in_progress").length} icon={<Scissors className="h-5 w-5" />} />
            <StatCard label="Completed Today" value={completedToday} icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard label="Active Services" value={services.filter((s) => s.active).length} icon={<LayoutDashboard className="h-5 w-5" />} />
          </div>
          {head && (
            <section className="bg-gradient-primary text-primary-foreground rounded-2xl p-8 shadow-elegant">
              <p className="text-xs tracking-widest uppercase opacity-80 mb-2">Now Serving · Peek</p>
              <h2 className="font-display text-3xl font-bold mb-1">{head.clients?.full_name}</h2>
              <p className="opacity-90 mb-1">{head.services?.name} · {head.services?.category}</p>
              <p className="text-sm opacity-80">Preferred: {new Date(head.preferred_at).toLocaleString()}</p>
              <p className="text-sm opacity-80 mb-4">Contact: {head.clients?.contact_number}</p>
              <div className="flex gap-2 flex-wrap">
                {head.status === "queued" && (
                  <Button variant="secondary" onClick={() => updateStatus(head.id, "in_progress")}>Start Service</Button>
                )}
                <Button variant="secondary" onClick={() => updateStatus(head.id, "completed")}>Complete (Dequeue)</Button>
                <Button variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => updateStatus(head.id, "cancelled")}>Cancel</Button>
              </div>
            </section>
          )}
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          {head && (
        <section className="bg-gradient-primary text-primary-foreground rounded-2xl p-8 mb-8 shadow-elegant">
          <p className="text-xs tracking-widest uppercase opacity-80 mb-2">Now Serving · Peek</p>
          <h2 className="font-display text-3xl font-bold mb-1">{head.clients?.full_name}</h2>
          <p className="opacity-90 mb-1">{head.services?.name} · {head.services?.category}</p>
          <p className="text-sm opacity-80">Preferred: {new Date(head.preferred_at).toLocaleString()}</p>
          <p className="text-sm opacity-80 mb-4">Contact: {head.clients?.contact_number}</p>
          <div className="flex gap-2 flex-wrap">
            {head.status === "queued" && (
              <Button variant="secondary" onClick={() => updateStatus(head.id, "in_progress")}>Start Service</Button>
            )}
            <Button variant="secondary" onClick={() => updateStatus(head.id, "completed")}>Complete (Dequeue)</Button>
            <Button variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => updateStatus(head.id, "cancelled")}>Cancel</Button>
          </div>
        </section>
          )}
          <h3 className="font-display text-xl font-semibold">Full Queue ({rows.length})</h3>
          {loading ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">The queue is empty.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, idx) => (
            <div key={r.id} className="bg-card text-card-foreground rounded-xl p-5 shadow-card flex flex-wrap items-center gap-4">
              <div className="font-display text-2xl font-bold text-primary w-12 text-center">#{idx + 1}</div>
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold">{r.clients?.full_name}</div>
                <div className="text-sm opacity-80">{r.services?.name} · {r.services?.category}</div>
                <div className="text-xs opacity-70">Preferred: {new Date(r.preferred_at).toLocaleString()}</div>
              </div>
              <div className="text-sm">
                <div>{r.clients?.contact_number}</div>
                <div className="text-xs opacity-70">Status: {r.status}</div>
              </div>
              <div className="flex gap-2">
                {r.status === "queued" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "in_progress")}>Start</Button>
                )}
                <Button size="sm" onClick={() => updateStatus(r.id, "completed")} className="bg-gradient-primary text-primary-foreground">Done</Button>
              </div>
            </div>
          ))}
        </div>
      )}
        </TabsContent>

        <TabsContent value="services" className="space-y-3">
          <p className="text-sm text-muted-foreground">Toggle availability or update pricing. Inactive services are hidden from the booking form.</p>
          {services.length === 0 ? (
            <p className="text-muted-foreground">No services yet.</p>
          ) : (
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="bg-card text-card-foreground rounded-xl p-5 shadow-card flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs opacity-70 uppercase tracking-wider">{s.category} · {s.duration_minutes} min</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Price ₱</Label>
                    <Input
                      type="number"
                      defaultValue={s.price}
                      className="w-24 h-8"
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v) && v !== s.price) updateServicePrice(s.id, v);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={s.active} onCheckedChange={(v) => toggleService(s.id, v)} />
                    <span className="text-xs">{s.active ? "Active" : "Hidden"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-3">
          <p className="text-sm text-muted-foreground">Recent clients who've booked at Glammee.</p>
          {clients.length === 0 ? (
            <p className="text-muted-foreground">No clients yet.</p>
          ) : (
            <div className="space-y-2">
              {clients.map((c) => (
                <div key={c.id} className="bg-card text-card-foreground rounded-xl p-4 shadow-card flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold">{c.full_name}</div>
                    <div className="text-xs opacity-70">{c.email ?? "—"}</div>
                  </div>
                  <div className="text-sm">{c.contact_number}</div>
                  <div className="text-xs opacity-70">Joined {new Date(c.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-card text-card-foreground rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-2 text-primary">{icon}</div>
      <div className="text-3xl font-display font-bold">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}