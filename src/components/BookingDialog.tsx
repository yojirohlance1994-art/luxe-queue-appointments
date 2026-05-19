import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarClock, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Service = { id: string; name: string; category: string; price: number; duration_minutes: number };
type Pkg = { id: string; service_id: string; service_ids?: string[]; name: string; description: string | null; price: number; duration_minutes: number };

// Simple time slots — easy to edit by changing this list.
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const createUuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("").replace(
    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
    "$1-$2-$3-$4-$5",
  );
};

const peso = (n: number) => `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

export function BookingDialog({
  open,
  onOpenChange,
  defaultServiceId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultServiceId?: string;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    contact_number: "",
    email: "",
    service_id: "",
    package_id: "",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    supabase.from("services").select("id, name, category, price, duration_minutes").eq("active", true).order("category")
      .then(({ data }) => data && setServices(data as Service[]));
    Promise.all([
      supabase.from("service_packages").select("id, service_id, name, description, price, duration_minutes").eq("active", true).order("sort_order"),
      supabase.from("service_package_items").select("package_id, service_id").order("sort_order"),
    ]).then(([packageRes, itemRes]) => {
      const itemsByPackage = ((itemRes.data as { package_id: string; service_id: string }[]) ?? []).reduce(
        (map, item) => {
          const ids = map.get(item.package_id) ?? [];
          ids.push(item.service_id);
          map.set(item.package_id, ids);
          return map;
        },
        new Map<string, string[]>(),
      );
      if (packageRes.data) {
        setPackages(
          (packageRes.data as Pkg[])
            .map((pkg) => ({
              ...pkg,
              service_ids: itemsByPackage.get(pkg.id) ?? [pkg.service_id],
            }))
            .filter((pkg) => (pkg.service_ids?.length ?? 0) > 1),
        );
      }
    });
  }, [open]);

  useEffect(() => {
    if (defaultServiceId) setForm((f) => ({ ...f, service_id: defaultServiceId, package_id: "" }));
  }, [defaultServiceId]);

  const servicePackages = useMemo(
    () => packages.filter((p) => (p.service_ids?.length ? p.service_ids : [p.service_id]).includes(form.service_id)),
    [packages, form.service_id],
  );

  const grouped = useMemo(() => {
    const out: Record<string, Service[]> = {};
    services.forEach((s) => { (out[s.category] ||= []).push(s); });
    return out;
  }, [services]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.contact_number || !form.service_id || !form.date || !form.time) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const clientId = createUuid();

      const { error: cErr } = await supabase.from("clients").insert(
        {
          id: clientId,
          full_name: form.full_name,
          contact_number: form.contact_number,
          email: form.email || null,
        },
      );
      if (cErr) throw cErr;

      const preferred_at = new Date(`${form.date}T${form.time}:00`).toISOString();

      const { error: aErr } = await supabase.from("appointments").insert({
        client_id: clientId,
        service_id: form.service_id,
        package_id: form.package_id || null,
        preferred_at,
        status: "queued",
        notes: form.notes || null,
      });
      if (aErr) throw aErr;

      toast.success("Booking added to the queue!", {
        description: "We'll be in touch shortly to confirm your slot.",
      });
      onOpenChange(false);
      setForm({ full_name: "", contact_number: "", email: "", service_id: "", package_id: "", date: "", time: "", notes: "" });
    } catch (err) {
      console.error("Booking dialog error:", err);
      const message = err instanceof Error ? err.message : JSON.stringify(err, null, 2) || "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card text-card-foreground border-0 shadow-elegant max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-primary text-primary-foreground px-6 pt-6 pb-8 relative overflow-hidden">
          <Sparkles className="absolute -right-2 -top-2 h-24 w-24 opacity-10" />
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="font-display text-3xl">Book Your Visit</DialogTitle>
            <DialogDescription className="text-primary-foreground/85">
              Reserve your slot — fill in the details below to be added to our queue.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 pt-6 pb-6 text-card-foreground">
          {/* 1. Service */}
          <div className="space-y-2">
            <Label className="text-card-foreground">1. Choose a Service *</Label>
            <Select value={form.service_id} onValueChange={(v) => setForm({ ...form, service_id: v, package_id: "" })}>
              <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
              <SelectContent>
                {Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">{cat}</div>
                    {items.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} — {peso(s.price)}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Package */}
          {servicePackages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-card-foreground">2. Choose a Package (optional)</Label>
              <Select value={form.package_id} onValueChange={(v) => setForm({ ...form, package_id: v })}>
                <SelectTrigger><SelectValue placeholder="No package — base service only" /></SelectTrigger>
                <SelectContent>
                  {servicePackages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {peso(p.price)} · {p.duration_minutes} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 3. Date + time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2 text-card-foreground"><CalendarClock className="h-4 w-4" /> Date *</Label>
              <Input
                id="date"
                type="date"
                required
                min={today}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-white/15 border-white/20 text-card-foreground placeholder:text-card-foreground/60"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Time Slot *</Label>
              <Select value={form.time} onValueChange={(v) => setForm({ ...form, time: v })}>
                <SelectTrigger className="bg-white/15 border-white/20 text-card-foreground"><SelectValue placeholder="Select a time" /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 4. Customer details */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-card-foreground">Full Name *</Label>
            <Input
              id="full_name"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Juan Dela Cruz"
              className="bg-white/15 border-white/20 text-card-foreground placeholder:text-card-foreground/60"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_number" className="text-card-foreground">Contact Number *</Label>
              <Input
                id="contact_number"
                required
                value={form.contact_number}
                onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
                className="bg-white/15 border-white/20 text-card-foreground placeholder:text-card-foreground/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-white/15 border-white/20 text-card-foreground placeholder:text-card-foreground/60"
              />
            </div>
          </div>

          {/* 5. Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-card-foreground">Notes / Special Requests</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anything we should know? (e.g. allergies, preferred stylist)"
              className="bg-white/15 border-white/20 text-card-foreground placeholder:text-card-foreground/60"
            />
          </div>

          <Button type="submit" disabled={submitting} size="lg" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 rounded-full shadow-glow">
            {submitting ? "Reserving..." : "Reserve My Slot"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
