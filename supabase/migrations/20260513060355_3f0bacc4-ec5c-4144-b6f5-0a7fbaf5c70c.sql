
CREATE TABLE IF NOT EXISTS public.service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active packages public" ON public.service_packages
  FOR SELECT TO anon, authenticated USING (active = true);

CREATE POLICY "admins manage packages" ON public.service_packages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON public.service_packages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS package_id uuid REFERENCES public.service_packages(id) ON DELETE SET NULL;

-- Seed two simple packages per service
INSERT INTO public.service_packages (service_id, name, description, price, duration_minutes, sort_order)
SELECT s.id, 'Basic Package', 'Standard service with essentials included.', s.price, s.duration_minutes, 1
FROM public.services s
WHERE NOT EXISTS (SELECT 1 FROM public.service_packages p WHERE p.service_id = s.id);

INSERT INTO public.service_packages (service_id, name, description, price, duration_minutes, sort_order)
SELECT s.id, 'Premium Package', 'Extended care with premium add-ons.', s.price * 1.6, s.duration_minutes + 30, 2
FROM public.services s
WHERE NOT EXISTS (SELECT 1 FROM public.service_packages p WHERE p.service_id = s.id AND p.name = 'Premium Package');
