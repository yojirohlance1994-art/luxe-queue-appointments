import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquareText, Upload } from "lucide-react";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews and Concerns - Glammee" },
      {
        name: "description",
        content: "Submit a review or concern using your Glammee booking reference number.",
      },
    ],
  }),
  component: ReviewsPage,
});

const createUuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

function ReviewsPage() {
  const [form, setForm] = useState({
    booking_reference: "",
    customer_name: "",
    review_type: "review",
    rating: "5",
    message: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.booking_reference.trim() || !form.message.trim()) {
      toast.error("Booking reference and message are required.");
      return;
    }

    setSubmitting(true);
    const reviewId = createUuid();
    try {
      const { data: refOk, error: refError } = await supabase.rpc("booking_reference_exists", {
        _booking_reference: form.booking_reference.trim(),
      });
      if (refError) throw refError;
      if (!refOk) {
        toast.error("We could not find that booking reference.");
        return;
      }

      const { error: reviewError } = await supabase.from("customer_reviews").insert(
        {
          id: reviewId,
          booking_reference: form.booking_reference.trim(),
          customer_name: form.customer_name.trim() || null,
          review_type: form.review_type,
          rating: form.review_type === "review" ? Number(form.rating) : null,
          message: form.message.trim(),
        },
        { returning: "minimal" },
      );
      if (reviewError) throw reviewError;

      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${reviewId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("review-photos")
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("review-photos").getPublicUrl(path);
        const { error: photoError } = await supabase
          .from("review_photos")
          .insert({ review_id: reviewId, image_url: data.publicUrl }, { returning: "minimal" });
        if (photoError) throw photoError;
      }

      toast.success("Submitted. Thank you for sharing this with us.");
      setForm({
        booking_reference: "",
        customer_name: "",
        review_type: "review",
        rating: "5",
        message: "",
      });
      setFiles([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-2xl py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Booking Reference</p>
      <h1 className="font-display text-5xl font-bold mb-4">Reviews and Concerns</h1>
      <p className="text-muted-foreground mb-8">
        Use the reference number from your booking confirmation. No customer account or email
        sign-in is needed.
      </p>

      <Card className="bg-card text-card-foreground shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" /> Submit feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Booking Reference *</Label>
              <Input
                placeholder="QM-XXXXXXXXXX"
                value={form.booking_reference}
                onChange={(e) =>
                  setForm({ ...form, booking_reference: e.target.value.toUpperCase() })
                }
                required
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.review_type}
                  onValueChange={(v) => setForm({ ...form, review_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rating</Label>
                <Select
                  value={form.rating}
                  onValueChange={(v) => setForm({ ...form, rating: v })}
                  disabled={form.review_type !== "review"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} star{n === 1 ? "" : "s"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-primary" /> Photos
              </Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              {files.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {files.length} photo(s) selected
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
