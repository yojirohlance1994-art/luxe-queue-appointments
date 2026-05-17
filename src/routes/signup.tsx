import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "No Account Needed - Glammee" },
      {
        name: "description",
        content: "Glammee bookings use booking reference numbers instead of customer accounts.",
      },
    ],
  }),
  component: SignupDisabledPage,
});

function SignupDisabledPage() {
  return (
    <div className="container mx-auto px-4 max-w-xl py-20 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">No signup required</p>
      <h1 className="font-display text-4xl font-bold mb-4">Book with a reference number</h1>
      <p className="text-muted-foreground mb-8">
        Glammee does not use customer email accounts, OTPs, or verification links. Book an
        appointment and keep the booking reference number for reviews or concerns.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-gradient-primary text-primary-foreground">
          <Link to="/booking">Book Appointment</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/reviews">Submit Review</Link>
        </Button>
      </div>
    </div>
  );
}
