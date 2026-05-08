import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Glammee" },
      { name: "description", content: "Create a Glammee account to book and track your appointments." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Please check your email to confirm.");
    navigate({ to: "/login" });
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-20">
      <h1 className="font-display text-4xl font-bold mb-2">Join Glammee</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Create a client account to book appointments faster and track your bookings.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 bg-card text-card-foreground p-6 rounded-xl shadow-card">
        <div>
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters.</p>
        </div>
        <Button className="w-full bg-gradient-primary text-primary-foreground" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </Button>
        <p className="text-xs text-center text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}