import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - Glammee Salon" },
      {
        name: "description",
        content: "Learn about Glammee, a neighborhood hair, nail and beauty salon.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-20 max-w-3xl">
      <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Our Story</p>
      <h1 className="font-display text-5xl font-bold mb-6 text-gradient">About Glammee</h1>
      <p className="text-foreground/90 leading-relaxed mb-4">
        Glammee was born from a simple idea: beauty should feel personal, never rushed. Tucked into
        the heart of the neighborhood, our salon is a calm, light-filled space designed to slow you
        down - somewhere you can step away from the noise of the day and be genuinely cared for.
      </p>
      <p className="text-foreground/80 leading-relaxed mb-4">
        From the moment you walk in, we want you to feel at home. A warm hello, your favorite drink
        in hand, soft music in the background, and a stylist who actually listens. Whether you're
        here for a fresh cut, a glossy gel set, fluttery lashes, or a full event-ready look, every
        service is built around what suits <em>you</em> - your hair, your features, your lifestyle.
      </p>
      <p className="text-foreground/80 leading-relaxed mb-4">
        Our team of stylists, nail artists, and beauty experts bring years of training and a real
        love for the craft. We invest in education, premium products, and gentle techniques because
        honest care and real results matter more than trends. No pressure, no upselling - just
        thoughtful work and small luxuries that make a big difference.
      </p>
      <p className="text-foreground/80 leading-relaxed mb-12">
        Come as you are. Leave feeling unmistakably you, only fresher. We can't wait to meet you.
      </p>

      <div id="terms" className="border-t border-border pt-10">
        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Terms and Conditions
        </p>
        <h2 className="font-display text-3xl font-bold mb-5">Terms and Conditions</h2>
        <div className="space-y-5 text-foreground/80 leading-relaxed">
          <p>
            By booking an appointment or using the Glammee website, you agree to these terms and
            conditions. Please review them before submitting a booking, review, or concern.
          </p>
          <p>
            Appointments are subject to staff availability, service duration, and confirmation by
            Glammee. Please provide accurate contact details so we can confirm, update, or clarify
            your booking when needed.
          </p>
          <p>
            Prices shown on the website are listed in Philippine Peso and may vary for services
            marked with plus signs, ranges, or notes. Final pricing may depend on hair length,
            product usage, service complexity, or consultation results.
          </p>
          <p>
            Please arrive on time for your appointment. Late arrivals may require rescheduling or
            adjustment of the selected service if there is not enough time to complete it properly.
          </p>
          <p>
            Cancellations, declined bookings, or schedule changes may be handled by Glammee staff
            through the admin queue. If you need to cancel or change your visit, contact the salon
            as early as possible.
          </p>
          <p>
            Reviews and concerns may be submitted only with a valid booking reference after the
            appointment has been completed or the service has started. Public reviews may be
            reviewed, replied to, approved, hidden, or removed by Glammee administrators.
          </p>
          <p>
            Photos submitted with reviews or uploaded for salon records must be appropriate and
            related to the service. Glammee may remove content that is abusive, misleading,
            unrelated, or harmful.
          </p>
          <p>
            Customer information is used for appointment handling, service records, communication,
            and customer support. Glammee does not require customers to provide unnecessary personal
            information through the public booking form.
          </p>
          <p>
            Glammee may update services, prices, staff availability, website content, and these
            terms when needed. Continued use of the website means you accept the latest version
            shown on this page.
          </p>
        </div>
      </div>
    </section>
  );
}
