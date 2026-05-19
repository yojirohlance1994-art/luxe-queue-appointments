-- Staff-aware multi-service bookings.
-- This keeps appointments.service_id for backwards compatibility and adds
-- structured service/staff line items for new bookings.

CREATE TABLE IF NOT EXISTS public.staff_service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  category public.service_category NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, category)
);

INSERT INTO public.staff_service_categories (staff_id, category)
SELECT id, category
FROM public.staff
ON CONFLICT (staff_id, category) DO NOTHING;

ALTER TABLE public.staff_service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff service categories public" ON public.staff_service_categories;
CREATE POLICY "staff service categories public"
ON public.staff_service_categories
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admins manage staff service categories" ON public.staff_service_categories;
CREATE POLICY "admins manage staff service categories"
ON public.staff_service_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.appointment_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  price numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS appointment_services_appointment_idx
ON public.appointment_services (appointment_id, sort_order);

CREATE INDEX IF NOT EXISTS appointment_services_staff_time_idx
ON public.appointment_services (staff_id, starts_at, ends_at);

ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointment service lines public insert" ON public.appointment_services;
CREATE POLICY "appointment service lines public insert"
ON public.appointment_services
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "appointment service lines public read" ON public.appointment_services;
CREATE POLICY "appointment service lines public read"
ON public.appointment_services
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admins manage appointment service lines" ON public.appointment_services;
CREATE POLICY "admins manage appointment service lines"
ON public.appointment_services
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.assert_appointment_service_available()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  service_category public.service_category;
  staff_work_days jsonb;
  staff_active boolean;
  local_day text;
  local_date date;
BEGIN
  SELECT category
  INTO service_category
  FROM public.services
  WHERE id = NEW.service_id
    AND active = true;

  IF service_category IS NULL THEN
    RAISE EXCEPTION 'Selected service is not available.';
  END IF;

  SELECT active, work_days
  INTO staff_active, staff_work_days
  FROM public.staff
  WHERE id = NEW.staff_id;

  IF staff_active IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Selected staff member is not available.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.staff_service_categories ssc
    WHERE ssc.staff_id = NEW.staff_id
      AND ssc.category = service_category
  ) THEN
    RAISE EXCEPTION 'Selected staff member does not handle this service category.';
  END IF;

  local_day := trim(lower(to_char(NEW.starts_at AT TIME ZONE 'Asia/Manila', 'dy')));
  local_date := (NEW.starts_at AT TIME ZONE 'Asia/Manila')::date;

  IF NOT (COALESCE(staff_work_days, '[]'::jsonb) ? local_day) THEN
    RAISE EXCEPTION 'Selected staff member is off on this day.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.staff_unavailability su
    WHERE su.staff_id = NEW.staff_id
      AND su.unavailable_date = local_date
  ) THEN
    RAISE EXCEPTION 'Selected staff member is unavailable on this date.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointment_services existing
    JOIN public.appointments appointment ON appointment.id = existing.appointment_id
    WHERE existing.staff_id = NEW.staff_id
      AND existing.id <> COALESCE(NEW.id, gen_random_uuid())
      AND appointment.status NOT IN ('cancelled', 'declined', 'completed')
      AND tstzrange(existing.starts_at, existing.ends_at, '[)') &&
          tstzrange(NEW.starts_at, NEW.ends_at, '[)')
  ) THEN
    RAISE EXCEPTION 'Selected staff member is already booked for this time.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS appointment_services_availability_check ON public.appointment_services;
CREATE TRIGGER appointment_services_availability_check
BEFORE INSERT OR UPDATE ON public.appointment_services
FOR EACH ROW
EXECUTE FUNCTION public.assert_appointment_service_available();

GRANT EXECUTE ON FUNCTION public.assert_appointment_service_available() TO anon, authenticated;
