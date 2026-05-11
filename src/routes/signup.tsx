import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, ShieldCheck, IdCard, Upload, CheckCircle2 } from "lucide-react";

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
  const [mode, setMode] = useState<"client" | "admin">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [idName, setIdName] = useState<string | null>(null);

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload an image file (JPG or PNG).");
    }
    const reader = new FileReader();
    reader.onload = () => {
      setIdPreview(reader.result as string);
      setIdName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "admin" && !idPreview) {
      return toast.error("Please upload a photo of your staff ID to create an admin account.");
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (mode === "admin") {
      toast.success("Admin account submitted! Staff ID is under review. Confirm your email to continue.");
    } else {
      toast.success("Account created! Please check your email to confirm.");
    }
    navigate({ to: "/login" });
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-20">
      <h1 className="font-display text-4xl font-bold mb-2">Join Glammee</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Create your account — choose client to book appointments or admin to manage the salon.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMode("client")}
          className={`rounded-xl border-2 p-4 text-left transition-smooth ${mode === "client" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
        >
          <User className={`h-5 w-5 mb-2 ${mode === "client" ? "text-primary" : "text-muted-foreground"}`} />
          <div className="font-semibold text-sm">Client Account</div>
          <div className="text-xs text-muted-foreground mt-0.5">Book and track appointments</div>
        </button>
        <button
          type="button"
          onClick={() => setMode("admin")}
          className={`rounded-xl border-2 p-4 text-left transition-smooth ${mode === "admin" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
        >
          <ShieldCheck className={`h-5 w-5 mb-2 ${mode === "admin" ? "text-primary" : "text-muted-foreground"}`} />
          <div className="font-semibold text-sm">Admin Account</div>
          <div className="text-xs text-muted-foreground mt-0.5">Manage salon and staff queue</div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-card text-card-foreground p-6 rounded-xl shadow-card">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">
          {mode === "admin" ? "Admin Sign Up" : "Client Sign Up"}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters.</p>
        </div>
        {mode === "admin" && (
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <IdCard className="h-4 w-4 text-primary" /> Staff ID Photo
            </Label>
            {idPreview ? (
              <div className="relative rounded-lg border-2 border-primary/40 bg-primary/5 p-3 flex items-center gap-3">
                <img src={idPreview} alt="Staff ID preview" className="h-16 w-24 object-cover rounded-md border border-border" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" /> ID uploaded
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{idName}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIdPreview(null); setIdName(null); }}
                  className="text-xs text-primary underline shrink-0"
                >
                  Replace
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/5 transition-smooth p-5 cursor-pointer text-center">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Upload staff ID photo</span>
                <span className="text-xs text-muted-foreground">JPG or PNG. Required for admin accounts.</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleIdUpload} />
              </label>
            )}
          </div>
        )}
        <Button className="w-full bg-gradient-primary text-primary-foreground" type="submit" disabled={loading}>
          {loading ? "Creating account…" : mode === "admin" ? "Create Admin Account" : "Create Client Account"}
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