/**
 * BOOKING PAGE ROUTE
 *
 * Dedicated booking page for multi-service appointment selection.
 * Allows users to:
 * - Select multiple services across categories
 * - Add packages with automatic service inclusion
 * - View running total and estimated duration
 * - Set date, time, and preferences
 *
 * Location: http://localhost:5173/booking
 */

import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice } from "@/lib/services-data";
import { ArrowRight, Trash2, Clock } from "lucide-react";

export const Route = createFileRoute("/booking")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book Your Appointment — Glammee" },
      { name: "description", content: "Book multiple salon services in one appointment." },
    ],
  }),
  component: BookingPage,
});

// TIME SLOTS
// Edit available booking times here
const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// Get minimum date (today)
const getMinDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Get maximum date (90 days from now)
const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  return maxDate.toISOString().split("T")[0];
};

type Service = {
  id: string;
  name: string;
  category: "hair" | "nails" | "body" | "beauty" | "lashes" | "waxing";
  description: string | null;
  duration_minutes: number;
  price: number;
  price_note: string | null;
};

type ServicePackage = {
  id: string;
  service_id: string;
  service_ids?: string[];
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
};

const CATEGORY_META = {
  hair: { label: "Hair", description: "Cuts, styling, color and treatments." },
  nails: { label: "Nails", description: "Manicures, pedicures and nail care." },
  lashes: { label: "Lashes & Brows", description: "Extensions, tints and lash lifts." },
  waxing: { label: "Waxing", description: "Professional hair removal services." },
  body: { label: "Massage", description: "Foot, back, legs and whole body massage." },
  beauty: { label: "Beauty", description: "Makeup and event-ready services." },
} as const;

const CATEGORY_KEYS = ["hair", "nails", "lashes", "waxing", "body", "beauty"] as const;

const createUuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytes
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
};

const createBookingReference = () =>
  `QM-${createUuid().replaceAll("-", "").slice(0, 10).toUpperCase()}`;

const isHairColorService = (name: string) =>
  /color|tone|regrowth|highlight|bleach|ombre|balayage/i.test(name);

const isRebondingService = (name: string) => /rebond|brazilian|botox|blowout/i.test(name);

function BookingPage() {
  const search = Route.useSearch();
  // FORM STATE
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    contact_number: "",
    email: "",
    date: "",
    time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"services" | "packages">("services");
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORY_KEYS)[number]>(
    CATEGORY_KEYS.includes(search.category as any)
      ? (search.category as (typeof CATEGORY_KEYS)[number])
      : "hair",
  );

  const hasBookingDraft =
    selectedServices.length > 0 ||
    selectedPackages.length > 0 ||
    Boolean(form.full_name || form.contact_number || form.email || form.date || form.time || form.notes);

  useBlocker({
    disabled: !hasBookingDraft || submitting,
    enableBeforeUnload: () => hasBookingDraft && !submitting,
    shouldBlockFn: () =>
      !window.confirm(
        "You have an unfinished booking. If you leave now, your selected services and details will not be saved. Leave this page?",
      ),
  });

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, category, description, duration_minutes, price, price_note")
      .eq("active", true)
      .order("category")
      .then(({ data }) => data && setServices(data as Service[]));

    Promise.all([
      supabase
        .from("service_packages")
        .select("id, service_id, name, description, price, duration_minutes")
        .eq("active", true)
        .order("sort_order"),
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
          (packageRes.data as ServicePackage[])
            .map((pkg) => ({
              ...pkg,
              service_ids: itemsByPackage.get(pkg.id) ?? [pkg.service_id],
            }))
            .filter((pkg) => (pkg.service_ids?.length ?? 0) > 1),
        );
      }
    });
  }, []);

  // CALCULATIONS
  const selectedPackageServiceIds = useMemo(
    () =>
      selectedPackages
        .flatMap((pkgId) => {
          const pkg = packages.find((item) => item.id === pkgId);
          return pkg?.service_ids?.length ? pkg.service_ids : pkg?.service_id ? [pkg.service_id] : [];
        })
        .filter((id, index, ids): id is string => Boolean(id) && ids.indexOf(id) === index),
    [packages, selectedPackages],
  );

  const allSelectedServiceIds = useMemo(() => {
    const serviceIds = [...selectedServices];
    selectedPackageServiceIds.forEach((serviceId) => {
      if (!serviceIds.includes(serviceId)) serviceIds.push(serviceId);
    });
    return serviceIds;
  }, [selectedPackageServiceIds, selectedServices]);

  function effectivePackage(pkg: ServicePackage) {
    const serviceIds = pkg.service_ids?.length ? pkg.service_ids : [pkg.service_id];
    const included = serviceIds
      .map((id) => services.find((service) => service.id === id))
      .filter(Boolean) as Service[];
    const subtotal = included.reduce((sum, service) => sum + Number(service.price || 0), 0);
    const duration = included.reduce(
      (sum, service) => sum + Number(service.duration_minutes || 0),
      0,
    );
    const discount = included.length >= 3 ? 0.15 : included.length === 2 ? 0.1 : 0;
    return {
      included,
      subtotal,
      price: subtotal > 0 ? Math.round(subtotal * (1 - discount)) : Number(pkg.price || 0),
      duration: duration || Number(pkg.duration_minutes || 0),
    };
  }

  const totalPrice = useMemo(() => {
    const directTotal = selectedServices.reduce(
      (sum, id) => sum + (services.find((s) => s.id === id)?.price || 0),
      0,
    );
    const packageTotal = selectedPackages.reduce(
      (sum, pkgId) => {
        const pkg = packages.find((item) => item.id === pkgId);
        return sum + (pkg ? effectivePackage(pkg).price : 0);
      },
      0,
    );
    return directTotal + packageTotal;
  }, [packages, selectedPackages, services, selectedServices]);

  const totalDuration = useMemo(() => {
    const directTotal = selectedServices.reduce(
      (sum, id) => sum + (services.find((s) => s.id === id)?.duration_minutes || 0),
      0,
    );
    const packageTotal = selectedPackages.reduce(
      (sum, pkgId) => {
        const pkg = packages.find((item) => item.id === pkgId);
        return sum + (pkg ? effectivePackage(pkg).duration : 0);
      },
      0,
    );
    return directTotal + packageTotal;
  }, [packages, selectedPackages, services, selectedServices]);

  // HANDLERS
  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    );
  };

  const togglePackage = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId],
    );
  };

  const removeService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((id) => id !== serviceId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // VALIDATION
    if (!form.full_name || !form.contact_number || !form.date || !form.time) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (allSelectedServiceIds.length === 0) {
      toast.error("Please select at least one service.");
      return;
    }

    const pickedServices = allSelectedServiceIds
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is Service => Boolean(s));

    if (
      pickedServices.some((s) => isHairColorService(s.name)) &&
      pickedServices.some((s) => isRebondingService(s.name))
    ) {
      toast.error(
        "Hair coloring and rebonding/Brazilian treatments cannot be booked in the same session.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const clientId = createUuid();
      const bookingReference = createBookingReference();

      // Create client without needing the returned row to satisfy RLS
      const { error: cErr } = await supabase.from("clients").insert(
        {
          id: clientId,
          full_name: form.full_name,
          contact_number: form.contact_number,
          email: null,
        },
      );

      if (cErr) throw cErr;

      // Create appointment with all services
      const preferred_at = new Date(`${form.date}T${form.time}:00`).toISOString();

      // For multi-service support, we'll create one appointment with all services
      // (You may want to extend the appointments table to store multiple service_ids as JSON)
      const primaryServiceId = selectedServices[0] || selectedPackageServiceIds[0];
      const selectedServiceNames = allSelectedServiceIds.map(
        (id) => services.find((s) => s.id === id)?.name || id,
      );
      const selectedPackageNames = selectedPackages
        .map((pkgId) => packages.find((pkg) => pkg.id === pkgId)?.name)
        .filter(Boolean);

      const { error: aErr } = await supabase.from("appointments").insert({
        booking_reference: bookingReference,
        client_id: clientId,
        service_id: primaryServiceId,
        package_id: selectedPackages[0] || null,
        preferred_at,
        status: "queued",
        notes: form.notes
          ? `${form.notes}\n\nServices: ${selectedServiceNames.join(", ")}${
              selectedPackageNames.length > 0
                ? `\nPackages: ${selectedPackageNames.join(", ")}`
                : ""
            }`
          : `Services: ${selectedServiceNames.join(", ")}${
              selectedPackageNames.length > 0
                ? `\nPackages: ${selectedPackageNames.join(", ")}`
                : ""
            }`,
      });

      if (aErr) throw aErr;

      toast.success("Booking confirmed!", {
        description: `Reference: ${bookingReference}. Keep this for reviews or concerns.`,
      });

      // Reset form
      setSelectedServices([]);
      setSelectedPackages([]);
      setForm({ full_name: "", contact_number: "", email: "", date: "", time: "", notes: "" });
    } catch (err) {
      console.error("Booking error:", err);
      const message =
        err instanceof Error
          ? err.message
          : JSON.stringify(err, null, 2) || "Booking failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Book Your Visit</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-4">
            Choose your <span className="text-gradient">perfect services</span>
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Select multiple services across any category. Mix and match to create your ideal
            appointment.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: SERVICE SELECTION */}
          <div className="lg:col-span-2">
            {/* TABS */}
            <div className="flex gap-2 mb-6 border-b border-white/10">
              <button
                onClick={() => setActiveTab("services")}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "services"
                    ? "border-primary text-foreground"
                    : "border-transparent text-foreground/60 hover:text-foreground/80"
                }`}
              >
                Individual Services
              </button>
              <button
                onClick={() => setActiveTab("packages")}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "packages"
                    ? "border-primary text-foreground"
                    : "border-transparent text-foreground/60 hover:text-foreground/80"
                }`}
              >
                Packages
              </button>
            </div>

            {/* SERVICES TAB */}
            {activeTab === "services" && (
              <div className="space-y-8">
                <div className="flex flex-wrap gap-2 sticky top-20 z-10 bg-background/90 py-3 backdrop-blur">
                  {CATEGORY_KEYS.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold border ${activeCategory === category ? "bg-gradient-primary text-primary-foreground border-transparent" : "border-white/10 text-foreground/70 bg-surface-1"}`}
                    >
                      {CATEGORY_META[category].label}
                    </button>
                  ))}
                </div>
                {[activeCategory].map((category) => {
                  const categoryServices = services.filter((s) => s.category === category);
                  if (categoryServices.length === 0) return null;

                  const meta = CATEGORY_META[category];
                  return (
                    <div key={category}>
                      <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                        {meta.label}
                      </h3>
                      <div className="space-y-3">
                        {categoryServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-start gap-3 p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                            onClick={() => toggleService(service.id)}
                          >
                            <Checkbox
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={() => toggleService(service.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">{service.name}</div>
                              {service.description && (
                                <div className="text-sm text-foreground/60">
                                  {service.description}
                                </div>
                              )}
                              <div className="flex gap-4 mt-2 text-xs text-foreground/50">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {service.duration_minutes} min
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-primary">
                                {service.price_note || formatPrice(service.price)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PACKAGES TAB */}
            {activeTab === "packages" && (
              <div className="grid gap-4">
                {packages.map((pkg) => {
                  const calculated = effectivePackage(pkg);
                  return (
                    <Card
                      key={pkg.id}
                      className={`cursor-pointer transition-all border text-foreground ${
                        selectedPackages.includes(pkg.id)
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-surface-1 hover:border-white/20 hover:bg-surface-2"
                      }`}
                      onClick={() => togglePackage(pkg.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-foreground">{pkg.name}</CardTitle>
                            <CardDescription className="text-foreground/65">
                              {pkg.description}
                            </CardDescription>
                          </div>
                          <Checkbox
                            checked={selectedPackages.includes(pkg.id)}
                            onCheckedChange={() => togglePackage(pkg.id)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-foreground/75">
                          <div className="font-semibold text-foreground mb-2">
                            Services included:
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-primary">•</span>
                            {calculated.included.map((service) => service.name).join(", ") ||
                              "Unknown service"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div>
                            <div className="text-xs text-foreground/60">Package price</div>
                            <div className="font-display text-2xl font-bold text-primary">
                              {formatPrice(calculated.price)}
                            </div>
                            {calculated.subtotal > calculated.price && (
                              <div className="text-xs text-emerald-400">
                                Saves {formatPrice(calculated.subtotal - calculated.price)}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-foreground/70">
                            {calculated.duration} min
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: BOOKING SUMMARY & FORM */}
          <div className="lg:col-span-1">
            {/* SUMMARY CARD */}
            <Card className="sticky top-4 border-white/10 mb-6 bg-surface-1 text-foreground">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-foreground">
                {/* Selected services list */}
                {allSelectedServiceIds.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allSelectedServiceIds.map((serviceId) => {
                      const service = services.find((s) => s.id === serviceId);
                      if (!service) return null;
                      const isSelectedDirectly = selectedServices.includes(serviceId);

                      return (
                        <div
                          key={serviceId}
                          className="flex items-center justify-between text-sm p-2 rounded bg-white/5"
                        >
                          <div>
                            <div className="text-foreground">{service.name}</div>
                            <div className="text-xs text-foreground/50">
                              {service.duration_minutes} min
                            </div>
                            {!isSelectedDirectly && (
                              <div className="text-xs text-primary/70">(from package)</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">
                              {service.price_note || formatPrice(service.price)}
                            </span>
                            {isSelectedDirectly && (
                              <button
                                onClick={() => removeService(serviceId)}
                                className="text-foreground/50 hover:text-foreground/80 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-foreground/50 italic">No services selected yet</div>
                )}

                {selectedPackages.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="text-sm font-semibold text-foreground">Selected packages</div>
                    {selectedPackages.map((pkgId) => {
                      const pkg = packages.find((p) => p.id === pkgId);
                      if (!pkg) return null;
                      const calculated = effectivePackage(pkg);
                      const pkgServiceNames = (pkg.service_ids?.length
                        ? pkg.service_ids
                        : [pkg.service_id]
                      )
                        .map((id) => services.find((service) => service.id === id)?.name)
                        .filter(Boolean);
                      return (
                        <div
                          key={pkgId}
                          className="flex items-center justify-between text-sm p-2 rounded bg-white/5"
                        >
                          <div>
                            <div className="text-foreground">{pkg.name}</div>
                            <div className="text-xs text-foreground/50">
                              {pkgServiceNames.join(", ") || "Service"}
                            </div>
                          </div>
                          <div className="font-semibold text-primary">
                            {formatPrice(calculated.price)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground/70">Total duration:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {totalDuration} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Total price:</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BOOKING FORM */}
            <Card className="border-white/10 bg-surface-1 text-foreground">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Your Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 text-foreground">
                  {/* Name */}
                  <div>
                    <Label htmlFor="full_name" className="text-foreground">
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      placeholder="Your full name"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="bg-white/15 border-white/20 text-foreground placeholder:text-foreground/50"
                      required
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <Label htmlFor="contact_number" className="text-foreground">
                      Phone Number *
                    </Label>
                    <Input
                      id="contact_number"
                      placeholder="09XX XXX XXXX"
                      value={form.contact_number}
                      onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                      className="bg-white/15 border-white/20 text-foreground placeholder:text-foreground/50"
                      required
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <Label htmlFor="date" className="text-foreground">
                      Preferred Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="bg-white/15 border-white/20 text-foreground"
                      required
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <Label htmlFor="time" className="text-foreground">
                      Preferred Time *
                    </Label>
                    <Select value={form.time} onValueChange={(v) => setForm({ ...form, time: v })}>
                      <SelectTrigger className="bg-white/15 border-white/20 text-foreground">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-foreground">
                      Notes (optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or preferences?"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="bg-white/15 border-white/20 text-foreground placeholder:text-foreground/50 resize-none h-20"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={submitting || allSelectedServiceIds.length === 0}
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-95 disabled:opacity-50"
                    size="lg"
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <p className="text-xs text-foreground/50 text-center">
                    We'll confirm your appointment within 24 hours
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
