import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);

    // Check role to route appropriately
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user!.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    toast.success(`Welcome back${isAdmin ? ", admin" : ""}!`);
    navigate({ to: isAdmin ? "/admin" : "/" });
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-20">
      <h1 className="font-display text-4xl font-bold mb-2">Welcome Back</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Sign in to book appointments or manage the salon queue.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 bg-card text-card-foreground p-6 rounded-xl shadow-card">
        <div>
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button className="w-full bg-gradient-primary text-primary-foreground" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
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