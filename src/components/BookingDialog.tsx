import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Service = {
  id: string;
  name: string;
  category: "hair" | "nails" | "body";
  price: number;
  duration_minutes: number;
};

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
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    contact_number: "",
    email: "",
    service_id: "",
    stylist: "",
    preferred_at: "",
    notes: "",
  });

  const stylists = [
    { name: "Ava Romero", expertise: "Precision cuts & balayage", available: true },
    { name: "Liam Tanaka", expertise: "Color correction & highlights", available: true },
    { name: "Sofia Mendes", expertise: "Gel manicures & nail art", available: false },
    { name: "Noa Bautista", expertise: "Lash extensions & brow shaping", available: true },
    { name: "Mateo Cruz", expertise: "Bridal & event makeup", available: false },
  ];

  useEffect(() => {
    if (!open) return;
    supabase
      .from("services")
      .select("id, name, category, price, duration_minutes")
      .eq("active", true)
      .order("category")
      .then(({ data }) => {
        if (data) setServices(data as Service[]);
      });
  }, [open]);

  useEffect(() => {
    if (defaultServiceId) setForm((f) => ({ ...f, service_id: defaultServiceId }));
  }, [defaultServiceId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.contact_number || !form.service_id || !form.preferred_at) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      // 1. Create client
      const { data: client, error: cErr } = await supabase
        .from("clients")
        .insert({
          full_name: form.full_name,
          contact_number: form.contact_number,
          email: form.email || null,
        })
        .select("id")
        .single();
      if (cErr || !client) throw cErr ?? new Error("Could not save client");

      // 2. Enqueue appointment (queue_seq auto-assigned at the tail by DB)
      const { error: aErr } = await supabase.from("appointments").insert({
        client_id: client.id,
        service_id: form.service_id,
        preferred_at: new Date(form.preferred_at).toISOString(),
        notes: [form.stylist ? `Stylist: ${form.stylist}` : null, form.notes].filter(Boolean).join(" — ") || null,
      });
      if (aErr) throw aErr;

      toast.success("Reservation added to the queue!", {
        description: "We'll be in touch shortly to confirm your slot.",
      });
      onOpenChange(false);
      setForm({ full_name: "", contact_number: "", email: "", service_id: "", stylist: "", preferred_at: "", notes: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-popover">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">Book Your Visit</DialogTitle>
          <DialogDescription>
            Reserve your slot — you'll be added to our first-come, first-served queue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Customer Name *</Label>
            <Input
              id="full_name"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number *</Label>
            <Input
              id="contact_number"
              required
              value={form.contact_number}
              onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
              placeholder="+63 9XX XXX XXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Service Category *</Label>
            <Select value={form.service_id} onValueChange={(v) => setForm({ ...form, service_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.category} · ${Number(s.price).toFixed(0)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred Stylist</Label>
            <Select value={form.stylist} onValueChange={(v) => setForm({ ...form, stylist: v })}>
              <SelectTrigger><SelectValue placeholder="Choose a stylist (optional)" /></SelectTrigger>
              <SelectContent>
                {stylists.map((s) => (
                  <SelectItem key={s.name} value={s.name} disabled={!s.available}>
                    <span className="flex items-center justify-between gap-3 w-full">
                      <span>
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground"> — {s.expertise}</span>
                      </span>
                      <span className={`ml-2 text-xs font-semibold ${s.available ? "text-primary" : "text-destructive"}`}>
                        {s.available ? "Available" : "Unavailable"}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferred_at">Preferred Date & Time *</Label>
            <Input
              id="preferred_at"
              type="datetime-local"
              required
              value={form.preferred_at}
              onChange={(e) => setForm({ ...form, preferred_at: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anything we should know?"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
            {submitting ? "Reserving..." : "Reserve My Slot"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}