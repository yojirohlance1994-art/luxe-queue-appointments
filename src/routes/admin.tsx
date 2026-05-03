import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

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

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    const { data, error } = await supabase
      .from("appointments")
      .select("id, preferred_at, status, notes, queue_seq, created_at, clients(full_name, contact_number, email), services(name, category)")
      .in("status", ["queued", "in_progress"])
      .order("queue_seq", { ascending: true });
    setLoading(false);
    if (error) toast.error(error.message);
    else setRows((data as unknown as QueueRow[]) ?? []);
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
          <h1 className="font-display text-4xl font-bold">Reservation Queue</h1>
          <p className="text-muted-foreground text-sm mt-1">FIFO — head is served first, new bookings join the tail.</p>
        </div>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>

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

      <h3 className="font-display text-xl font-semibold mb-4">Queue ({rows.length})</h3>
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
    </div>
  );
}