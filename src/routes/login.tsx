import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || "owner@glammee.local";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Owner Sign In - Glammee" },
      { name: "description", content: "Owner sign in for the Glammee admin suite." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      toast.error("Only the configured owner account can access the admin suite.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user!.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");

    if (!isAdmin) {
      await supabase.auth.signOut();
      return toast.error("This account does not have admin access.");
    }

    toast.success("Welcome back, owner.");
    navigate({ to: "/admin" });
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-20">
      <h1 className="font-display text-4xl font-bold mb-2">Owner Sign In</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Customer accounts are not used. Admin access is limited to the configured owner account.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-card text-card-foreground p-6 rounded-xl shadow-card"
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> Admin Sign In
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
          {loading ? "Signing in..." : "Sign In as Owner"}
        </Button>
      </form>
    </div>
  );
}
