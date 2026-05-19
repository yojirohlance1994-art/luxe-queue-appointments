-- Package bundles, package-linked announcements, preset inventory domains,
-- admin review replies, and completed-booking review validation.

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS package_id uuid REFERENCES public.service_packages(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.service_package_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, service_id)
);

ALTER TABLE public.service_package_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "active package items public" ON public.service_package_items;
CREATE POLICY "active package items public"
ON public.service_package_items
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.service_packages p
    WHERE p.id = service_package_items.package_id
      AND p.active = true
  )
);

DROP POLICY IF EXISTS "admins manage package items" ON public.service_package_items;
CREATE POLICY "admins manage package items"
ON public.service_package_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.service_package_items (package_id, service_id, sort_order)
SELECT id, service_id, 1
FROM public.service_packages
ON CONFLICT (package_id, service_id) DO NOTHING;

UPDATE public.service_packages
SET active = false
WHERE name IN ('Basic Package', 'Premium Package')
  AND EXISTS (
    SELECT 1
    FROM public.service_package_items i
    WHERE i.package_id = service_packages.id
    GROUP BY i.package_id
    HAVING count(*) = 1
  );

CREATE OR REPLACE FUNCTION public.sync_package_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_package uuid;
  service_count integer;
  subtotal numeric;
  total_duration integer;
  discount numeric;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_package := OLD.package_id;
  ELSE
    target_package := NEW.package_id;
  END IF;

  SELECT count(*), COALESCE(sum(s.price), 0), COALESCE(sum(s.duration_minutes), 0)
  INTO service_count, subtotal, total_duration
  FROM public.service_package_items i
  JOIN public.services s ON s.id = i.service_id
  WHERE i.package_id = target_package;

  discount := CASE
    WHEN service_count >= 3 THEN 0.15
    WHEN service_count = 2 THEN 0.10
    ELSE 0
  END;

  UPDATE public.service_packages
  SET price = round(subtotal * (1 - discount), 0),
      duration_minutes = total_duration
  WHERE id = target_package;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS service_package_items_sync_totals_insert ON public.service_package_items;
CREATE TRIGGER service_package_items_sync_totals_insert
AFTER INSERT ON public.service_package_items
FOR EACH ROW EXECUTE FUNCTION public.sync_package_totals();

DROP TRIGGER IF EXISTS service_package_items_sync_totals_update ON public.service_package_items;
CREATE TRIGGER service_package_items_sync_totals_update
AFTER UPDATE ON public.service_package_items
FOR EACH ROW EXECUTE FUNCTION public.sync_package_totals();

DROP TRIGGER IF EXISTS service_package_items_sync_totals_delete ON public.service_package_items;
CREATE TRIGGER service_package_items_sync_totals_delete
AFTER DELETE ON public.service_package_items
FOR EACH ROW EXECUTE FUNCTION public.sync_package_totals();

CREATE OR REPLACE FUNCTION public.upsert_service_bundle(
  _name text,
  _description text,
  _service_names text[],
  _sort_order integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_package uuid;
  primary_service uuid;
BEGIN
  SELECT s.id
  INTO primary_service
  FROM unnest(_service_names) WITH ORDINALITY selected(name, ord)
  JOIN public.services s ON s.name = selected.name
  ORDER BY selected.ord
  LIMIT 1;

  IF primary_service IS NULL THEN
    RETURN;
  END IF;

  SELECT id
  INTO target_package
  FROM public.service_packages
  WHERE name = _name
  ORDER BY created_at
  LIMIT 1;

  IF target_package IS NULL THEN
    INSERT INTO public.service_packages
      (service_id, name, description, price, duration_minutes, sort_order, active)
    VALUES
      (primary_service, _name, _description, 0, 0, _sort_order, true)
    RETURNING id INTO target_package;
  ELSE
    UPDATE public.service_packages
    SET service_id = primary_service,
        description = _description,
        sort_order = _sort_order,
        active = true
    WHERE id = target_package;
  END IF;

  DELETE FROM public.service_package_items
  WHERE package_id = target_package;

  INSERT INTO public.service_package_items (package_id, service_id, sort_order)
  SELECT target_package, s.id, selected.ord::integer
  FROM unnest(_service_names) WITH ORDINALITY selected(name, ord)
  JOIN public.services s ON s.name = selected.name
  ON CONFLICT (package_id, service_id) DO UPDATE
  SET sort_order = EXCLUDED.sort_order;
END;
$$;

SELECT public.upsert_service_bundle(
  'Hair Refresh Bundle',
  'Cut, shampoo blowout, and hot oil care for a polished everyday reset.',
  ARRAY['Men & Women Hair Cut', 'Shampoo Blower', 'Hot Oil'],
  10
);

SELECT public.upsert_service_bundle(
  'Smooth & Shine Bundle',
  'Hair spa, keratin cream, and Brazilian blowout for softer, glossier hair.',
  ARRAY['Hair Spa', 'Keratin Cream', 'Brazilian Blowout'],
  20
);

SELECT public.upsert_service_bundle(
  'Gel Hands & Feet Bundle',
  'Matching gel manicure and pedicure in one clean appointment.',
  ARRAY['Gel Mani', 'Gel Pedi'],
  30
);

SELECT public.upsert_service_bundle(
  'Foot Spa Classic Bundle',
  'Luxury footspa with pedicure and classic manicure care.',
  ARRAY['Luxury Footspa', 'Pedi', 'Classic Mani'],
  40
);

SELECT public.upsert_service_bundle(
  'Lash & Brow Bundle',
  'Keratin lash lift with brow and lash tint for a fresh eye-focused finish.',
  ARRAY['Keratin Lash Lift', 'Eye Brow Tint', 'Eye Lash Tint'],
  50
);

SELECT public.upsert_service_bundle(
  'Waxing Essentials Bundle',
  'A practical grooming bundle for underarm, half leg, and whole face waxing.',
  ARRAY['Underarm Waxing', 'Half Leg Waxing', 'Whole Face Waxing'],
  60
);

SELECT public.upsert_service_bundle(
  'Massage Reset Bundle',
  'Foot, back, and legs massage combined for a focused relaxation session.',
  ARRAY['Foot Massage 30m', 'Back Massage 30m', 'Legs Massage 30m'],
  70
);

DROP FUNCTION public.upsert_service_bundle(text, text, text[], integer);

UPDATE public.service_packages p
SET price = totals.price,
    duration_minutes = totals.duration_minutes
FROM (
  SELECT
    i.package_id,
    round(
      sum(s.price) *
      (
        1 - CASE
          WHEN count(*) >= 3 THEN 0.15
          WHEN count(*) = 2 THEN 0.10
          ELSE 0
        END
      ),
      0
    ) AS price,
    COALESCE(sum(s.duration_minutes), 0)::integer AS duration_minutes
  FROM public.service_package_items i
  JOIN public.services s ON s.id = i.service_id
  GROUP BY i.package_id
) totals
WHERE p.id = totals.package_id;

ALTER TABLE public.inventory_items
  DROP CONSTRAINT IF EXISTS inventory_items_category_check;

UPDATE public.inventory_items
SET category = 'General Salon Supplies'
WHERE category IS NULL
   OR category NOT IN (
    'Hair Care',
    'Nail Care',
    'Body & Massage',
    'Eyelash & Waxing',
    'General Salon Supplies'
  );

ALTER TABLE public.inventory_items
  ALTER COLUMN category SET DEFAULT 'General Salon Supplies',
  ALTER COLUMN category SET NOT NULL,
  ADD CONSTRAINT inventory_items_category_check CHECK (
    category IN (
      'Hair Care',
      'Nail Care',
      'Body & Massage',
      'Eyelash & Waxing',
      'General Salon Supplies'
    )
  );

ALTER TABLE public.customer_reviews
  ADD COLUMN IF NOT EXISTS admin_reply text,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz;

CREATE OR REPLACE FUNCTION public.booking_can_review(_booking_reference text)
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
      AND status IN ('completed', 'in_service')
  );
$$;

GRANT EXECUTE ON FUNCTION public.booking_can_review(text) TO anon, authenticated;

DROP POLICY IF EXISTS "customers submit reviews by booking reference" ON public.customer_reviews;
DROP POLICY IF EXISTS "customers submit reviews by completed booking" ON public.customer_reviews;
CREATE POLICY "customers submit reviews by completed booking"
ON public.customer_reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (public.booking_can_review(booking_reference));
