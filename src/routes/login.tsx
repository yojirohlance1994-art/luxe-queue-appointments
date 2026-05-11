import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Glammee" },
      { name: "description", content: "Sign in to your Glammee account to manage bookings." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"client" | "admin">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user!.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");

    if (mode === "admin" && !isAdmin) {
      await supabase.auth.signOut();
      return toast.error("This account does not have admin access.");
    }
    toast.success(`Welcome back${isAdmin ? ", admin" : ""}!`);
    navigate({ to: mode === "admin" ? "/admin" : "/" });
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-20">
      <h1 className="font-display text-4xl font-bold mb-2">Welcome Back</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Choose how you want to sign in.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMode("client")}
          className={`rounded-xl border-2 p-4 text-left transition-smooth ${mode === "client" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
        >
          <User className={`h-5 w-5 mb-2 ${mode === "client" ? "text-primary" : "text-muted-foreground"}`} />
          <div className="font-semibold text-sm">Sign in as Client</div>
          <div className="text-xs text-muted-foreground mt-0.5">Book and manage your appointments</div>
        </button>
        <button
          type="button"
          onClick={() => setMode("admin")}
          className={`rounded-xl border-2 p-4 text-left transition-smooth ${mode === "admin" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
        >
          <ShieldCheck className={`h-5 w-5 mb-2 ${mode === "admin" ? "text-primary" : "text-muted-foreground"}`} />
          <div className="font-semibold text-sm">Sign in as Admin</div>
          <div className="text-xs text-muted-foreground mt-0.5">Manage the salon and staff queue</div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-card text-card-foreground p-6 rounded-xl shadow-card">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">
          {mode === "admin" ? "Admin Sign In" : "Client Sign In"}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button className="w-full bg-gradient-primary text-primary-foreground" type="submit" disabled={loading}>
          {loading ? "Signing in…" : mode === "admin" ? "Sign In as Admin" : "Sign In as Client"}
        </Button>
        <p className="text-xs text-center text-muted-foreground pt-2">
          New to Glammee?{" "}
          <Link to="/signup" className="text-primary underline font-medium">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}