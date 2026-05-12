import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, ImagePlus, User } from "lucide-react";

export const Route = createFileRoute("/admin/staff")({
  component: StaffPage,
});

type Staff = {
  id: string;
  full_name: string;
  role: string;
  seniority: string;
  bio: string | null;
  category: "hair" | "nails" | "beauty" | "body";
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

const CATS: Staff["category"][] = ["hair", "nails", "beauty", "body"];
const SENIORITY = ["Junior", "Mid-Level", "Senior", "Master"];

const empty: Partial<Staff> = { full_name: "", role: "Stylist", seniority: "Junior", bio: "", category: "hair", image_url: "", active: true };

function StaffPage() {
  const [list, setList] = useState<Staff[]>([]);
  const [editing, setEditing] = useState<Partial<Staff> | null>(null);
  const [filter, setFilter] = useState<"all" | Staff["category"]>("all");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("staff").select("*").order("sort_order");
    if (error) return toast.error(error.message);
    setList((data as Staff[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing?.full_name) return toast.error("Name is required");
    const payload = {
      full_name: editing.full_name,
      role: editing.role || "Stylist",
      seniority: editing.seniority || "Junior",
      bio: editing.bio || null,
      category: editing.category || "hair",
      image_url: editing.image_url || null,
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("staff").update(payload).eq("id", editing.id)
      : await supabase.from("staff").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Staff updated" : "Staff added");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("staff-photos").upload(path, file, { upsert: false });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("staff-photos").getPublicUrl(path);
    setEditing((e) => ({ ...e, image_url: data.publicUrl }));
    setUploading(false);
  };

  const visible = filter === "all" ? list : list.filter((s) => s.category === filter);

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-float-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Team</p>
          <h1 className="font-display text-4xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Add, edit, and curate the salon roster.</p>
        </div>
        <Button onClick={() => setEditing(empty)} className="bg-gradient-primary text-primary-foreground rounded-full shadow-glow">
          <Plus className="h-4 w-4 mr-1" /> Add staff
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", ...CATS] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-smooth border ${filter === c ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-surface-1 border-white/10 text-foreground/70 hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {visible.map((s) => (
          <Card key={s.id} className="group bg-surface-1 border-white/5 text-foreground p-0 overflow-hidden hover-lift relative">
            <div className="aspect-[4/5] relative overflow-hidden bg-surface-2">
              {s.image_url ? (
                <img src={s.image_url} alt={s.full_name} className="w-full h-full object-cover transition-spring group-hover:scale-105" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><User className="h-16 w-16" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] uppercase tracking-widest text-primary-foreground/80">{s.category} · {s.seniority}</div>
                <div className="font-display text-lg font-semibold text-white">{s.full_name}</div>
                <div className="text-xs text-white/80">{s.role}</div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {s.bio && <p className="text-xs text-muted-foreground line-clamp-2">{s.bio}</p>}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 border-white/10 bg-transparent" onClick={() => setEditing(s)}>
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => remove(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl bg-card text-card-foreground border-0 shadow-elegant max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editing?.id ? "Edit staff" : "Add staff"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-[200px_1fr] gap-6 mt-2">
              <div className="space-y-3">
                <div className="aspect-[4/5] rounded-xl bg-input border border-border overflow-hidden flex items-center justify-center">
                  {editing.image_url ? <img src={editing.image_url} alt="" className="w-full h-full object-cover" /> : <User className="h-12 w-12 text-muted-foreground" />}
                </div>
                <label className="block">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  <span className="inline-flex items-center justify-center w-full gap-1 text-xs px-3 py-2 rounded-lg bg-secondary text-secondary-foreground cursor-pointer hover:opacity-90">
                    <ImagePlus className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload photo"}
                  </span>
                </label>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-card-foreground">Full name *</Label>
                  <Input value={editing.full_name ?? ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-card-foreground">Role / Title</Label>
                    <Input value={editing.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-card-foreground">Seniority</Label>
                    <Select value={editing.seniority ?? "Junior"} onValueChange={(v) => setEditing({ ...editing, seniority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SENIORITY.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-card-foreground">Category / Specialty</Label>
                  <Select value={editing.category ?? "hair"} onValueChange={(v) => setEditing({ ...editing, category: v as Staff["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-card-foreground">Biography / History</Label>
                  <Textarea rows={4} value={editing.bio ?? ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={save} className="bg-gradient-primary text-primary-foreground flex-1">{editing.id ? "Save changes" : "Add staff"}</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
