import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, ShieldCheck, IdCard, Upload, CheckCircle2 } from "lucide-react";

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
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [idName, setIdName] = useState<string | null>(null);
  const idVerified = typeof window !== "undefined" && localStorage.getItem("glammee_admin_id_verified") === "1";

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
    if (mode === "admin" && !idVerified && !idPreview) {
      return toast.error("Please upload a photo of your staff ID to continue.");
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

    if (mode === "admin" && !isAdmin) {
      await supabase.auth.signOut();
      return toast.error("This account does not have admin access.");
    }
    if (mode === "admin" && isAdmin) {
      localStorage.setItem("glammee_admin_id_verified", "1");
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
        {mode === "admin" && !idVerified && (
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <IdCard className="h-4 w-4 text-primary" /> Staff ID Photo
              <span className="text-[10px] font-normal text-muted-foreground ml-1">(mockup verification)</span>
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
                <span className="text-xs text-muted-foreground">JPG or PNG. Not stored — demo only.</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleIdUpload} />
              </label>
            )}
          </div>
        )}
        {mode === "admin" && idVerified && (
          <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/30 rounded-lg p-3">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Staff ID already verified on this device — email and password only.</span>
          </div>
        )}
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