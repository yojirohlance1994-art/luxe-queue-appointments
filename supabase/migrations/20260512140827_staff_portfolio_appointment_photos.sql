
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'in_service';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'declined';

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS concern text;

CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'Stylist',
  seniority text NOT NULL DEFAULT 'Junior',
  bio text,
  category public.service_category NOT NULL DEFAULT 'hair',
  image_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "active staff are public" ON public.staff;
CREATE POLICY "active staff are public" ON public.staff FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "admins manage staff" ON public.staff;
CREATE POLICY "admins manage staff" ON public.staff FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS staff_touch ON public.staff;
CREATE TRIGGER staff_touch BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category public.service_category NOT NULL DEFAULT 'hair',
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "active portfolio public" ON public.portfolio_items;
CREATE POLICY "active portfolio public" ON public.portfolio_items FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "admins manage portfolio" ON public.portfolio_items;
CREATE POLICY "admins manage portfolio" ON public.portfolio_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS portfolio_touch ON public.portfolio_items;
CREATE TRIGGER portfolio_touch BEFORE UPDATE ON public.portfolio_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.appointment_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointment_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins manage appointment photos" ON public.appointment_photos;
CREATE POLICY "admins manage appointment photos" ON public.appointment_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public) VALUES ('staff-photos', 'staff-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('appointment-proofs', 'appointment-proofs', false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "staff photos public read" ON storage.objects;
CREATE POLICY "staff photos public read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'staff-photos');
DROP POLICY IF EXISTS "portfolio public read" ON storage.objects;
CREATE POLICY "portfolio public read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
DROP POLICY IF EXISTS "admins manage staff photos" ON storage.objects;
CREATE POLICY "admins manage staff photos" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'staff-photos' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'staff-photos' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins manage portfolio bucket" ON storage.objects;
CREATE POLICY "admins manage portfolio bucket" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins manage appointment proofs" ON storage.objects;
CREATE POLICY "admins manage appointment proofs" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'appointment-proofs' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'appointment-proofs' AND public.has_role(auth.uid(), 'admin'));
