import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  category: "hair" | "nails" | "beauty" | "body" | "lashes" | "waxing";
  image_url: string | null;
  active: boolean;
  sort_order: number;
  schedule_notes: string | null;
  work_days: string[];
};

type Unavailable = {
  id: string;
  staff_id: string;
  unavailable_date: string;
  reason: string | null;
};

const CATS: Staff["category"][] = ["hair", "nails", "lashes", "waxing", "beauty", "body"];
const SENIORITY = ["Junior", "Mid-Level", "Senior", "Master"];
const DAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const empty: Partial<Staff> = {
  full_name: "",
  role: "Stylist",
  seniority: "Junior",
  bio: "",
  category: "hair",
  image_url: "",
  active: true,
  schedule_notes: "",
  work_days: DAYS.map((d) => d.id),
};

function StaffPage() {
  const [list, setList] = useState<Staff[]>([]);
  const [editing, setEditing] = useState<Partial<Staff> | null>(null);
  const [filter, setFilter] = useState<"all" | Staff["category"]>("all");
  const [uploading, setUploading] = useState(false);
  const [unavailable, setUnavailable] = useState<Unavailable[]>([]);
  const [offDay, setOffDay] = useState({ date: "", reason: "" });

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("staff").select("*").order("sort_order");
    if (error) return toast.error(error.message);
    setList(
      ((data as Staff[]) ?? []).map((s) => ({
        ...s,
        work_days: Array.isArray(s.work_days) ? s.work_days : DAYS.map((d) => d.id),
      })),
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      schedule_notes: editing.schedule_notes || null,
      work_days: editing.work_days ?? DAYS.map((d) => d.id),
    };
    const { error } = editing.id
      ? await supabase.from("staff").update(payload).eq("id", editing.id)
      : await supabase.from("staff").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Staff updated" : "Staff added");
    setEditing(null);
    load();
  };

  const loadUnavailable = async (staffId: string) => {
    const { data, error } = await supabase
      .from("staff_unavailability")
      .select("*")
      .eq("staff_id", staffId)
      .order("unavailable_date", { ascending: true });
    if (error) return toast.error(error.message);
    setUnavailable((data as Unavailable[]) ?? []);
  };

  const addUnavailable = async () => {
    if (!editing?.id || !offDay.date) return toast.error("Choose a date first.");
    const { error } = await supabase.from("staff_unavailability").insert({
      staff_id: editing.id,
      unavailable_date: offDay.date,
      reason: offDay.reason || null,
    });
    if (error) return toast.error(error.message);
    setOffDay({ date: "", reason: "" });
    loadUnavailable(editing.id);
  };

  const removeUnavailable = async (id: string) => {
    const { error } = await supabase.from("staff_unavailability").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (editing?.id) loadUnavailable(editing.id);
  };

  const editStaff = (staff: Staff) => {
    setEditing(staff);
    loadUnavailable(staff.id);
  };

  const toggleWorkDay = (day: string) => {
    const current = editing?.work_days ?? [];
    setEditing({
      ...editing,
      work_days: current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    });
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
    const { error } = await supabase.storage
      .from("staff-photos")
      .upload(path, file, { upsert: false });
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
          <p className="text-foreground/70 mt-1">Add, edit, and curate the salon roster.</p>
        </div>
        <Button
          onClick={() => setEditing(empty)}
          className="bg-gradient-primary text-primary-foreground rounded-full shadow-glow"
        >
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
          <Card
            key={s.id}
            className="group bg-surface-1 border-white/5 text-foreground p-0 overflow-hidden hover-lift relative"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-surface-2">
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt={s.full_name}
                  className="w-full h-full object-cover transition-spring group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <User className="h-16 w-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] uppercase tracking-widest text-primary-foreground/80">
                  {s.category} · {s.seniority}
                </div>
                <div className="font-display text-lg font-semibold text-white">{s.full_name}</div>
                <div className="text-xs text-white/80">{s.role}</div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {s.bio && <p className="text-xs text-foreground/70 line-clamp-2">{s.bio}</p>}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-white/10 bg-transparent"
                  onClick={() => editStaff(s)}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => remove(s.id)}
                >
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
            <DialogTitle className="font-display text-2xl">
              {editing?.id ? "Edit staff" : "Add staff"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-[200px_1fr] gap-6 mt-2">
              <div className="space-y-3">
                <div className="aspect-[4/5] rounded-xl bg-input border border-border overflow-hidden flex items-center justify-center">
                  {editing.image_url ? (
                    <img src={editing.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
                  />
                  <span className="inline-flex items-center justify-center w-full gap-1 text-xs px-3 py-2 rounded-lg bg-secondary text-secondary-foreground cursor-pointer hover:opacity-90">
                    <ImagePlus className="h-3.5 w-3.5" />{" "}
                    {uploading ? "Uploading…" : "Upload photo"}
                  </span>
                </label>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-foreground">Full name *</Label>
                  <Input
                    value={editing.full_name ?? ""}
                    onChange={(e) => setEditing({ ...editing, full_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-foreground">Role / Title</Label>
                    <Input
                      value={editing.role ?? ""}
                      onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Seniority</Label>
                    <Select
                      value={editing.seniority ?? "Junior"}
                      onValueChange={(v) => setEditing({ ...editing, seniority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SENIORITY.map((x) => (
                          <SelectItem key={x} value={x}>
                            {x}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-foreground">Category / Specialty</Label>
                  <Select
                    value={editing.category ?? "hair"}
                    onValueChange={(v) =>
                      setEditing({ ...editing, category: v as Staff["category"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATS.map((x) => (
                        <SelectItem key={x} value={x}>
                          {x}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground">Biography / History</Label>
                  <Textarea
                    rows={4}
                    value={editing.bio ?? ""}
                    onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-foreground">Working days</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {DAYS.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleWorkDay(day.id)}
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold ${editing.work_days?.includes(day.id) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-foreground">Schedule notes</Label>
                  <Textarea
                    rows={2}
                    value={editing.schedule_notes ?? ""}
                    onChange={(e) => setEditing({ ...editing, schedule_notes: e.target.value })}
                  />
                </div>
                {editing.id && (
                  <div className="rounded-xl border border-border p-3 space-y-3">
                    <Label className="text-foreground">Specific off days</Label>
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input
                        type="date"
                        value={offDay.date}
                        onChange={(e) => setOffDay({ ...offDay, date: e.target.value })}
                      />
                      <Input
                        placeholder="Reason"
                        value={offDay.reason}
                        onChange={(e) => setOffDay({ ...offDay, reason: e.target.value })}
                      />
                      <Button type="button" variant="outline" onClick={addUnavailable}>
                        Add
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {unavailable.length === 0 && (
                        <p className="text-xs text-muted-foreground">No specific off days.</p>
                      )}
                      {unavailable.map((day) => (
                        <div
                          key={day.id}
                          className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs"
                        >
                          <span>
                            {day.unavailable_date}
                            {day.reason ? ` - ${day.reason}` : ""}
                          </span>
                          <button
                            type="button"
                            className="text-destructive"
                            onClick={() => removeUnavailable(day.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={save}
                    className="bg-gradient-primary text-primary-foreground flex-1"
                  >
                    {editing.id ? "Save changes" : "Add staff"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
