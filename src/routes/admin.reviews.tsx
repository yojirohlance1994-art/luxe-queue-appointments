import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { MessageSquareReply, Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviewsPage,
});

type Review = {
  id: string;
  booking_reference: string;
  customer_name: string | null;
  rating: number | null;
  review_type: string;
  message: string;
  status: string;
  public_visible: boolean;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  review_photos?: { id: string; image_url: string }[];
};

type ReviewChanges = Pick<
  Review,
  "status" | "public_visible" | "admin_reply" | "replied_at"
>;

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*, review_photos(id, image_url)")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    const rows = (data as Review[]) ?? [];
    setReviews(rows);
    setDraftReplies(Object.fromEntries(rows.map((review) => [review.id, review.admin_reply ?? ""])));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateReview = async (id: string, changes: Partial<ReviewChanges>) => {
    const { error } = await supabase.from("customer_reviews").update(changes).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review updated");
    load();
  };

  const updateStatus = async (review: Review, status: string) => {
    const changes: Partial<ReviewChanges> = { status };

    if (status === "reviewed" && review.review_type === "review") {
      changes.public_visible = true;
    }

    if (status === "hidden") {
      changes.public_visible = false;
    }

    updateReview(review.id, changes);
  };

  const reply = async (review: Review) => {
    const adminReply = draftReplies[review.id]?.trim() ?? "";
    const { error } = await supabase
      .from("customer_reviews")
      .update({ admin_reply: adminReply || null, replied_at: adminReply ? new Date().toISOString() : null })
      .eq("id", review.id);
    if (error) return toast.error(error.message);
    toast.success(adminReply ? "Reply saved" : "Reply cleared");
    load();
  };

  const removeReview = async (id: string) => {
    if (!confirm("Delete this review and its photos?")) return;
    const { error } = await supabase.from("customer_reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    load();
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 animate-float-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Reviews</p>
          <h1 className="font-display text-4xl font-bold">Customer Review Management</h1>
          <p className="text-muted-foreground mt-1">
            Review submitted text and photos, reply to feedback, publish valid reviews, or delete
            harmful entries.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="border-white/10 bg-transparent text-foreground"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </header>

      <div className="grid gap-4">
        {reviews.length === 0 && (
          <Card className="bg-surface-1 border-white/5 text-foreground p-6">
            <p className="text-sm text-muted-foreground">No submitted reviews yet.</p>
          </Card>
        )}
        {reviews.map((review) => (
          <Card key={review.id} className="bg-surface-1 border-white/5 text-foreground p-5">
            <div className="grid lg:grid-cols-[1fr_280px] gap-5">
              <div className="space-y-4 min-w-0">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-primary">
                    <span>{review.review_type}</span>
                    <span>{review.booking_reference}</span>
                    <span>{new Date(review.created_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-2xl">
                      {review.customer_name || "Glammee Client"}
                    </h3>
                    {review.rating && (
                      <span className="inline-flex items-center gap-1 text-primary text-sm">
                        <Star className="h-4 w-4 fill-primary" /> {review.rating}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-foreground/75 whitespace-pre-wrap">
                  {review.message}
                </p>

                {review.review_photos && review.review_photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {review.review_photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block aspect-square overflow-hidden rounded-lg border border-white/10 bg-surface-2"
                      >
                        <img
                          src={photo.image_url}
                          alt="Submitted review"
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}

                <div>
                  <Label className="flex items-center gap-2">
                    <MessageSquareReply className="h-4 w-4 text-primary" /> Admin reply
                  </Label>
                  <Textarea
                    rows={3}
                    value={draftReplies[review.id] ?? ""}
                    onChange={(event) =>
                      setDraftReplies({ ...draftReplies, [review.id]: event.target.value })
                    }
                    className="mt-2"
                  />
                  {review.replied_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last replied {new Date(review.replied_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={review.status}
                    onValueChange={(value) => updateStatus(review, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full bg-gradient-primary text-primary-foreground"
                  onClick={() => reply(review)}
                >
                  Save reply
                </Button>
                <Button
                  variant={review.public_visible ? "default" : "outline"}
                  className="w-full"
                  onClick={() => updateReview(review.id, { public_visible: !review.public_visible })}
                >
                  {review.public_visible ? "Visible publicly" : "Hidden publicly"}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => removeReview(review.id)}
                >
                  <Trash2 className="h-4 w-4" /> Delete review
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
