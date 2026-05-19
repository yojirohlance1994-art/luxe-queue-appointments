import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit3, ImagePlus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  component: ContentPage,
});

type Category = "hair" | "nails" | "body" | "beauty" | "lashes" | "waxing";
type Service = { id: string; name: string; price: number; duration_minutes: number };
type Announcement = {
  id: string;
  package_id: string | null;
  title: string;
  body: string;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  sort_order: number;
};
type Portfolio = {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  image_url: string;
  active: boolean;
  sort_order: number;
};
type PackageRow = {
  id: string;
  service_id: string;
  service_ids?: string[];
  announcement_id: string | null;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  sort_order: number;
};
type Inventory = {
  id: string;
  item_name: string;
  category: string | null;
  quantity: number;
  unit: string;
  reorder_level: number;
  notes: string | null;
  active: boolean;
};

const CATEGORIES: Category[] = ["hair", "nails", "lashes", "waxing", "body", "beauty"];
const INVENTORY_CATEGORIES = [
  "Hair Care",
  "Nail Care",
  "Body & Massage",
  "Eyelash & Waxing",
  "General Salon Supplies",
] as const;

const emptyAnnouncement: Partial<Announcement> = {
  package_id: null,
  title: "",
  body: "",
  image_url: "",
  starts_at: "",
  ends_at: "",
  active: true,
  sort_order: 0,
};
const emptyPortfolio: Partial<Portfolio> = {
  title: "",
  description: "",
  category: "hair",
  image_url: "",
  active: true,
  sort_order: 0,
};
const emptyInventory: Partial<Inventory> = {
  item_name: "",
  category: "General Salon Supplies",
  quantity: 0,
  unit: "pcs",
  reorder_level: 0,
  notes: "",
  active: true,
};
const emptyPackage: Partial<PackageRow> = {
  service_ids: [],
  name: "",
  description: "",
  price: 0,
  duration_minutes: 60,
  active: true,
  sort_order: 0,
  announcement_id: null,
  starts_at: "",
  ends_at: "",
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

function fromLocalInput(value: string | null | undefined) {
  return value ? new Date(value).toISOString() : null;
}

function ContentPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(
    null,
  );
  const [editingPortfolio, setEditingPortfolio] = useState<Partial<Portfolio> | null>(null);
  const [editingPackage, setEditingPackage] = useState<Partial<PackageRow> | null>(null);
  const [editingInventory, setEditingInventory] = useState<Partial<Inventory> | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const [announcementRes, portfolioRes, packageRes, packageItemsRes, inventoryRes, serviceRes] =
      await Promise.all([
        supabase.from("announcements").select("*").order("sort_order"),
        supabase.from("portfolio_items").select("*").order("sort_order"),
        supabase.from("service_packages").select("*").order("sort_order"),
        supabase.from("service_package_items").select("package_id, service_id").order("sort_order"),
        supabase.from("inventory_items").select("*").order("item_name"),
        supabase
          .from("services")
          .select("id, name, price, duration_minutes")
          .eq("active", true)
          .order("name"),
      ]);

    if (announcementRes.error) toast.error(announcementRes.error.message);
    if (portfolioRes.error) toast.error(portfolioRes.error.message);
    if (packageRes.error) toast.error(packageRes.error.message);
    if (packageItemsRes.error) toast.error(packageItemsRes.error.message);
    if (inventoryRes.error) toast.error(inventoryRes.error.message);
    if (serviceRes.error) toast.error(serviceRes.error.message);

    const packageItems = ((packageItemsRes.data as { package_id: string; service_id: string }[]) ?? []).reduce(
      (map, item) => {
        const ids = map.get(item.package_id) ?? [];
        ids.push(item.service_id);
        map.set(item.package_id, ids);
        return map;
      },
      new Map<string, string[]>(),
    );

    setAnnouncements((announcementRes.data as Announcement[]) ?? []);
    setPortfolio((portfolioRes.data as Portfolio[]) ?? []);
    setPackages(
      ((packageRes.data as PackageRow[]) ?? []).map((pkg) => ({
        ...pkg,
        service_ids: packageItems.get(pkg.id) ?? [pkg.service_id],
      })),
    );
    setInventory((inventoryRes.data as Inventory[]) ?? []);
    setServices((serviceRes.data as Service[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadImage = async (
    bucket: "portfolio" | "announcement-images",
    file: File,
    done: (url: string) => void,
  ) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    setUploading(false);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    done(data.publicUrl);
  };

  const saveAnnouncement = async () => {
    if (!editingAnnouncement?.title || !editingAnnouncement.body)
      return toast.error("Title and body are required.");
    const payload = {
      package_id: editingAnnouncement.package_id || null,
      title: editingAnnouncement.title,
      body: editingAnnouncement.body,
      image_url: editingAnnouncement.image_url || null,
      starts_at: fromLocalInput(editingAnnouncement.starts_at),
      ends_at: fromLocalInput(editingAnnouncement.ends_at),
      active: editingAnnouncement.active ?? true,
      sort_order: Number(editingAnnouncement.sort_order ?? 0),
    };
    const { error } = editingAnnouncement.id
      ? await supabase.from("announcements").update(payload).eq("id", editingAnnouncement.id)
      : await supabase.from("announcements").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Announcement saved");
    setEditingAnnouncement(null);
    load();
  };

  const savePortfolio = async () => {
    if (!editingPortfolio?.title || !editingPortfolio.image_url)
      return toast.error("Title and image are required.");
    const payload = {
      title: editingPortfolio.title,
      description: editingPortfolio.description || null,
      category: editingPortfolio.category || "hair",
      image_url: editingPortfolio.image_url,
      active: editingPortfolio.active ?? true,
      sort_order: Number(editingPortfolio.sort_order ?? 0),
    };
    const { error } = editingPortfolio.id
      ? await supabase.from("portfolio_items").update(payload).eq("id", editingPortfolio.id)
      : await supabase.from("portfolio_items").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Portfolio item saved");
    setEditingPortfolio(null);
    load();
  };

  const savePackage = async () => {
    const serviceIds = editingPackage?.service_ids?.length
      ? editingPackage.service_ids
      : editingPackage?.service_id
        ? [editingPackage.service_id]
        : [];
    if (serviceIds.length === 0 || !editingPackage?.name)
      return toast.error("At least one service and package name are required.");
    const payload = {
      service_id: serviceIds[0],
      announcement_id: editingPackage.announcement_id || null,
      name: editingPackage.name,
      description: editingPackage.description || null,
      price: Number(editingPackage.price ?? 0),
      duration_minutes: Number(editingPackage.duration_minutes ?? 60),
      starts_at: fromLocalInput(editingPackage.starts_at),
      ends_at: fromLocalInput(editingPackage.ends_at),
      active: editingPackage.active ?? true,
      sort_order: Number(editingPackage.sort_order ?? 0),
    };
    const { data, error } = editingPackage.id
      ? await supabase
          .from("service_packages")
          .update(payload)
          .eq("id", editingPackage.id)
          .select("id")
          .single()
      : await supabase.from("service_packages").insert(payload).select("id").single();
    if (error) return toast.error(error.message);
    const packageId = editingPackage.id ?? data?.id;
    if (packageId) {
      const { error: deleteError } = await supabase
        .from("service_package_items")
        .delete()
        .eq("package_id", packageId);
      if (deleteError) return toast.error(deleteError.message);
      const { error: itemError } = await supabase.from("service_package_items").insert(
        serviceIds.map((serviceId, index) => ({
          package_id: packageId,
          service_id: serviceId,
          sort_order: index + 1,
        })),
      );
      if (itemError) return toast.error(itemError.message);
    }
    toast.success("Package saved");
    setEditingPackage(null);
    load();
  };

  const saveInventory = async () => {
    if (!editingInventory?.item_name) return toast.error("Item name is required.");
    const payload = {
      item_name: editingInventory.item_name,
      category: editingInventory.category || "General Salon Supplies",
      quantity: Number(editingInventory.quantity ?? 0),
      unit: editingInventory.unit || "pcs",
      reorder_level: Number(editingInventory.reorder_level ?? 0),
      notes: editingInventory.notes || null,
      active: editingInventory.active ?? true,
    };
    const { error } = editingInventory.id
      ? await supabase.from("inventory_items").update(payload).eq("id", editingInventory.id)
      : await supabase.from("inventory_items").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Inventory item saved");
    setEditingInventory(null);
    load();
  };

  const remove = async (
    table: "announcements" | "portfolio_items" | "service_packages" | "inventory_items",
    id: string,
  ) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const serviceName = useMemo(() => new Map(services.map((s) => [s.id, s.name])), [services]);
  const serviceLookup = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

  const calculatePackage = (serviceIds: string[]) => {
    const selected = serviceIds.map((id) => serviceLookup.get(id)).filter(Boolean) as Service[];
    const subtotal = selected.reduce((sum, service) => sum + Number(service.price || 0), 0);
    const duration = selected.reduce((sum, service) => sum + Number(service.duration_minutes || 0), 0);
    const discount = selected.length >= 3 ? 0.15 : selected.length === 2 ? 0.1 : 0;
    return {
      subtotal,
      price: Math.round(subtotal * (1 - discount)),
      duration,
      discount,
    };
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-float-in">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Content</p>
        <h1 className="font-display text-4xl font-bold">Site and Operations</h1>
        <p className="text-muted-foreground mt-1">
          Manage announcements, work photos, packages, and inventory.
        </p>
      </header>

      <Tabs defaultValue="announcements">
        <TabsList className="bg-surface-1 border border-white/5 flex-wrap h-auto">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="portfolio">Our Works</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-5">
          <SectionHeader
            title="Announcements"
            action="New announcement"
            onClick={() => setEditingAnnouncement(emptyAnnouncement)}
          />
          <ListGrid>
            {announcements.map((a) => (
              <AdminCard
                key={a.id}
                title={a.title}
                subtitle={`${a.package_id ? "Linked package" : "General announcement"} - ${
                  a.active ? "visible when in date range" : "hidden"
                }`}
                onEdit={() =>
                  setEditingAnnouncement({
                    ...a,
                    starts_at: toLocalInput(a.starts_at),
                    ends_at: toLocalInput(a.ends_at),
                  })
                }
                onDelete={() => remove("announcements", a.id)}
              >
                <p className="text-sm text-foreground/70 line-clamp-3">{a.body}</p>
              </AdminCard>
            ))}
          </ListGrid>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-5">
          <SectionHeader
            title="Our Works"
            action="Add work photo"
            onClick={() => setEditingPortfolio(emptyPortfolio)}
          />
          <ListGrid>
            {portfolio.map((p) => (
              <AdminCard
                key={p.id}
                title={p.title}
                subtitle={`${p.category} - ${p.active ? "visible" : "hidden"}`}
                onEdit={() => setEditingPortfolio(p)}
                onDelete={() => remove("portfolio_items", p.id)}
              >
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="aspect-video w-full rounded-lg object-cover bg-surface-2"
                />
              </AdminCard>
            ))}
          </ListGrid>
        </TabsContent>

        <TabsContent value="packages" className="mt-5">
          <SectionHeader
            title="Packages"
            action="New package"
            onClick={() => setEditingPackage({ ...emptyPackage, service_id: services[0]?.id })}
          />
          <ListGrid>
            {packages.map((p) => (
              <AdminCard
                key={p.id}
                title={p.name}
                subtitle={`${
                  (p.service_ids ?? [p.service_id])
                    .map((id) => serviceName.get(id))
                    .filter(Boolean)
                    .join(", ") || "Service"
                } - PHP ${p.price}`}
                onEdit={() =>
                  setEditingPackage({
                    ...p,
                    starts_at: toLocalInput(p.starts_at),
                    ends_at: toLocalInput(p.ends_at),
                  })
                }
                onDelete={() => remove("service_packages", p.id)}
              >
                <p className="text-sm text-foreground/70 line-clamp-2">
                  {p.description || "No description."}
                </p>
              </AdminCard>
            ))}
          </ListGrid>
        </TabsContent>

        <TabsContent value="inventory" className="mt-5">
          <SectionHeader
            title="Inventory"
            action="Add item"
            onClick={() => setEditingInventory(emptyInventory)}
          />
          <ListGrid>
            {inventory.map((i) => (
              <AdminCard
                key={i.id}
                title={i.item_name}
                subtitle={`${i.quantity} ${i.unit} - reorder at ${i.reorder_level}`}
                onEdit={() => setEditingInventory(i)}
                onDelete={() => remove("inventory_items", i.id)}
              >
                <p className="text-sm text-foreground/70">{i.category || "Uncategorized"}</p>
              </AdminCard>
            ))}
          </ListGrid>
        </TabsContent>

      </Tabs>

      <Dialog open={!!editingAnnouncement} onOpenChange={(v) => !v && setEditingAnnouncement(null)}>
        <DialogContent className="bg-card text-card-foreground border-0 shadow-elegant">
          <DialogHeader>
            <DialogTitle>Announcement</DialogTitle>
          </DialogHeader>
          {editingAnnouncement && (
            <FormStack>
              <TextField
                label="Title"
                value={editingAnnouncement.title}
                onChange={(v) => setEditingAnnouncement({ ...editingAnnouncement, title: v })}
              />
              <div>
                <Label>Body</Label>
                <Textarea
                  rows={5}
                  value={editingAnnouncement.body ?? ""}
                  onChange={(e) =>
                    setEditingAnnouncement({ ...editingAnnouncement, body: e.target.value })
                  }
                />
              </div>
              <TextField
                label="Image URL"
                value={editingAnnouncement.image_url ?? ""}
                onChange={(v) => setEditingAnnouncement({ ...editingAnnouncement, image_url: v })}
              />
              <ImageUpload
                uploading={uploading}
                onFile={(file) =>
                  uploadImage("announcement-images", file, (url) =>
                    setEditingAnnouncement({ ...editingAnnouncement, image_url: url }),
                  )
                }
              />
              <div>
                <Label>Linked Package</Label>
                <Select
                  value={editingAnnouncement.package_id || "none"}
                  onValueChange={(v) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      package_id: v === "none" ? null : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {packages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - PHP {p.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DatePair
                starts={editingAnnouncement.starts_at}
                ends={editingAnnouncement.ends_at}
                onStarts={(v) => setEditingAnnouncement({ ...editingAnnouncement, starts_at: v })}
                onEnds={(v) => setEditingAnnouncement({ ...editingAnnouncement, ends_at: v })}
              />
              <ActiveCheck
                checked={editingAnnouncement.active ?? true}
                onChange={(v) => setEditingAnnouncement({ ...editingAnnouncement, active: v })}
              />
              <Button
                onClick={saveAnnouncement}
                className="bg-gradient-primary text-primary-foreground"
              >
                Save announcement
              </Button>
            </FormStack>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPortfolio} onOpenChange={(v) => !v && setEditingPortfolio(null)}>
        <DialogContent className="bg-card text-card-foreground border-0 shadow-elegant">
          <DialogHeader>
            <DialogTitle>Work Photo</DialogTitle>
          </DialogHeader>
          {editingPortfolio && (
            <FormStack>
              <TextField
                label="Title"
                value={editingPortfolio.title}
                onChange={(v) => setEditingPortfolio({ ...editingPortfolio, title: v })}
              />
              <TextField
                label="Description"
                value={editingPortfolio.description ?? ""}
                onChange={(v) => setEditingPortfolio({ ...editingPortfolio, description: v })}
              />
              <CategorySelect
                value={editingPortfolio.category ?? "hair"}
                onChange={(v) => setEditingPortfolio({ ...editingPortfolio, category: v })}
              />
              <TextField
                label="Image URL"
                value={editingPortfolio.image_url ?? ""}
                onChange={(v) => setEditingPortfolio({ ...editingPortfolio, image_url: v })}
              />
              <ImageUpload
                uploading={uploading}
                onFile={(file) =>
                  uploadImage("portfolio", file, (url) =>
                    setEditingPortfolio({ ...editingPortfolio, image_url: url }),
                  )
                }
              />
              <ActiveCheck
                checked={editingPortfolio.active ?? true}
                onChange={(v) => setEditingPortfolio({ ...editingPortfolio, active: v })}
              />
              <Button
                onClick={savePortfolio}
                className="bg-gradient-primary text-primary-foreground"
              >
                Save work photo
              </Button>
            </FormStack>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPackage} onOpenChange={(v) => !v && setEditingPackage(null)}>
        <DialogContent className="bg-card text-card-foreground border-0 shadow-elegant">
          <DialogHeader>
            <DialogTitle>Package</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <FormStack>
              <div>
                <Label>Included services</Label>
                <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-border bg-input/40 p-2 space-y-1">
                  {services.map((s) => {
                    const ids = editingPackage.service_ids ?? [];
                    const checked = ids.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-start gap-2 rounded-md px-2 py-2 text-sm hover:bg-background/40"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            const nextIds = value
                              ? [...ids, s.id]
                              : ids.filter((id) => id !== s.id);
                            const calculated = calculatePackage(nextIds);
                            setEditingPackage({
                              ...editingPackage,
                              service_ids: nextIds,
                              service_id: nextIds[0],
                              price: calculated.price,
                              duration_minutes: calculated.duration,
                            });
                          }}
                        />
                        <span className="flex-1">
                          <span className="block font-medium">{s.name}</span>
                          <span className="text-xs text-muted-foreground">
                            PHP {s.price} - {s.duration_minutes} min
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {(() => {
                  const calculated = calculatePackage(editingPackage.service_ids ?? []);
                  return (
                    <div className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-card-foreground">
                      Services subtotal: PHP {calculated.subtotal}. Recommended package price:
                      <button
                        type="button"
                        className="ml-1 font-semibold text-primary hover:underline"
                        onClick={() =>
                          setEditingPackage({
                            ...editingPackage,
                            price: calculated.price,
                            duration_minutes: calculated.duration,
                          })
                        }
                      >
                        PHP {calculated.price}
                      </button>
                      {calculated.discount > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({Math.round(calculated.discount * 100)}% bundle discount)
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
              <TextField
                label="Name"
                value={editingPackage.name}
                onChange={(v) => setEditingPackage({ ...editingPackage, name: v })}
              />
              <TextField
                label="Description"
                value={editingPackage.description ?? ""}
                onChange={(v) => setEditingPackage({ ...editingPackage, description: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Price"
                  type="number"
                  value={editingPackage.price}
                  onChange={(v) => setEditingPackage({ ...editingPackage, price: Number(v) })}
                />
                <TextField
                  label="Duration"
                  type="number"
                  value={editingPackage.duration_minutes}
                  onChange={(v) =>
                    setEditingPackage({ ...editingPackage, duration_minutes: Number(v) })
                  }
                />
              </div>
              <div>
                <Label>Announcement</Label>
                <Select
                  value={editingPackage.announcement_id || "none"}
                  onValueChange={(v) =>
                    setEditingPackage({
                      ...editingPackage,
                      announcement_id: v === "none" ? null : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {announcements.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DatePair
                starts={editingPackage.starts_at}
                ends={editingPackage.ends_at}
                onStarts={(v) => setEditingPackage({ ...editingPackage, starts_at: v })}
                onEnds={(v) => setEditingPackage({ ...editingPackage, ends_at: v })}
              />
              <ActiveCheck
                checked={editingPackage.active ?? true}
                onChange={(v) => setEditingPackage({ ...editingPackage, active: v })}
              />
              <Button onClick={savePackage} className="bg-gradient-primary text-primary-foreground">
                Save package
              </Button>
            </FormStack>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingInventory} onOpenChange={(v) => !v && setEditingInventory(null)}>
        <DialogContent className="bg-card text-card-foreground border-0 shadow-elegant">
          <DialogHeader>
            <DialogTitle>Inventory Item</DialogTitle>
          </DialogHeader>
          {editingInventory && (
            <FormStack>
              <TextField
                label="Item name"
                value={editingInventory.item_name}
                onChange={(v) => setEditingInventory({ ...editingInventory, item_name: v })}
              />
              <TextField
                label="Category"
                value={editingInventory.category ?? "General Salon Supplies"}
                onChange={(v) => setEditingInventory({ ...editingInventory, category: v })}
                options={INVENTORY_CATEGORIES}
              />
              <div className="grid grid-cols-3 gap-3">
                <TextField
                  label="Quantity"
                  type="number"
                  value={editingInventory.quantity}
                  onChange={(v) =>
                    setEditingInventory({ ...editingInventory, quantity: Number(v) })
                  }
                />
                <TextField
                  label="Unit"
                  value={editingInventory.unit}
                  onChange={(v) => setEditingInventory({ ...editingInventory, unit: v })}
                />
                <TextField
                  label="Reorder at"
                  type="number"
                  value={editingInventory.reorder_level}
                  onChange={(v) =>
                    setEditingInventory({ ...editingInventory, reorder_level: Number(v) })
                  }
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={editingInventory.notes ?? ""}
                  onChange={(e) =>
                    setEditingInventory({ ...editingInventory, notes: e.target.value })
                  }
                />
              </div>
              <ActiveCheck
                checked={editingInventory.active ?? true}
                onChange={(v) => setEditingInventory({ ...editingInventory, active: v })}
              />
              <Button
                onClick={saveInventory}
                className="bg-gradient-primary text-primary-foreground"
              >
                Save inventory item
              </Button>
            </FormStack>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionHeader({
  title,
  action,
  onClick,
}: {
  title: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="font-display text-2xl">{title}</h2>
      <Button onClick={onClick} className="bg-gradient-primary text-primary-foreground">
        <Plus className="h-4 w-4 mr-1" /> {action}
      </Button>
    </div>
  );
}

function ListGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{children}</div>;
}

function AdminCard({
  title,
  subtitle,
  children,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="bg-surface-1 border-white/5 text-foreground p-5 space-y-3">
      <div>
        <h3 className="font-display text-xl">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-white/10 bg-transparent text-foreground hover:bg-white/5 hover:text-foreground"
          onClick={onEdit}
        >
          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

function FormStack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  options,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: string;
  options?: readonly string[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      {options ? (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function DatePair({
  starts,
  ends,
  onStarts,
  onEnds,
}: {
  starts: string | null | undefined;
  ends: string | null | undefined;
  onStarts: (value: string) => void;
  onEnds: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label>Starts</Label>
        <Input
          type="datetime-local"
          value={starts ?? ""}
          onChange={(e) => onStarts(e.target.value)}
        />
      </div>
      <div>
        <Label>Ends</Label>
        <Input type="datetime-local" value={ends ?? ""} onChange={(e) => onEnds(e.target.value)} />
      </div>
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: Category;
  onChange: (value: Category) => void;
}) {
  return (
    <div>
      <Label>Category</Label>
      <Select value={value} onValueChange={(v) => onChange(v as Category)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ActiveCheck({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} /> Active
    </label>
  );
}

function ImageUpload({ uploading, onFile }: { uploading: boolean; onFile: (file: File) => void }) {
  return (
    <label className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary text-secondary-foreground px-3 py-2 text-sm cursor-pointer">
      <ImagePlus className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload image"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </label>
  );
}
