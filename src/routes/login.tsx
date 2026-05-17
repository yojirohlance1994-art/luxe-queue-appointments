import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, User } from "lucide-react";

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || "owner@glammee.local";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - Glammee" },
      { name: "description", content: "Client and owner login for Glammee." },
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
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "admin" && normalizedEmail !== OWNER_EMAIL.toLowerCase()) {
      toast.error("Only the configured owner account can access the admin suite.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
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

    toast.success(mode === "admin" ? "Welcome back, owner." : "Welcome back.");
    navigate({ to: mode === "admin" ? "/admin" : "/booking" });
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-20">
      <h1 className="font-display text-4xl font-bold mb-2">Welcome Back</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Clients can log in normally. Admin access is limited to the configured owner account.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMode("client")}
          className={`rounded-xl border-2 p-4 text-left transition-smooth ${
            mode === "client"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          }`}
        >
          <User
            className={`h-5 w-5 mb-2 ${mode === "client" ? "text-primary" : "text-muted-foreground"}`}
          />
          <div className="font-semibold text-sm">Client Login</div>
          <div className="text-xs text-muted-foreground mt-0.5">Book and review visits</div>
        </button>
        <button
          type="button"
          onClick={() => setMode("admin")}
          className={`rounded-xl border-2 p-4 text-left transition-smooth ${
            mode === "admin"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          }`}
        >
          <ShieldCheck
            className={`h-5 w-5 mb-2 ${mode === "admin" ? "text-primary" : "text-muted-foreground"}`}
          />
          <div className="font-semibold text-sm">Owner Login</div>
          <div className="text-xs text-muted-foreground mt-0.5">Manage salon operations</div>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-card text-card-foreground p-6 rounded-xl shadow-card"
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">
          {mode === "admin" ? "Owner Sign In" : "Client Sign In"}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          className="w-full bg-gradient-primary text-primary-foreground"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : mode === "admin" ? "Sign In as Owner" : "Login"}
        </Button>
      </form>
    </div>
  );
}
