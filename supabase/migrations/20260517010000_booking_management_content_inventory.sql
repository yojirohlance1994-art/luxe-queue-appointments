-- Booking reference identity, customer reviews, content, inventory,
-- staff availability, cancellation metadata, and official service prices.

ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'lashes';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'waxing';

-- Appointments: booking-reference customer identity + cancellation flow.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS booking_reference text,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_by text,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'QM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
$$;

UPDATE public.appointments
SET booking_reference = public.generate_booking_reference()
WHERE booking_reference IS NULL;

ALTER TABLE public.appointments
  ALTER COLUMN booking_reference SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS appointments_booking_reference_key
ON public.appointments (booking_reference);

CREATE OR REPLACE FUNCTION public.set_booking_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_reference IS NULL OR btrim(NEW.booking_reference) = '' THEN
    NEW.booking_reference := public.generate_booking_reference();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS appointments_booking_reference_set ON public.appointments;
CREATE TRIGGER appointments_booking_reference_set
BEFORE INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.set_booking_reference();

CREATE OR REPLACE FUNCTION public.booking_reference_exists(_booking_reference text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.appointments
    WHERE booking_reference = _booking_reference
  );
$$;

GRANT EXECUTE ON FUNCTION public.booking_reference_exists(text) TO anon, authenticated;

-- Reviews / complaints.
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference text NOT NULL,
  customer_name text,
  rating integer CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  review_type text NOT NULL DEFAULT 'review'
    CHECK (review_type IN ('review', 'complaint')),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewed', 'resolved', 'hidden')),
  public_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers submit reviews by booking reference" ON public.customer_reviews;
CREATE POLICY "customers submit reviews by booking reference"
ON public.customer_reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (public.booking_reference_exists(booking_reference));

DROP POLICY IF EXISTS "public reads visible reviews" ON public.customer_reviews;
CREATE POLICY "public reads visible reviews"
ON public.customer_reviews
FOR SELECT
TO anon, authenticated
USING (
  public_visible = true
  AND status = 'reviewed'
  AND review_type = 'review'
);

DROP POLICY IF EXISTS "admins manage customer reviews" ON public.customer_reviews;
CREATE POLICY "admins manage customer reviews"
ON public.customer_reviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS customer_reviews_touch ON public.customer_reviews;
CREATE TRIGGER customer_reviews_touch
BEFORE UPDATE ON public.customer_reviews
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.review_exists(_review_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.customer_reviews
    WHERE id = _review_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.review_exists(uuid) TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.review_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.customer_reviews(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers submit review photos" ON public.review_photos;
CREATE POLICY "customers submit review photos"
ON public.review_photos
FOR INSERT
TO anon, authenticated
WITH CHECK (public.review_exists(review_id));

DROP POLICY IF EXISTS "public reads visible review photos" ON public.review_photos;
CREATE POLICY "public reads visible review photos"
ON public.review_photos
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customer_reviews r
    WHERE r.id = review_photos.review_id
      AND r.public_visible = true
      AND r.status = 'reviewed'
      AND r.review_type = 'review'
  )
);

DROP POLICY IF EXISTS "admins manage review photos" ON public.review_photos;
CREATE POLICY "admins manage review photos"
ON public.review_photos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Announcements.
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "active announcements public" ON public.announcements;
CREATE POLICY "active announcements public"
ON public.announcements
FOR SELECT
TO anon, authenticated
USING (
  active = true
  AND (starts_at IS NULL OR starts_at <= now())
  AND (ends_at IS NULL OR ends_at >= now())
);

DROP POLICY IF EXISTS "admins manage announcements" ON public.announcements;
CREATE POLICY "admins manage announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS announcements_touch ON public.announcements;
CREATE TRIGGER announcements_touch
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- Packages: tie to announcements and add validity dates.
ALTER TABLE public.service_packages
  ADD COLUMN IF NOT EXISTS announcement_id uuid REFERENCES public.announcements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz;

-- Inventory.
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  category text,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit text NOT NULL DEFAULT 'pcs',
  reorder_level integer NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins manage inventory" ON public.inventory_items;
CREATE POLICY "admins manage inventory"
ON public.inventory_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS inventory_items_touch ON public.inventory_items;
CREATE TRIGGER inventory_items_touch
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- Staff availability.
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS work_days jsonb NOT NULL DEFAULT '["mon","tue","wed","thu","fri","sat","sun"]'::jsonb,
  ADD COLUMN IF NOT EXISTS schedule_notes text;

CREATE TABLE IF NOT EXISTS public.staff_unavailability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  unavailable_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, unavailable_date)
);

ALTER TABLE public.staff_unavailability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff unavailability public" ON public.staff_unavailability;
CREATE POLICY "staff unavailability public"
ON public.staff_unavailability
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admins manage staff unavailability" ON public.staff_unavailability;
CREATE POLICY "admins manage staff unavailability"
ON public.staff_unavailability
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage buckets.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('review-photos', 'review-photos', true),
  ('announcement-images', 'announcement-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "review photos public read" ON storage.objects;
CREATE POLICY "review photos public read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "anyone uploads review photos" ON storage.objects;
CREATE POLICY "anyone uploads review photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "announcement images public read" ON storage.objects;
CREATE POLICY "announcement images public read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'announcement-images');

DROP POLICY IF EXISTS "admins manage announcement images" ON storage.objects;
CREATE POLICY "admins manage announcement images"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'announcement-images'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'announcement-images'
  AND public.has_role(auth.uid(), 'admin')
);
